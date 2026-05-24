package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	p03_02 "GO03_02/P03_02"
)

var stats *p03_02.Stats

func main() {
	stats = p03_02.NewStats()

	logFile, err := os.OpenFile("server2.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal("Ошибка создания лог-файла:", err)
	}
	defer logFile.Close()

	log.SetOutput(logFile)
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)

	http.HandleFunc("/S", handleS)
	http.HandleFunc("/G", handleG)
	http.HandleFunc("/", handleDefault)

	port := ":3000"
	log.Printf("Сервер запущен на порту %s", port)
	fmt.Printf("Сервер запущен на порту %s\n", port)
	fmt.Println("Доступные маршруты:")
	fmt.Println("  POST /S - увеличить счетчик POST")
	fmt.Println("  GET  /S - увеличить счетчик GET")
	fmt.Println("  GET  /G - показать статистику")

	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal("Ошибка запуска сервера:", err)
	}
}

func handleS(w http.ResponseWriter, r *http.Request) {
	var body string
	if r.Method == http.MethodPost {
		bodyBytes, err := io.ReadAll(r.Body)
		if err == nil && len(bodyBytes) > 0 {
			body = string(bodyBytes)
		}
		defer r.Body.Close()
	}

	switch r.Method {
	case http.MethodGet:
		stats.PlusGet()
		log.Printf("GET /S - счетчик GET увеличен")
		fmt.Fprintf(w, "GET запрос обработан. %s", stats.GenStr())

	case http.MethodPost:
		stats.PlusPost()
		if body != "" {
			log.Printf("POST /S - счетчик POST увеличен, получены данные: %s", body)
			fmt.Fprintf(w, "POST запрос обработан. Получены данные: %s\n%s",
				body, stats.GenStr())
		} else {
			log.Printf("POST /S - счетчик POST увеличен ")
			fmt.Fprintf(w, "POST запрос обработан. %s", stats.GenStr())
		}

	default:
		http.Error(w, "Метод не поддерживается. Используйте GET или POST",
			http.StatusMethodNotAllowed)
		log.Printf("Неподдерживаемый метод %s для /S", r.Method)
	}
}

func handleG(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Только GET метод поддерживается", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	statsStr := stats.GenStr()
	fmt.Fprint(w, statsStr)
	log.Printf("GET /G - выведена статистика: %s", statsStr)
}

func handleDefault(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	fmt.Fprintf(w, "Сервер статистики\n")
	fmt.Fprintf(w, "==================\n\n")
	fmt.Fprintf(w, "Доступные маршруты:\n")
	fmt.Fprintf(w, "  POST /S - увеличить счетчик POST\n")
	fmt.Fprintf(w, "  GET  /S - увеличить счетчик GET\n")
	fmt.Fprintf(w, "  GET  /G - показать статистику\n\n")
	fmt.Fprintf(w, "Текущая статистика:\n")
	fmt.Fprintf(w, stats.GenStr())
}
