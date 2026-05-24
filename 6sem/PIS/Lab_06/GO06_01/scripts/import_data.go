package main

import (
	"GO06_01/db"
	"GO06_01/models"
	"encoding/json"
	"log"
	"os"
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
		if db.CheckCelebrityExists(c.Id) {
			log.Printf("Запись с ID %d уже существует, пропускаем", c.Id)
			continue
		}

		err := db.CreateCelebrity(c)
		if err != nil {
			log.Printf("Ошибка импорта записи ID %d: %v", c.Id, err)
		} else {
			log.Printf("Импортирована запись: %+v", c)
		}
	}
}
