package postgresHelper

import (
	"os"
)

var PGConnString string

func LoadEnv() {
	PGConnString = os.Getenv("PG_CONN_STRING")
}
