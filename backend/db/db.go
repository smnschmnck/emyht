package db

import (
	"chat/utils"
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

var dbPool *pgxpool.Pool

func InitDB() {
	connString := utils.GetEnv("DATABASE_PRIVATE_URL")

	var err error

	dbPool, err = pgxpool.New(context.Background(), connString)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	fmt.Println("Successfully connected to the database")
}

func GetDB() *pgxpool.Pool {
	return dbPool
}
