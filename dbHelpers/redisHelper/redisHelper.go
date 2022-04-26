package redisHelper

import (
	"os"
	"strconv"

	"github.com/go-redis/redis/v8"
)

var RedisConfig = redis.Options{
	Addr:     "",
	Password: "",
	DB:       0,
}

func LoadEnv(){
	envAddr := os.Getenv("REDIS_ADDR")
	envPW := os.Getenv("REDIS_PW")
	envDB := os.Getenv("REDIS_DB")

	if envAddr != ""{
		RedisConfig.Addr = envAddr
	}

	if envPW != ""{
		RedisConfig.Password = envPW
	}

	if envDB != ""{
		db, err := strconv.Atoi(envDB)
		if err != nil {
			panic(err)
		}
		RedisConfig.DB = db;
	}
}