package redisHelper

import (
	"os"
	"strconv"
	"strings"

	"github.com/go-redis/redis/v8"
)

var UserSessionsRedisConfig = redis.Options{
	Addr:     "",
	Password: "",
	DB:       0,
}

func LoadUserSessionsRedisEnv() {
	envAddr := os.Getenv("REDIS_URL")
	trimmedEnvAddr := strings.ReplaceAll(envAddr, "redis://", "")
	envPW := os.Getenv("REDISPASSWORD")
	envDB := os.Getenv("REDIS_USER_SESSIONS_DB")

	if trimmedEnvAddr != "" {
		UserSessionsRedisConfig.Addr = trimmedEnvAddr
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
