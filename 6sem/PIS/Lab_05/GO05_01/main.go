package main

import (
	"log"
	"net/http"

	"GO05_01/db"
	"GO05_01/handlers"

	"github.com/gorilla/mux"
)

func main() {
	db.InitDB()
	defer db.DB.Close()

	r := mux.NewRouter()

	r.HandleFunc("/Celebrities/All", handlers.GetAllCelebrities).Methods("GET")
	r.HandleFunc("/Celebrities/{id}", handlers.GetCelebrityByID).Methods("GET")
	r.HandleFunc("/Celebrities", handlers.CreateCelebrity).Methods("POST")
	r.HandleFunc("/Celebrities/{id}", handlers.UpdateCelebrity).Methods("PUT")
	r.HandleFunc("/Celebrities/{id}", handlers.DeleteCelebrity).Methods("DELETE")

	port := ":3000"
	log.Printf("Сервер запущен на порту %s", port)
	log.Fatal(http.ListenAndServe(port, r))
}
