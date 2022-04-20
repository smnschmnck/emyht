package postgresHelper

import (
	"os"

	"github.com/jackc/pgx"
)

var PGConfig = pgx.ConnConfig{
	Host: "localhost",
	User: "postgres",
	Password: "example",
	Database: "postgres",
}

func LoadEnv(){
	envHost := os.Getenv("PG_HOST")
	envUser := os.Getenv("PG_USER")
	envPassword := os.Getenv("PG_PASSWORD")
	envDb := os.Getenv("PG_DATABASE")

	if envHost != ""{
		PGConfig.Host = envHost
	}

	if envUser != ""{
		PGConfig.User = envUser
	}

	if envPassword != ""{
		PGConfig.Password = envPassword
	}

	if envDb != ""{
		PGConfig.Database = envDb
	}
}