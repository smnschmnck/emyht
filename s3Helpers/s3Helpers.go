package s3Helpers

import (
	"chat/dbHelpers/redisHelper"
	"context"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/go-redis/redis/v8"
)

var presignedURLExpiration = 24 * time.Hour

func getCachedPresignedGetURL(objectUrl string) (string, error) {
	ctx := context.Background()
	rdb := redis.NewClient(&redisHelper.PresignedURLsRedisConfig)
	presignedURL, err := rdb.Get(ctx, objectUrl).Result()
	if err != nil {
		return "", err
	}
	return presignedURL, nil
}

func cachePresignedGetURL(objectUrl string, presignedUrl string) error {
	ctx := context.Background()
	rdb := redis.NewClient(&redisHelper.PresignedURLsRedisConfig)
	_, err := rdb.Set(ctx, objectUrl, presignedUrl, presignedURLExpiration).Result()
	if err != nil {
		return err
	}
	return nil
}

func getClient(context context.Context) (*s3.Client, error) {
	accountId := os.Getenv("S3_ACCOUNT_ID")
	accessKeyId := os.Getenv("S3_ACCESS_KEY")
	accessKeySecret := os.Getenv("S3_SECRET_ACCESS_KEY")

	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			//TODO change to storage.emyht.com
			URL: fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountId),
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(context,
		config.WithEndpointResolverWithOptions(r2Resolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKeyId, accessKeySecret, "")),
	)
	if err != nil {
		return &s3.Client{}, err
	}

	client := s3.NewFromConfig(cfg)
	return client, nil
}

func getPresignClient(context context.Context, expiration time.Duration) (*s3.PresignClient, error) {
	client, err := getClient(context)
	if err != nil {
		return &s3.PresignClient{}, err
	}
	presignClient := s3.NewPresignClient(client, func(options *s3.PresignOptions) {
		options.Expires = expiration
	})

	return presignClient, nil
}

func PresignGetObject(objectUrl string) (string, error) {
	url, err := getCachedPresignedGetURL(objectUrl)
	if err == nil {
		return url, nil
	}

	presignClient, err := getPresignClient(context.TODO(), presignedURLExpiration)
	if err != nil {
		return "", err
	}
	presignResult, err := presignClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
		Bucket:          aws.String(os.Getenv("S3_BUCKET_NAME")),
		Key:             aws.String(objectUrl),
		ResponseExpires: aws.Time(time.Time{}),
	})
	if err != nil {
		return "", err
	}

	cachePresignedGetURL(objectUrl, presignResult.URL)

	return presignResult.URL, nil
}
