package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"GO06_01/db"
	"GO06_01/models"

	"github.com/gorilla/mux"
)

// GetAllCelebrities обрабатывает GET /Celebrities/All
func GetAllCelebrities(w http.ResponseWriter, r *http.Request) {
	log.Println("GET /Celebrities/All - получение всех записей")

	celebrities, err := db.GetAllCelebrities()
	if err != nil {
		log.Printf("Ошибка получения записей: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(celebrities)
	log.Printf("Успешно возвращено %d записей", len(celebrities))
}

// GetCelebrityByID обрабатывает GET /Celebrities/{id}
func GetCelebrityByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Printf("Неверный формат ID: %v", err)
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	log.Printf("GET /Celebrities/%d - получение записи", id)

	celebrity, err := db.GetCelebrityByID(id)
	if err != nil {
		log.Printf("Запись с ID %d не найдена: %v", id, err)
		http.Error(w, "Celebrity not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(celebrity)
	log.Printf("Успешно возвращена запись с ID %d", id)
}

// CreateCelebrity обрабатывает POST /Celebrities
func CreateCelebrity(w http.ResponseWriter, r *http.Request) {
	log.Println("POST /Celebrities - добавление новой записи")

	var celebrity models.Celebrity
	err := json.NewDecoder(r.Body).Decode(&celebrity)
	if err != nil {
		log.Printf("Ошибка декодирования JSON: %v", err)
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if celebrity.Id <= 0 {
		log.Printf("Неверный ID: %d (должен быть больше 0)", celebrity.Id)
		http.Error(w, "Invalid ID: must be greater than 0", http.StatusBadRequest)
		return
	}

	if db.CheckCelebrityExists(celebrity.Id) {
		log.Printf("Запись с ID %d уже существует", celebrity.Id)
		http.Error(w, "Celebrity with this ID already exists", http.StatusConflict)
		return
	}

	err = db.CreateCelebrity(celebrity)
	if err != nil {
		log.Printf("Ошибка создания записи: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(celebrity)
	log.Printf("Успешно создана запись с ID %d", celebrity.Id)
}

// UpdateCelebrity обрабатывает PUT /Celebrities/{id}
func UpdateCelebrity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Printf("Неверный формат ID: %v", err)
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	log.Printf("PUT /Celebrities/%d - обновление записи", id)

	if !db.CheckCelebrityExists(id) {
		log.Printf("Запись с ID %d не найдена для обновления", id)
		http.Error(w, "Celebrity not found", http.StatusNotFound)
		return
	}

	var celebrity models.Celebrity
	err = json.NewDecoder(r.Body).Decode(&celebrity)
	if err != nil {
		log.Printf("Ошибка декодирования JSON: %v", err)
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if celebrity.Id != id {
		log.Printf("ПРЕДУПРЕЖДЕНИЕ: ID в URL (%d) не совпадает с ID в теле запроса (%d)", id, celebrity.Id)
		http.Error(w, "ID in URL does not match ID in request body", http.StatusBadRequest)
		return
	}

	err = db.UpdateCelebrity(id, celebrity)
	if err != nil {
		log.Printf("Ошибка обновления записи: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(celebrity)
	log.Printf("Успешно обновлена запись с ID %d", id)
}

// DeleteCelebrity обрабатывает DELETE /Celebrities/{id}
func DeleteCelebrity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Printf("Неверный формат ID: %v", err)
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	log.Printf("DELETE /Celebrities/%d - удаление записи", id)

	if !db.CheckCelebrityExists(id) {
		log.Printf("Запись с ID %d не найдена для удаления", id)
		http.Error(w, "Celebrity not found", http.StatusNotFound)
		return
	}

	err = db.DeleteCelebrity(id)
	if err != nil {
		log.Printf("Ошибка удаления записи: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
	log.Printf("Успешно удалена запись с ID %d", id)
}
