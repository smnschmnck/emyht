package middleware

import (
	"chat/db"
	"chat/queries"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"math/rand"
	"net/http"
	"net/mail"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v3"
	"github.com/auth0/go-jwt-middleware/v3/jwks"
	"github.com/auth0/go-jwt-middleware/v3/validator"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v5"
)

type contextKey string

const userUUIDKey contextKey = "userUUID"
const maxUsernameLength = 32
const maxEmailLength = 64
const maxPictureURLLength = 128

var errNotAuthorized = errors.New("not authorized")
var endUserSubjectPattern = regexp.MustCompile(`^[A-Za-z0-9_-]+\|[A-Za-z0-9_-]+$`)
var invalidUsernameChars = regexp.MustCompile(`[^a-zA-Z0-9._-]`)

// Auth0CustomClaims holds the namespaced custom claims added via an Auth0 post-login Action.
// The namespace (https://emyht.com/) is required by Auth0 for custom access token claims.
type Auth0CustomClaims struct {
	Email         string `json:"https://emyht.com/email"`
	Username      string `json:"https://emyht.com/username"`
	EmailVerified *bool  `json:"https://emyht.com/email_verified"`
	Picture       string `json:"https://emyht.com/picture"`
}

func (c *Auth0CustomClaims) Validate(_ context.Context) error {
	if !isValidEmail(c.Email) {
		return errors.New("missing or invalid email claim")
	}

	if c.EmailVerified != nil && !*c.EmailVerified {
		return errors.New("email is not verified")
	}

	if c.Username != "" && !isValidUsername(c.Username) {
		return errors.New("invalid username claim")
	}

	return nil
}

// GetUserUUID retrieves the authenticated user's database UUID from the request context.
func GetUserUUID(c *echo.Context) (pgtype.UUID, error) {
	uuid, ok := c.Request().Context().Value(userUUIDKey).(pgtype.UUID)
	if !ok {
		return pgtype.UUID{}, echo.NewHTTPError(http.StatusUnauthorized, "NOT AUTHORIZED")
	}
	return uuid, nil
}

// Auth returns Echo middleware that validates Auth0 JWT tokens and resolves users.
func Auth() echo.MiddlewareFunc {
	auth0Domain := os.Getenv("AUTH0_DOMAIN")
	auth0Audience := os.Getenv("AUTH0_AUDIENCE")

	domain := strings.TrimRight(auth0Domain, "/")
	domain = strings.TrimPrefix(domain, "https://")
	domain = strings.TrimPrefix(domain, "http://")

	issuerURL, err := url.Parse("https://" + domain + "/")
	if err != nil {
		log.Fatalf("Failed to parse Auth0 issuer URL: %v", err)
	}

	provider, err := jwks.NewCachingProvider(
		jwks.WithIssuerURL(issuerURL),
	)
	if err != nil {
		log.Fatalf("Failed to create JWKS provider: %v", err)
	}

	jwtValidator, err := validator.New(
		validator.WithKeyFunc(provider.KeyFunc),
		validator.WithAlgorithm(validator.RS256),
		validator.WithIssuer(issuerURL.String()),
		validator.WithAudience(auth0Audience),
		validator.WithCustomClaims(func() *Auth0CustomClaims {
			return &Auth0CustomClaims{}
		}),
	)
	if err != nil {
		log.Fatalf("Failed to create JWT validator: %v", err)
	}

	jwtMW, err := jwtmiddleware.New(
		jwtmiddleware.WithValidator(jwtValidator),
		jwtmiddleware.WithErrorHandler(func(w http.ResponseWriter, r *http.Request, err error) {
			log.Printf("[AUTH] JWT validation failed: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error":             "invalid_token",
				"error_description": "Token validation failed",
			})
		}),
	)
	if err != nil {
		log.Fatalf("Failed to create JWT middleware: %v", err)
	}

	log.Printf("[AUTH] Auth0 middleware initialized: issuer=%s audience=%s", issuerURL.String(), auth0Audience)

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			var handlerCalled bool

			innerHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				handlerCalled = true
				c.SetRequest(r)
			})

			wrapped := jwtMW.CheckJWT(innerHandler)
			wrapped.ServeHTTP(c.Response(), c.Request())

			if !handlerCalled {
				return nil
			}

			claims, err := jwtmiddleware.GetClaims[*validator.ValidatedClaims](c.Request().Context())
			if err != nil {
				return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
			}

			sub := claims.RegisteredClaims.Subject
			if !isEndUserSubject(sub) {
				return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
			}

			var email, username, pictureURL string
			var emailVerified *bool
			if custom, ok := claims.CustomClaims.(*Auth0CustomClaims); ok {
				email = custom.Email
				username = custom.Username
				emailVerified = custom.EmailVerified
				pictureURL = custom.Picture
			}

			if pictureURL == "" {
				pictureURL = getStringClaimFromBearerToken(c.Request().Header.Get("Authorization"), "picture")
			}
			if pictureURL == "" {
				pictureURL = getStringClaimFromBearerToken(c.Request().Header.Get("Authorization"), "https://emyht.com/picture")
			}

			userUUID, err := resolveUser(sub, email, username, pictureURL, emailVerified)
			if err != nil {
				if errors.Is(err, errNotAuthorized) {
					return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
				}
				log.Printf("Failed to resolve user for sub %s: %v", sub, err)
				return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
			}

			ctx := context.WithValue(c.Request().Context(), userUUIDKey, userUUID)
			c.SetRequest(c.Request().WithContext(ctx))

			return next(c)
		}
	}
}

func isEndUserSubject(sub string) bool {
	if strings.HasSuffix(sub, "@clients") {
		return false
	}

	return endUserSubjectPattern.MatchString(sub)
}

// resolveUser finds or creates a user by their Auth0 sub claim.
// Email and verified status are required in the custom JWT claims.
// If email claims are missing, only pre-existing users can be resolved.
func resolveUser(sub string, email string, username string, pictureURL string, emailVerified *bool) (pgtype.UUID, error) {
	conn := db.GetDB()
	normalizedEmail := strings.ToLower(strings.TrimSpace(email))

	if normalizedEmail != "" {
		if emailVerified != nil && !*emailVerified {
			return pgtype.UUID{}, errNotAuthorized
		}
		if !isValidEmail(normalizedEmail) {
			return pgtype.UUID{}, errNotAuthorized
		}

		// We have the email from the token — upsert to create or sync email.
		// Existing usernames are preserved, and default avatars can be upgraded to social avatars.
		insertUsername := normalizeUsername(username, normalizedEmail)
		insertPictureURL := normalizePictureURL(pictureURL)

		user, err := conn.UpsertUser(context.Background(), queries.UpsertUserParams{
			Auth0Sub:   sub,
			Email:      normalizedEmail,
			Username:   insertUsername,
			PictureUrl: insertPictureURL,
		})
		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" && pgErr.ConstraintName == "users_email_key" {
				return pgtype.UUID{}, errNotAuthorized
			}
			return pgtype.UUID{}, err
		}
		return user.ID, nil
	}

	// No email in token — allow only pre-existing users.
	user, err := conn.GetUserBySub(context.Background(), sub)
	if err == nil {
		return user.ID, nil
	}

	return pgtype.UUID{}, errNotAuthorized
}

func isValidEmail(email string) bool {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" || len(email) > maxEmailLength {
		return false
	}
	parsed, err := mail.ParseAddress(email)
	if err != nil {
		return false
	}
	return strings.EqualFold(parsed.Address, email)
}

func isValidUsername(username string) bool {
	trimmed := strings.TrimSpace(username)
	if trimmed == "" || len(trimmed) > maxUsernameLength {
		return false
	}
	return !invalidUsernameChars.MatchString(trimmed)
}

func normalizeUsername(claimUsername string, email string) string {
	candidate := strings.TrimSpace(claimUsername)
	if candidate == "" {
		candidate = strings.SplitN(email, "@", 2)[0]
	}

	candidate = strings.TrimSpace(candidate)
	candidate = invalidUsernameChars.ReplaceAllString(candidate, "")
	if len(candidate) > maxUsernameLength {
		candidate = candidate[:maxUsernameLength]
	}
	if candidate == "" {
		candidate = "user" + strconv.Itoa(rand.Intn(1000000))
	}

	return candidate
}

func normalizePictureURL(claimPictureURL string) string {
	pictureURL := strings.TrimSpace(claimPictureURL)
	if pictureURL == "" {
		return randomDefaultProfilePicture()
	}
	if len(pictureURL) > maxPictureURLLength {
		return randomDefaultProfilePicture()
	}

	parsed, err := url.Parse(pictureURL)
	if err != nil || !parsed.IsAbs() {
		return randomDefaultProfilePicture()
	}
	if parsed.Scheme != "https" && parsed.Scheme != "http" {
		return randomDefaultProfilePicture()
	}

	return pictureURL
}

func randomDefaultProfilePicture() string {
	return "default_" + strconv.Itoa(rand.Intn(10))
}

func getStringClaimFromBearerToken(authHeader string, claimKey string) string {
	token := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
	if token == "" || token == authHeader {
		return ""
	}

	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return ""
	}

	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return ""
	}

	var claims map[string]any
	if err := json.Unmarshal(payload, &claims); err != nil {
		return ""
	}

	value, ok := claims[claimKey].(string)
	if !ok {
		return ""
	}

	return strings.TrimSpace(value)
}
