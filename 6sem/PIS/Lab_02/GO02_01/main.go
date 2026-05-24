package main

import (
	"GO02_01/go02_01lib"
	"fmt"
	"net/http"
)

const C01 = 3.14

func main() {
	http.HandleFunc("/", handler)

	fmt.Println("Сервер GO02_01 запущен на порту 3000")
	fmt.Println("Доступные маршруты:")
	fmt.Println("  GET  - http://localhost:3000")
	http.ListenAndServe(":3000", nil)
}

func handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	switch r.Method {
	case "GET":
		response := fmt.Sprintf(`
            <html>
            <head>
                <title>GO02_01 Сервер</title>
                <style>
                    body { font-family: Arial; margin: 20px; }
                    h2 { color: #333; }
                    p { font-size: 16px; line-height: 1.5; }
                    .method { color: #0066cc; font-weight: bold; }
                </style>
            </head>
            <body>
                <h2>localhost:3000</h2>
                <p>C01 = %e,<br>
                C02 = %e,<br>
                C03 = %e</p>
                <hr>
                <p><span class="method">GET</span> запрос успешно обработан</p>
            </body>
            </html>
        `, C01, C02, go02_01lib.C03)

		fmt.Fprint(w, response)

	case "POST", "PUT", "DELETE":
		w.WriteHeader(http.StatusMethodNotAllowed)
		fmt.Fprintf(w, "Ошибка 405: Метод %s не поддерживается сервером GO02_01. Поддерживаемый метод: GET", r.Method)

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		fmt.Fprintf(w, "Ошибка 405: Метод %s не поддерживается сервером GO02_01. Поддерживаемый метод: GET", r.Method)
	}

	fmt.Printf("Получен %s запрос на %s\n", r.Method, r.URL.Path)
}
