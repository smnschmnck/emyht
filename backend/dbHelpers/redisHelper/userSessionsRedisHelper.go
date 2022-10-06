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
	envAddr := os.Getenv("REDIS_USER_SESSIONS_DB_ADDR")
	envPW := os.Getenv("REDIS_USER_SESSIONS_DB_PW")
	envDB := os.Getenv("REDIS_USER_SESSIONS_DB")

	if envAddr != "" {
		UserSessionsRedisConfig.Addr = envAddr
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
