package main

import (
	"GO05_01/db"
	"GO05_01/models"
	"encoding/json"
	"log"
	"os"
)

func main() {
	db.InitDB()
	defer db.DB.Close()

	// Чтение файла
	data, err := os.ReadFile("Celebrities.json")
	if err != nil {
		log.Fatal("Ошибка чтения файла:", err)
	}

	var celebrities []models.Celebrity
	err = json.Unmarshal(data, &celebrities)
	if err != nil {
		log.Fatal("Ошибка парсинга JSON:", err)
	}

	// Импорт данных
	for _, c := range celebrities {
		err := db.CreateCelebrity(c)
		if err != nil {
			log.Printf("Ошибка импорта записи ID %d: %v", c.Id, err)
		} else {
			log.Printf("Импортирована запись: %+v", c)
		}
	}
}
