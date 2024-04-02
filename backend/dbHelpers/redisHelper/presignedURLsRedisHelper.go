package redisHelper

import (
	"os"
	"strconv"
	"strings"

	"github.com/go-redis/redis/v8"
)

var PresignedURLsRedisConfig = redis.Options{
	Addr:     "",
	Password: "",
	DB:       0,
}

func LoadPresignedURLsRedisEnv() {
	envAddr := os.Getenv("REDIS_URL")
	trimmedEnvAddr := strings.ReplaceAll(envAddr, "redis://", "")
	envPW := os.Getenv("REDISPASSWORD")
	envDB := os.Getenv("REDIS_PRESIGNED_URLS_DB")

	if trimmedEnvAddr != "" {
		PresignedURLsRedisConfig.Addr = trimmedEnvAddr
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
