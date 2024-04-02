package redisHelper

import (
	"os"
	"strconv"

	"github.com/go-redis/redis/v8"
)

var UserSessionsRedisConfig = redis.Options{
	Addr:     "",
	Password: "",
	DB:       0,
}

func LoadUserSessionsRedisEnv() {
	envHost := os.Getenv("REDISHOST")
	envPort := os.Getenv("REDISPORT")
	envPW := os.Getenv("REDISPASSWORD")
	envDB := os.Getenv("REDIS_PRESIGNED_URLS_DB")

	if envHost != "" && envPort != "" {
		PresignedURLsRedisConfig.Addr = envHost + ":" + envPort
	}

	if envPW != "" {
		UserSessionsRedisConfig.Password = envPW
	}

	if envDB != "" {
		db, err := strconv.Atoi(envDB)
		if err != nil {
			panic(err)
		}
		UserSessionsRedisConfig.DB = db
	}
}
