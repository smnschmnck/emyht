package redisdb

import (
	"chat/utils"
	"context"
	"log"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

var PresignedUrlsCtx = context.Background()

var presignedUrlsDb *redis.Client

func InitializePresignedUrlsRedis() {
	url := utils.GetEnv("REDIS_PRIVATE_URL")
	envDb := utils.GetEnv("REDIS_PRESIGNED_URLS_DB")

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

	presignedUrlsDb = redis.NewClient(opts)

	if err := presignedUrlsDb.Ping(PresignedUrlsCtx).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("Connected to Redis")
}

func GetPresignedUrlsRedisClient() *redis.Client {
	if presignedUrlsDb == nil {
		log.Fatalf("Redis client is not initialized. Call InitializeRedis first.")
	}
	return presignedUrlsDb
}
