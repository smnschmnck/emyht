package redisdb

import (
	"chat/utils"
	"context"
	"log"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

var SessionsCtx = context.Background()

var sessionsDb *redis.Client

func InitializeSessionsRedis() {
	url := utils.GetEnv("REDIS_PRIVATE_URL")
	envDb := utils.GetEnv("REDIS_USER_SESSIONS_DB")

	opts, err := redis.ParseURL(url)
	if err != nil {
		panic(err)
	}

	dbNum, err := strconv.Atoi(envDb)
	if err != nil {
		log.Fatalf("Invalid Redis DB number: %v", err)
	}

	opts.DB = dbNum
	opts.DialTimeout = 10 * time.Second

	sessionsDb = redis.NewClient(opts)

	if err := sessionsDb.Ping(SessionsCtx).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("Connected to Redis")
}

func GetSessionsRedisClient() *redis.Client {
	if sessionsDb == nil {
		log.Fatalf("Redis client is not initialized. Call InitializeRedis first.")
	}
	return sessionsDb
}
