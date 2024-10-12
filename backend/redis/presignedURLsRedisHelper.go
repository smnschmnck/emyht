package redis

import (
	"os"
	"strconv"

	"github.com/go-redis/redis/v8"
)

var PresignedURLsRedisConfig = redis.Options{
	Addr:     "",
	Password: "",
	DB:       0,
}

func LoadPresignedURLsRedisEnv() {
	connectionString := os.Getenv("REDIS_PRIVATE_URL")
	envDB := os.Getenv("REDIS_PRESIGNED_URLS_DB")

	opts, err := redis.ParseURL(connectionString)
	if err != nil {
		panic(err)
	}

	db, err := strconv.Atoi(envDB)
	if err != nil {
		panic(err)
	}

	opts.DB = db

	PresignedURLsRedisConfig = *opts
}
