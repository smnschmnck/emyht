package utils

import (
	"os"
	"strings"
)

func GetAllowedCorsOrigins() []string {
	originsString := os.Getenv("CORS_ORIGINS")

	return strings.Split(originsString, ", ")
}
