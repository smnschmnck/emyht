package userSettingsService

import (
	"chat/authService"
	"chat/s3Helpers"
	"chat/userService"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

var validate = validator.New()

func GetChangeProfilePicturePutURL(c echo.Context) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	uuid, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	const MEGABYTE int64 = 1000000
	const MAX_SIZE = 5 * MEGABYTE
	type reqBody struct {
		ContentLength int64 `json:"contentLength" validate:"required"`
	}
	req := new(reqBody)
	err = c.Bind(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	if req.ContentLength > MAX_SIZE {
		return c.String(http.StatusBadRequest, "FILE TOO BIG")
	}

	//TODO: expect different file types
	picName := uuid + "/profilePicture.png"

	presignedPutUrl, err := s3Helpers.PresignPutObject(picName, time.Hour, req.ContentLength+345)
	if err != nil {
		c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	type res struct {
		PresignedPutUrl string `json:"presignedPutURL"`
	}

	return c.JSON(http.StatusOK, res{PresignedPutUrl: presignedPutUrl})
}
