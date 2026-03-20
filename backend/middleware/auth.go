package middleware

import (
	"chat/db"
	"chat/queries"
	"context"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v3"
	"github.com/auth0/go-jwt-middleware/v3/jwks"
	"github.com/auth0/go-jwt-middleware/v3/validator"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v5"
)

type contextKey string

const userUUIDKey contextKey = "userUUID"

// Auth0CustomClaims holds the namespaced custom claims added via an Auth0 post-login Action.
// The namespace (https://emyht.com/) is required by Auth0 for custom access token claims.
type Auth0CustomClaims struct {
	Email    string `json:"https://emyht.com/email"`
	Username string `json:"https://emyht.com/username"`
}

func (c *Auth0CustomClaims) Validate(_ context.Context) error {
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
			w.Write([]byte(`{"error":"invalid_token","error_description":"` + err.Error() + `"}`))
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

			var email, username string
			if custom, ok := claims.CustomClaims.(*Auth0CustomClaims); ok {
				email = custom.Email
				username = custom.Username
			}

			userUUID, err := resolveUser(sub, email, username)
			if err != nil {
				log.Printf("Failed to resolve user for sub %s: %v", sub, err)
				return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
			}

			ctx := context.WithValue(c.Request().Context(), userUUIDKey, userUUID)
			c.SetRequest(c.Request().WithContext(ctx))

			return next(c)
		}
	}
}

// resolveUser finds or creates a user by their Auth0 sub claim.
// If email is available from custom JWT claims, it is synced via upsert.
// If not (no Auth0 Action configured yet), it falls back to lookup-only,
// creating with a placeholder email on first encounter.
func resolveUser(sub string, email string, username string) (pgtype.UUID, error) {
	conn := db.GetDB()

	if email != "" {
		// We have the email from the token — upsert to create or sync email.
		// The ON CONFLICT only updates email, never overwrites username/picture.
		insertUsername := username
		if insertUsername == "" {
			insertUsername = strings.SplitN(email, "@", 2)[0]
		}

		user, err := conn.UpsertUser(context.Background(), queries.UpsertUserParams{
			Auth0Sub:   sub,
			Email:      email,
			Username:   insertUsername,
			PictureUrl: "default_" + strconv.Itoa(rand.Intn(10)),
		})
		if err != nil {
			return pgtype.UUID{}, err
		}
		return user.ID, nil
	}

	// No email in token — try to find existing user first
	user, err := conn.GetUserBySub(context.Background(), sub)
	if err == nil {
		return user.ID, nil
	}

	// First-time user, no custom claims configured yet — create with placeholder
	fallbackUsername := "user"
	parts := strings.SplitN(sub, "|", 2)
	if len(parts) == 2 && len(parts[1]) >= 6 {
		fallbackUsername = "user_" + parts[1][:6]
	}

	newUser, err := conn.UpsertUser(context.Background(), queries.UpsertUserParams{
		Auth0Sub:   sub,
		Email:      sub + "@pending",
		Username:   fallbackUsername,
		PictureUrl: "default_" + strconv.Itoa(rand.Intn(10)),
	})
	if err != nil {
		return pgtype.UUID{}, err
	}

	return newUser.ID, nil
}
