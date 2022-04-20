package main

import (
	"auth/authService"
	"os"
	"strconv"

	"github.com/gofiber/fiber"
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

func main() {
	setPort(3001)
	handleRequest();
}