package main

import (
	"log"
	"net/http"

	"GO10_01/db"
	gql "GO10_01/graphql"

	"github.com/graphql-go/handler"
)

func main() {
	db.InitDB()

	if err := gql.InitSchema(); err != nil {
		log.Fatal("Ошибка создания GraphQL схемы:", err)
	}

	h := handler.New(&handler.Config{
		Schema:   &gql.Schema,
		Pretty:   true,
		GraphiQL: false,
	})

	http.Handle("/graphql", h)

	port := ":3000"
	log.Printf("GraphQL сервер запущен на порту %s", port)
	log.Printf("Endpoint: http://localhost%s/graphql", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
