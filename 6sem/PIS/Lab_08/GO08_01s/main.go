package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Ошибка при установке соединения: %v", err)
		return
	}
	defer conn.Close()

	log.Printf("Клиент подключился: %s", conn.RemoteAddr())

	for {
		var msg string
		err := conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway, websocket.CloseNoStatusReceived) {
				log.Printf("Клиент %s корректно закрыл соединение", conn.RemoteAddr())
			} else if websocket.IsUnexpectedCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				log.Printf("Неожиданное закрытие соединения от %s: %v", conn.RemoteAddr(), err)
			} else {
				log.Printf("Ошибка чтения от %s: %v", conn.RemoteAddr(), err)
			}
			break
		}

		log.Printf("Получено сообщение от клиента: %s", msg)

		responseMsg := "from server " + msg
		err = conn.WriteJSON(responseMsg)
		if err != nil {
			log.Printf("Ошибка отправки клиенту %s: %v", conn.RemoteAddr(), err)
			break
		}
	}
}

func main() {
	log.Println("Запуск WebSocket-сервера на порту 3000")

	http.HandleFunc("/ws", handleConnections)

	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal("Ошибка запуска сервера: ", err)
	}
}
