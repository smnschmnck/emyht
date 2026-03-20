package authService

import (
	"chat/db"
	"chat/middleware"
	"chat/queries"
	"chat/s3Helpers"
	"chat/userService"
	"context"
	"net/http"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v5"
)

var validate = validator.New()
var usernamePattern = regexp.MustCompile(`^[a-zA-Z0-9._-]{1,32}$`)

type UserRes struct {
	UUID              string `json:"uuid"`
	Email             string `json:"email"`
	Username          string `json:"username"`
	ProfilePictureUrl string `json:"profilePictureUrl"`
}

func GetUser(c *echo.Context) error {
	reqUUID, err := middleware.GetUserUUID(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	user, err := userService.GetUserByUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusNotFound, "USER NOT FOUND")
	}

	formattedProfilePic := s3Helpers.FormatPictureUrl(user.PictureUrl)

	res := UserRes{
		UUID:              user.ID.String(),
		Email:             user.Email,
		Username:          user.Username,
		ProfilePictureUrl: formattedProfilePic,
	}
	return c.JSON(http.StatusOK, res)
}

func ChangeUsername(c *echo.Context) error {
	reqUUID, err := middleware.GetUserUUID(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type ChangeReq struct {
		NewUsername string `json:"newUsername" validate:"required"`
	}
	changeReq := new(ChangeReq)
	err = c.Bind(&changeReq)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(changeReq)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	if !isValidUsername(changeReq.NewUsername) {
		return c.String(http.StatusBadRequest, "INVALID USERNAME")
	}
	newUsername := strings.TrimSpace(changeReq.NewUsername)

	conn := db.GetDB()
	_, err = conn.UpdateUsername(context.Background(), queries.UpdateUsernameParams{Username: newUsername, ID: reqUUID})
	if err != nil {
		return c.String(http.StatusInternalServerError, "COULD NOT CHANGE USERNAME")
	}

	return c.String(http.StatusOK, "SUCCESS")
}

func isValidUsername(username string) bool {
	trimmed := strings.TrimSpace(username)
	return usernamePattern.MatchString(trimmed)
}
