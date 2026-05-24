package main

import (
	"log"
	"net/http"

	"GO06_01/db"
	"GO06_01/handlers"

	"github.com/gorilla/mux"
)

func main() {
	db.InitDB()
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
