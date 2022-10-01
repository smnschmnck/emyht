package userSettingsService

import (
	"chat/authService"
	"chat/s3Helpers"
	"chat/userService"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

func GetChangeProfilePicturePutURL(c echo.Context) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	uuid, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	//TODO: expect different file types
	picName := uuid + "/profilePicture.png"

	const MEGABYTE int64 = 1000

	presignedPutUrl, err := s3Helpers.PresignPutObject(picName, time.Hour, 5*MEGABYTE)
	if err != nil {
		c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	type res struct {
		PresignedPutUrl string `json:"presignedPutURL"`
	}

	return c.JSON(http.StatusOK, res{PresignedPutUrl: presignedPutUrl})
}
