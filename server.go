package main

import (
	"chat/auth/authService"
	"chat/dbHelpers/postgresHelper"
	"chat/dbHelpers/redisHelper"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/joho/godotenv"
)

var PORT string

func wsHandler(c *websocket.Conn) {
	for {
		mt, msg, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}

		msgString := string(msg)
		echoMsg := []byte("Echo: " + msgString)
		err = c.WriteMessage(mt, echoMsg)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

func handleRequest(){
	app := fiber.New()

	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	app.Get("/ws", websocket.New(wsHandler))
	app.Get("/user", authService.GetUserBySession)
	app.Post("/register", authService.Register)
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
	redisHelper.LoadEnv()
	setPort(3001)
}

func main() {
	initGlobals()
	handleRequest()
}