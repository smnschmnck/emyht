package utils

import (
	"log"
	"os"
)

func GetEnv(key string) string {
	variable, exists := os.LookupEnv(key)

	if !exists {
		log.Fatalf("Environment variable '%s' not found", key)
		return ""
	}

	return variable
}
