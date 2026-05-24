package db

import (
	"database/sql"
	"log"

	"GO11_01/models"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func InitDB() {
	var err error
	DB, err = sql.Open("sqlite", "./celebrities.db")
	if err != nil {
		log.Fatal("Ошибка подключения к БД:", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatal("Ошибка подключения к БД:", err)
	}

	createTableSQL := `
	CREATE TABLE IF NOT EXISTS celebrities (
		id INTEGER PRIMARY KEY,
		fullName TEXT NOT NULL,
		nationality TEXT NOT NULL,
		reqPhotoPath TEXT NOT NULL
	);
	`

	_, err = DB.Exec(createTableSQL)
	if err != nil {
		log.Fatal("Ошибка создания таблицы:", err)
	}

	log.Println("База данных инициализирована")
}

func GetAllCelebrities() ([]models.Celebrity, error) {
	rows, err := DB.Query("SELECT id, fullName, nationality, reqPhotoPath FROM celebrities")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var celebrities []models.Celebrity
	for rows.Next() {
		var c models.Celebrity
		err := rows.Scan(&c.Id, &c.FullName, &c.Nationality, &c.ReqPhotoPath)
		if err != nil {
			return nil, err
		}
		celebrities = append(celebrities, c)
	}
	return celebrities, nil
}

func GetCelebrityByID(id int) (*models.Celebrity, error) {
	var c models.Celebrity
	err := DB.QueryRow("SELECT id, fullName, nationality, reqPhotoPath FROM celebrities WHERE id = ?", id).
		Scan(&c.Id, &c.FullName, &c.Nationality, &c.ReqPhotoPath)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func CreateCelebrity(c models.Celebrity) error {
	_, err := DB.Exec("INSERT INTO celebrities (id, fullName, nationality, reqPhotoPath) VALUES (?, ?, ?, ?)",
		c.Id, c.FullName, c.Nationality, c.ReqPhotoPath)
	return err
}

func UpdateCelebrity(id int, c models.Celebrity) error {
	_, err := DB.Exec("UPDATE celebrities SET fullName = ?, nationality = ?, reqPhotoPath = ? WHERE id = ?",
		c.FullName, c.Nationality, c.ReqPhotoPath, id)
	return err
}

func DeleteCelebrity(id int) error {
	_, err := DB.Exec("DELETE FROM celebrities WHERE id = ?", id)
	return err
}

func CheckCelebrityExists(id int) bool {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM celebrities WHERE id = ?", id).Scan(&count)
	if err != nil {
		return false
	}
	return count > 0
}
