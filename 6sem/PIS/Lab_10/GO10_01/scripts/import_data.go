package main

import (
	"encoding/json"
	"log"
	"os"

	"GO10_01/db"
	"GO10_01/models"
)

func main() {
	db.InitDB()

	data, err := os.ReadFile("Celebrities.json")
	if err != nil {
		log.Fatal("Ошибка чтения файла:", err)
	}

	var celebrities []models.Celebrity
	err = json.Unmarshal(data, &celebrities)
	if err != nil {
		log.Fatal("Ошибка парсинга JSON:", err)
	}

	for _, c := range celebrities {
		err := db.CreateCelebrity(c)
		if err != nil {
			log.Printf("Ошибка импорта записи ID %d: %v", c.Id, err)
		} else {
			log.Printf("Импортирована запись: %+v", c)
		}
	}
}
