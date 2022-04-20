package main

import (
	"auth/authService"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

var PORT string

func handleRequest(){
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Get("/user", authService.GetUser)
	r.Post("/users", authService.Register)
	r.Post("/login", authService.Authenticate)
	fmt.Println("Server Running on Port", PORT)
	http.ListenAndServe(PORT, r)
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