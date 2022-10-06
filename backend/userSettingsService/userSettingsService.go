package userSettingsService

import (
	"chat/authService"
	"chat/s3Helpers"
	"chat/userService"
	"net/http"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

var validate = validator.New()

func GetChangeProfilePicturePutURL(c echo.Context) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
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
	imageID := uuid.New().String()
	picName := reqUUID + "/accountData/" + imageID + ".png"

	presignedPutUrl, err := s3Helpers.PresignPutObject(picName, time.Hour, req.ContentLength)
	if err != nil {
		c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	type res struct {
		ImageID         string `json:"imageID"`
		PresignedPutUrl string `json:"presignedPutURL"`
	}

	return c.JSON(http.StatusOK, res{PresignedPutUrl: presignedPutUrl, ImageID: imageID})
}

func ConfirmChangedProfilePic(c echo.Context) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type reqBody struct {
		ImageID string `json:"imageID" validate:"required"`
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

	imageKey := reqUUID + "/accountData/" + req.ImageID + ".png"
	imageExists, err := s3Helpers.CheckFileExists(imageKey)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	if !imageExists {
		return c.String(http.StatusNotFound, "IMAGEID NOT FOUND")
	}

	user, err := userService.GetUserByUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	oldProfilePicUrl := user.ProfilePictureUrl

	newUrl := "storage.emyht.com/" + imageKey
	err = userService.ChangeProfilePicture(reqUUID, newUrl)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	oldImageKey := strings.ReplaceAll(oldProfilePicUrl, "storage.emyht.com/", "")
	err = s3Helpers.DeleteFile(oldImageKey)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	return c.String(http.StatusOK, "SUCCESS")
}
