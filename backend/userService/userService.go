package userService

import (
	"chat/db"
	"chat/queries"
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgtype"
)

func GetUserByUUID(uuid pgtype.UUID) (queries.GetUserByUUIDRow, error) {
	conn := db.GetDB()

	user, err := conn.GetUserByUUID(context.Background(), uuid)
	if err != nil {
		return queries.GetUserByUUIDRow{}, errors.New("USER NOT FOUND")
	}

	return user, nil
}

func GetUserByEmail(email string) (queries.GetUserByEmailRow, error) {
	conn := db.GetDB()

	user, err := conn.GetUserByEmail(context.Background(), email)
	if err != nil {
		return queries.GetUserByEmailRow{}, errors.New("USER NOT FOUND")
	}

	return user, nil
}

func ChangeProfilePicture(uuid pgtype.UUID, newPicture string) error {
	conn := db.GetDB()

	err := conn.UpdatePictureURL(context.Background(), queries.UpdatePictureURLParams{PictureUrl: newPicture, ID: uuid})
	if err != nil {
		return err
	}

	return nil
}
