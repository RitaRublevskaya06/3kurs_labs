package db

import (
	"log"

	"GO10_01/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() {
	var err error

	DB, err = gorm.Open(sqlite.Open("celebrities.db"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("Ошибка подключения к БД:", err)
	}

	err = DB.AutoMigrate(&models.Celebrity{})
	if err != nil {
		log.Fatal("Ошибка миграции:", err)
	}

	log.Println("База данных инициализирована через GORM")
}

func GetAllCelebrities() ([]models.Celebrity, error) {
	var celebrities []models.Celebrity
	result := DB.Find(&celebrities)
	return celebrities, result.Error
}

func GetCelebrityByID(id int) (*models.Celebrity, error) {
	var celebrity models.Celebrity
	result := DB.First(&celebrity, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &celebrity, nil
}

func CreateCelebrity(celebrity models.Celebrity) error {
	result := DB.Create(&celebrity)
	return result.Error
}

func UpdateCelebrity(id int, celebrity models.Celebrity) error {
	result := DB.Model(&models.Celebrity{}).Where("id = ?", id).Updates(map[string]interface{}{
		"full_name":      celebrity.FullName,
		"nationality":    celebrity.Nationality,
		"req_photo_path": celebrity.ReqPhotoPath,
	})
	return result.Error
}

func DeleteCelebrity(id int) error {
	result := DB.Delete(&models.Celebrity{}, id)
	return result.Error
}

func CheckCelebrityExists(id int) bool {
	var count int64
	DB.Model(&models.Celebrity{}).Where("id = ?", id).Count(&count)
	return count > 0
}
