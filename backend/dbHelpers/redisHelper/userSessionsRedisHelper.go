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
	connectionString := os.Getenv("REDIS_PRIVATE_URL")
	envDB := os.Getenv("REDIS_USER_SESSIONS_DB")

	opts, err := redis.ParseURL(connectionString)
	if err != nil {
		panic(err)
	}

	db, err := strconv.Atoi(envDB)
	if err != nil {
		panic(err)
	}

	opts.DB = db

	UserSessionsRedisConfig = *opts
}
