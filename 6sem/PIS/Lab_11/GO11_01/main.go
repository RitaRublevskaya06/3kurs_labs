package main

import (
	"log"
	"net/http"

	"GO11_01/db"
	"GO11_01/handlers"

	_ "GO11_01/docs"

	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"
)

// @title           GO11_01 Celebrities API
// @version         1.0
// @description     REST API для CRUD операций со знаменитостями (лабораторная 11).
// @host            localhost:3000
// @BasePath        /
func main() {
	db.InitDB()
	defer db.DB.Close()

	r := mux.NewRouter()

	r.HandleFunc("/Celebrities/All", handlers.GetAllCelebrities).Methods("GET")
	r.HandleFunc("/Celebrities/{id}", handlers.GetCelebrityByID).Methods("GET")
	r.HandleFunc("/Celebrities", handlers.CreateCelebrity).Methods("POST")
	r.HandleFunc("/Celebrities/{id}", handlers.UpdateCelebrity).Methods("PUT")
	r.HandleFunc("/Celebrities/{id}", handlers.DeleteCelebrity).Methods("DELETE")

	r.PathPrefix("/swagger/").Handler(httpSwagger.Handler(
		httpSwagger.URL("http://localhost:3000/swagger/doc.json"),
	))

	port := ":3000"
	log.Printf("Сервер запущен на порту %s", port)
	log.Printf("OpenAPI UI (Swagger): http://localhost%s/swagger/index.html", port)
	log.Fatal(http.ListenAndServe(port, r))
}
