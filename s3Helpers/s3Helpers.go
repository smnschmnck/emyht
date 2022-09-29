package s3Helpers

import (
	"chat/dbHelpers/redisHelper"
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/go-redis/redis/v8"
)

var presignedURLExpiration = 24 * time.Hour

func isActionAllowed(action string) bool {
	actionToUpper := strings.ToUpper(action)
	if actionToUpper == "GET" {
		return true
	}
	if actionToUpper == "PUT" {
		return true
	}
	if actionToUpper == "DELETE" {
		return true
	}
	return false
}

func makeRedisKey(action string, objectUrl string) string {
	actionToUpper := strings.ToUpper(action)
	return "action:" + actionToUpper + "+url:" + objectUrl
}

func getCachedPresignedURL(action string, objectUrl string) (string, error) {
	if !isActionAllowed(action) {
		return "", errors.New("ACTION NOT ALLOWED")
	}
	ctx := context.Background()
	rdb := redis.NewClient(&redisHelper.PresignedURLsRedisConfig)
	objectKey := makeRedisKey(action, objectUrl)
	presignedURL, err := rdb.Get(ctx, objectKey).Result()
	if err != nil {
		return "", err
	}
	return presignedURL, nil
}

func cachePresignedURL(action string, objectUrl string, presignedUrl string) error {
	if !isActionAllowed(action) {
		return errors.New("ACTION NOT ALLOWED")
	}
	ctx := context.Background()
	rdb := redis.NewClient(&redisHelper.PresignedURLsRedisConfig)
	objectKey := makeRedisKey(action, objectUrl)
	_, err := rdb.Set(ctx, objectKey, presignedUrl, presignedURLExpiration).Result()
	if err != nil {
		return err
	}
	return nil
}

func PresignS3Object(objectUrl string, action string) (string, error) {
	if !isActionAllowed(action) {
		return "", errors.New("ACTION NOT ALLOWED")
	}
	url, err := getCachedPresignedURL(action, objectUrl)
	if err == nil {
		return url, nil
	}
	var bucketName = os.Getenv("S3_BUCKET_NAME")
	var accountId = os.Getenv("S3_ACCOUNT_ID")
	var accessKeyId = os.Getenv("S3_ACCESS_KEY")
	var accessKeySecret = os.Getenv("S3_SECRET_ACCESS_KEY")

	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			//TODO change to storage.emyht.com
			URL: fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountId),
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithEndpointResolverWithOptions(r2Resolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKeyId, accessKeySecret, "")),
	)
	if err != nil {
		return "", err
	}

	client := s3.NewFromConfig(cfg)

	presignClient := s3.NewPresignClient(client)

	var presignResult *v4.PresignedHTTPRequest

	switch strings.ToUpper(action) {
	case "GET":
		presignResult, err = presignClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(objectUrl),
		})
		if err != nil {
			return "", err
		}
	case "PUT":
		presignResult, err = presignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(objectUrl),
		})
		if err != nil {
			return "", err
		}
	case "DELETE":
		presignResult, err = presignClient.PresignDeleteObject(context.TODO(), &s3.DeleteObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(objectUrl),
		})
		if err != nil {
			return "", err
		}
	}

	cachePresignedURL(action, objectUrl, presignResult.URL)

	return presignResult.URL, nil
}
