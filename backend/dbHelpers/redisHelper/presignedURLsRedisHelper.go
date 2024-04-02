package redisHelper

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
	envAddr := os.Getenv("REDIS_URL")
	envPW := os.Getenv("REDISPASSWORD")
	envDB := os.Getenv("REDIS_PRESIGNED_URLS_DB")

	if envAddr != "" {
		PresignedURLsRedisConfig.Addr = envAddr
	}

	if envPW != "" {
		PresignedURLsRedisConfig.Password = envPW
	}

	if envDB != "" {
		db, err := strconv.Atoi(envDB)
		if err != nil {
			panic(err)
		}
		PresignedURLsRedisConfig.DB = db
	}
}
