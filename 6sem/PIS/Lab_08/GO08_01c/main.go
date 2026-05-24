package main

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

func main() {
	serverURL := "ws://localhost:3000/ws"
	log.Printf("Подключение к серверу %s", serverURL)

	conn, _, err := websocket.DefaultDialer.Dial(serverURL, nil)
	if err != nil {
		log.Fatal("Ошибка подключения: ", err)
	}
	defer conn.Close()

	log.Println("Подключение установлено")

	for i := 1; i <= 5; i++ {
		msg := "сообщение " + string(rune('0'+i))
		log.Printf("Отправка: %s", msg)

		err := conn.WriteJSON(msg)
		if err != nil {
			log.Printf("Ошибка при отправке: %v", err)
			break
		}

		var response string
		err = conn.ReadJSON(&response)
		if err != nil {
			log.Printf("Ошибка при чтении ответа: %v", err)
			break
		}
		log.Printf("Получено от сервера: %s", response)

		if i < 5 {
			time.Sleep(1 * time.Second)
		}
	}

	err = conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
	if err != nil {
		log.Printf("Ошибка при закрытии: %v", err)
	}

	log.Println("Завершение работы клиента")
}
