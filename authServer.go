package main

import (
	"auth/authService"
	"auth/dbHelpers/postgresHelper"
	"fmt"
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

var PORT string

func handleRequest(){
	app := fiber.New()
	app.Get("/user", authService.GetUser)
	app.Post("/users", authService.Register)
	app.Post("/login", authService.Authenticate)
	app.Listen(PORT)
}

func setPort(defaultPort int){
	envPort := os.Getenv("PORT")
	if envPort != ""{
		PORT = ":" + envPort
	}else{
		PORT = ":" + strconv.Itoa(defaultPort)
	}
}

func loadDotEnv(){
	godotenv.Load()
	err := godotenv.Load()
	if err != nil {
		fmt.Println(string("\033[31m"), "No .env file. Using default or runtime vars")
	}
}

func initGlobals(){
	loadDotEnv()
	postgresHelper.LoadEnv()
	setPort(3001)
}

func main() {
	initGlobals()
	handleRequest()
}