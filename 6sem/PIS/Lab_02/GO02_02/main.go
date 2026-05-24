package main

import (
	"GO02_02/go02_02lib"
	"fmt"
	"net/http"
)

var A01 = 3

func main() {
	http.HandleFunc("/", handler)

	fmt.Println("Сервер GO02_02 запущен на порту 4000")
	fmt.Println("Доступные маршруты:")
	fmt.Println("  GET  - http://localhost:4000")
	fmt.Println("  POST, PUT, DELETE - http://localhost:4000 (с указанием метода в Postman)")
	http.ListenAndServe(":4000", nil)
}

func handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	switch r.Method {
	case "GET":
		response := fmt.Sprintf(`
            <html>
            <head>
                <title>GO02_02 Сервер</title>
                <style>
                    body { font-family: Arial; margin: 20px; }
                    h2 { color: #333; }
                    p { font-size: 16px; line-height: 1.5; }
                    .method { color: #0066cc; font-weight: bold; }
                </style>
            </head>
            <body>
                <h2>localhost:4000</h2>
                <p>A01 = %d<br>
                A02 = %t<br>
                A03 = %s</p>
                <hr>
                <p><span class="method">GET</span> запрос успешно обработан</p>
            </body>
            </html>
        `, A01, A02, go02_02lib.A03)

		fmt.Fprint(w, response)

	case "POST":
		response := fmt.Sprintf(`
            <html>
            <body>
                <h2>POST запрос получен</h2>
                <p>Сервер: GO02_02 (порт 4000)</p>
                <p>Метод: %s</p>
                <p>Путь: %s</p>
                <p><a href="/">Вернуться на главную</a></p>
            </body>
            </html>
        `, r.Method, r.URL.Path)
		fmt.Fprint(w, response)

	case "PUT":
		response := fmt.Sprintf(`
            <html>
            <body>
                <h2>PUT запрос получен</h2>
                <p>Сервер: GO02_02 (порт 4000)</p>
                <p>Метод: %s</p>
                <p>Путь: %s</p>
                <p><a href="/">Вернуться на главную</a></p>
            </body>
            </html>
        `, r.Method, r.URL.Path)
		fmt.Fprint(w, response)

	case "DELETE":
		response := fmt.Sprintf(`
            <html>
            <body>
                <h2>DELETE запрос получен</h2>
                <p>Сервер: GO02_02 (порт 4000)</p>
                <p>Метод: %s</p>
                <p>Путь: %s</p>
                <p><a href="/">Вернуться на главную</a></p>
            </body>
            </html>
        `, r.Method, r.URL.Path)
		fmt.Fprint(w, response)

	default:
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
	}

	fmt.Printf("Получен %s запрос на %s\n", r.Method, r.URL.Path)
}
