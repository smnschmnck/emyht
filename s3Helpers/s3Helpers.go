package s3Helpers

import (
	"chat/dbHelpers/redisHelper"
	"context"
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awshttp "github.com/aws/aws-sdk-go-v2/aws/transport/http"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/go-redis/redis/v8"
)

func getCachedPresignedGetURL(objectUrl string) (string, error) {
	ctx := context.Background()
	rdb := redis.NewClient(&redisHelper.PresignedURLsRedisConfig)
	presignedURL, err := rdb.Get(ctx, objectUrl).Result()
	if err != nil {
		return "", err
	}
	return presignedURL, nil
}

func cachePresignedGetURL(objectUrl string, presignedUrl string, expiration time.Duration) error {
	ctx := context.Background()
	rdb := redis.NewClient(&redisHelper.PresignedURLsRedisConfig)
	_, err := rdb.Set(ctx, objectUrl, presignedUrl, expiration).Result()
	if err != nil {
		return err
	}
	return nil
}

func getClient(context context.Context) (*s3.Client, error) {
	accessKeyId := os.Getenv("S3_ACCESS_KEY")
	accessKeySecret := os.Getenv("S3_SECRET_ACCESS_KEY")
	endpointUrl := os.Getenv("S3_ENDPOINT_URL")

	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: endpointUrl,
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

func PresignGetObject(objectUrl string, expiration time.Duration) (string, error) {
	url, err := getCachedPresignedGetURL(objectUrl)
	if err == nil {
		return url, nil
	}

	presignClient, err := getPresignClient(context.TODO(), expiration)
	if err != nil {
		return "", err
	}
	presignResult, err := presignClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(os.Getenv("S3_BUCKET_NAME")),
		Key:    aws.String(objectUrl),
	})
	if err != nil {
		return "", err
	}

	cachePresignedGetURL(objectUrl, presignResult.URL, expiration)

	return presignResult.URL, nil
}

func PresignPutObject(objectName string, expiration time.Duration, maxSize int64) (string, error) {
	presignClient, err := getPresignClient(context.TODO(), expiration)
	if err != nil {
		return "", err
	}
	presignResult, err := presignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:        aws.String(os.Getenv("S3_BUCKET_NAME")),
		Key:           aws.String(objectName),
		ContentLength: *aws.Int64(maxSize),
	})
	if err != nil {
		return "", err
	}
	return presignResult.URL, nil
}

//Presigns URL if picture is saved in cloud bucket
func FormatPictureUrl(url string) string {
	if !strings.HasPrefix(url, "storage.emyht.com/") {
		return url
	}
	trimmedPicUrl := strings.Replace(url, "storage.emyht.com/", "", -1)
	presignedUrl, err := PresignGetObject(trimmedPicUrl, 5*time.Hour)
	if err != nil {
		return ""
	}
	return presignedUrl
}

func DeleteFile(key string) error {
	ctx := context.TODO()
	client, err := getClient(ctx)
	if err != nil {
		return err
	}
	_, err = client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(os.Getenv("S3_BUCKET_NAME")),
		Key:    &key,
	})
	if err != nil {
		return err
	}
	return nil
}

func CheckFileExists(key string) (bool, error) {
	ctx := context.TODO()
	client, err := getClient(ctx)
	if err != nil {
		return false, err
	}
	_, err = client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(os.Getenv("S3_BUCKET_NAME")),
		Key:    aws.String(key),
	})
	if err != nil {
		var responseError *awshttp.ResponseError
		if errors.As(err, &responseError) && responseError.ResponseError.HTTPStatusCode() == http.StatusNotFound {
			return false, nil
		}
		return false, err
	}
	return true, nil
}
