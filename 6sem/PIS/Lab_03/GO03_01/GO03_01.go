package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

func main() {
	logFile, err := os.OpenFile("server.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal("Ошибка создания лог-файла:", err)
	}
	defer logFile.Close()

	log.SetOutput(logFile)
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)

	http.HandleFunc("/A", handleAll)
	http.HandleFunc("/A/B", handleAll)
	http.HandleFunc("/", handleDefault)

	port := ":3000"
	log.Printf("Сервер запущен на порту %s", port)
	fmt.Printf("Сервер запущен на порту %s\n", port)
	fmt.Println("Доступные маршруты:")
	fmt.Println("  GET    /A")
	fmt.Println("  GET    /A/B")
	fmt.Println("  POST   /A  (можно отправить данные в теле)")
	fmt.Println("  POST   /A/B (можно отправить данные в теле)")
	fmt.Println("  PUT    /A  (можно отправить данные в теле)")
	fmt.Println("  PUT    /A/B (можно отправить данные в теле)")
	fmt.Println("  DELETE /A  → 405 Method Not Allowed")
	fmt.Println("  DELETE /A/B → 405 Method Not Allowed")
	fmt.Println("  Любой другой путь также будет обработан")

	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal("Ошибка запуска сервера:", err)
	}
}

func handleAll(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodDelete {
		http.Error(w, "Method DELETE not allowed", http.StatusMethodNotAllowed)
		log.Printf("Method: %s, Path: %s - 405 Method Not Allowed", r.Method, r.URL.Path)
		return
	}

	var body string
	if r.Method == http.MethodPost || r.Method == http.MethodPut {
		bodyBytes, err := io.ReadAll(r.Body)
		if err == nil && len(bodyBytes) > 0 {
			body = string(bodyBytes)
		}
		defer r.Body.Close()
	}

	if body != "" {
		log.Printf("Method: %s, Path: %s, Body: %s", r.Method, r.URL.Path, body)
		fmt.Fprintf(w, "Method: %s, Path: %s, Body: %s", r.Method, r.URL.Path, body)
	} else {
		log.Printf("Method: %s, Path: %s", r.Method, r.URL.Path)
		fmt.Fprintf(w, "Method: %s, Path: %s", r.Method, r.URL.Path)
	}
}

func handleDefault(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodDelete {
		http.Error(w, "Method DELETE not allowed", http.StatusMethodNotAllowed)
		log.Printf("Method: %s, Path: %s - 405 Method Not Allowed",
			r.Method, r.URL.Path)
		return
	}

	if r.URL.Path != "/" {
		var body string
		if r.Method == http.MethodPost || r.Method == http.MethodPut {
			bodyBytes, err := io.ReadAll(r.Body)
			if err == nil && len(bodyBytes) > 0 {
				body = string(bodyBytes)
			}
			defer r.Body.Close()
		}

		if body != "" {
			log.Printf("Method: %s, Path: %s (не перечисленный маршрут), Body: %s",
				r.Method, r.URL.Path, body)
			fmt.Fprintf(w, "Method: %s, Path: %s (не перечисленный маршрут), Body: %s",
				r.Method, r.URL.Path, body)
		} else {
			log.Printf("Method: %s, Path: %s (не перечисленный маршрут)", r.Method, r.URL.Path)
			fmt.Fprintf(w, "Method: %s, Path: %s (не перечисленный маршрут)", r.Method, r.URL.Path)
		}
	} else {
		fmt.Fprintf(w, "Главная страница. Доступные маршруты: /A, /A/B\n")
		fmt.Fprintf(w, "Для POST и PUT запросов можно отправлять данные в теле\n")
		fmt.Fprintf(w, "DELETE запросы не поддерживаются (возвращают 405)")
	}
}
