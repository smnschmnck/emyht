package postgresHelper

import (
	"os"
)

var PGConnString string

func LoadEnv() {
	PGConnString = os.Getenv("DATABASE_PRIVATE_URL")
}
