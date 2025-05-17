package db

import (
	"chat/queries"
	"chat/utils"
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

var dbPool *pgxpool.Pool

func InitDB() {
	connString := utils.GetEnv("DATABASE_URL")

	var err error

	dbPool, err = pgxpool.New(context.Background(), connString)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	log.Println("Successfully connected to the database")
}

func GetRawConn() *pgxpool.Pool {
	return dbPool
}

func GetDB() *queries.Queries {
	return queries.New(dbPool)
}

func Close() {
	dbPool.Close()
}
