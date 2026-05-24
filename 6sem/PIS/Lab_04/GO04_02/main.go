package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"

	"github.com/gorilla/mux"
)

// Celebrity структура знаменитости
type Celebrity struct {
	ID           int    `json:"id"`
	FullName     string `json:"fullName"`
	Nationality  string `json:"nationality"`
	ReqPhotoPath string `json:"reqPhotoPath"`
}

// Server структура сервера
type Server struct {
	mu          sync.RWMutex
	celebrities []Celebrity
	filePath    string
}

// NewServer создает новый сервер
func NewServer(filePath string) (*Server, error) {
	server := &Server{
		filePath:    filePath,
		celebrities: []Celebrity{},
	}

	// Загружаем данные из файла
	if err := server.loadFromFile(); err != nil {
		// Если файл не существует, создаем с тестовыми данными
		if os.IsNotExist(err) {
			server.celebrities = []Celebrity{
				{ID: 1, FullName: "Leonardo DiCaprio", Nationality: "American", ReqPhotoPath: "/images/dicaprio.jpg"},
				{ID: 2, FullName: "Scarlett Johansson", Nationality: "American", ReqPhotoPath: "/images/johansson.jpg"},
				{ID: 3, FullName: "Keanu Reeves", Nationality: "Canadian", ReqPhotoPath: "/images/reeves.jpg"},
			}
			server.saveToFile()
			return server, nil
		}
		return nil, err
	}

	return server, nil
}

// loadFromFile загружает данные из JSON файла
func (s *Server) loadFromFile() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	file, err := os.Open(s.filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	data, err := ioutil.ReadAll(file)
	if err != nil {
		return err
	}

	if len(data) == 0 {
		s.celebrities = []Celebrity{}
		return nil
	}

	return json.Unmarshal(data, &s.celebrities)
}

// saveToFile сохраняет данные в JSON файл
func (s *Server) saveToFile() error {
	data, err := json.MarshalIndent(s.celebrities, "", "    ")
	if err != nil {
		return err
	}

	return ioutil.WriteFile(s.filePath, data, 0644)
}

// getAllCelebrities возвращает всех знаменитостей
func (s *Server) getAllCelebrities(w http.ResponseWriter, r *http.Request) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(s.celebrities)

	log.Printf("GET /Celebrities/All - возвращено %d записей", len(s.celebrities))
}

// getCelebrityByID возвращает знаменитость по ID
func (s *Server) getCelebrityByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		log.Printf("GET /Celebrities/%s - ошибка: неверный формат ID", idStr)
		return
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, celeb := range s.celebrities {
		if celeb.ID == id {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(celeb)
			log.Printf("GET /Celebrities/%d - найдено: %s", id, celeb.FullName)
			return
		}
	}

	http.Error(w, "Celebrity not found", http.StatusNotFound)
	log.Printf("GET /Celebrities/%d - ошибка: не найдено", id)
}

// addCelebrity добавляет новую знаменитость
func (s *Server) addCelebrity(w http.ResponseWriter, r *http.Request) {
	var newCeleb Celebrity

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		log.Printf("POST /Celebrities - ошибка: неверное тело запроса")
		return
	}
	defer r.Body.Close()

	if err := json.Unmarshal(body, &newCeleb); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		log.Printf("POST /Celebrities - ошибка: неверный JSON формат")
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	// Проверяем на дублирование ID
	for _, celeb := range s.celebrities {
		if celeb.ID == newCeleb.ID {
			http.Error(w, "Celebrity with this ID already exists", http.StatusConflict)
			log.Printf("POST /Celebrities - ошибка: ID %d уже существует", newCeleb.ID)
			return
		}
	}

	s.celebrities = append(s.celebrities, newCeleb)

	// Сохраняем в файл
	if err := s.saveToFile(); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		log.Printf("POST /Celebrities - ошибка сохранения: %v", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newCeleb)

	log.Printf("POST /Celebrities - добавлена знаменитость: %s (ID: %d)", newCeleb.FullName, newCeleb.ID)
}

// updateCelebrity обновляет существующую знаменитость
func (s *Server) updateCelebrity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		log.Printf("PUT /Celebrities/%s - ошибка: неверный формат ID", idStr)
		return
	}

	var updatedCeleb Celebrity

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		log.Printf("PUT /Celebrities/%d - ошибка: неверное тело запроса", id)
		return
	}
	defer r.Body.Close()

	if err := json.Unmarshal(body, &updatedCeleb); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		log.Printf("PUT /Celebrities/%d - ошибка: неверный JSON формат", id)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	// Ищем и обновляем
	for i, celeb := range s.celebrities {
		if celeb.ID == id {
			s.celebrities[i] = updatedCeleb

			// Сохраняем в файл
			if err := s.saveToFile(); err != nil {
				http.Error(w, "Internal server error", http.StatusInternalServerError)
				log.Printf("PUT /Celebrities/%d - ошибка сохранения: %v", id, err)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(updatedCeleb)

			log.Printf("PUT /Celebrities/%d - обновлена знаменитость: %s", id, updatedCeleb.FullName)
			return
		}
	}

	http.Error(w, "Celebrity not found", http.StatusNotFound)
	log.Printf("PUT /Celebrities/%d - ошибка: знаменитость не найдена", id)
}

// deleteCelebrity удаляет знаменитость
func (s *Server) deleteCelebrity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		log.Printf("DELETE /Celebrities/%s - ошибка: неверный формат ID", idStr)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	// Ищем и удаляем
	for i, celeb := range s.celebrities {
		if celeb.ID == id {
			// Удаляем элемент
			s.celebrities = append(s.celebrities[:i], s.celebrities[i+1:]...)

			// Сохраняем в файл
			if err := s.saveToFile(); err != nil {
				http.Error(w, "Internal server error", http.StatusInternalServerError)
				log.Printf("DELETE /Celebrities/%d - ошибка сохранения: %v", id, err)
				return
			}

			w.WriteHeader(http.StatusNoContent)
			log.Printf("DELETE /Celebrities/%d - удалена знаменитость: %s", id, celeb.FullName)
			return
		}
	}

	http.Error(w, "Celebrity not found", http.StatusNotFound)
	log.Printf("DELETE /Celebrities/%d - ошибка: знаменитость не найдена", id)
}

func main() {
	// Создаем лог файл
	logFile, err := os.OpenFile("server.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal("Ошибка создания лог файла:", err)
	}
	defer logFile.Close()

	// Настройка логгера
	log.SetOutput(logFile)
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)

	// Создаем сервер
	server, err := NewServer("celebrities.json")
	if err != nil {
		log.Fatal("Ошибка инициализации сервера:", err)
	}

	// Настройка маршрутизации
	router := mux.NewRouter()

	router.HandleFunc("/Celebrities/All", server.getAllCelebrities).Methods("GET")
	router.HandleFunc("/Celebrities/{id}", server.getCelebrityByID).Methods("GET")
	router.HandleFunc("/Celebrities", server.addCelebrity).Methods("POST")
	router.HandleFunc("/Celebrities/{id}", server.updateCelebrity).Methods("PUT")
	router.HandleFunc("/Celebrities/{id}", server.deleteCelebrity).Methods("DELETE")

	// Запуск сервера
	port := ":3000"
	log.Printf("Сервер запущен на порту %s", port)
	println("Server is running on http://localhost:3000")
	println("Available endpoints:")
	println("  GET    /Celebrities/All")
	println("  GET    /Celebrities/{id}")
	println("  POST   /Celebrities")
	println("  PUT    /Celebrities/{id}")
	println("  DELETE /Celebrities/{id}")

	log.Fatal(http.ListenAndServe(port, router))
}
