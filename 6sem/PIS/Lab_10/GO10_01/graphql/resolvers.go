package graphql

import (
	"errors"
	"fmt"
	"log"

	"GO10_01/db"
	"GO10_01/models"

	"github.com/graphql-go/graphql"
)

func argInt(args map[string]interface{}, name string) (int, error) {
	v, ok := args[name]
	if !ok {
		return 0, fmt.Errorf("missing argument %s", name)
	}
	switch n := v.(type) {
	case int:
		return n, nil
	case int32:
		return int(n), nil
	case int64:
		return int(n), nil
	case float64:
		return int(n), nil
	default:
		return 0, fmt.Errorf("invalid ID")
	}
}

func celebrityToMap(c models.Celebrity) map[string]interface{} {
	return map[string]interface{}{
		"id":           c.Id,
		"fullName":     c.FullName,
		"nationality":  c.Nationality,
		"reqPhotoPath": c.ReqPhotoPath,
	}
}

func parseCelebrityInput(input map[string]interface{}) models.Celebrity {
	var c models.Celebrity
	if idVal, ok := input["id"]; ok && idVal != nil {
		if id, err := argInt(map[string]interface{}{"id": idVal}, "id"); err == nil {
			c.Id = id
		}
	}
	if v, ok := input["fullName"].(string); ok {
		c.FullName = v
	}
	if v, ok := input["nationality"].(string); ok {
		c.Nationality = v
	}
	if v, ok := input["reqPhotoPath"].(string); ok {
		c.ReqPhotoPath = v
	}
	return c
}

func resolveAllCelebrities(p graphql.ResolveParams) (interface{}, error) {
	log.Println("Query celebrities - получение всех записей")

	celebrities, err := db.GetAllCelebrities()
	if err != nil {
		log.Printf("Ошибка получения записей: %v", err)
		return nil, err
	}

	result := make([]map[string]interface{}, len(celebrities))
	for i, c := range celebrities {
		result[i] = celebrityToMap(c)
	}
	log.Printf("Успешно возвращено %d записей", len(celebrities))
	return result, nil
}

func resolveCelebrityByID(p graphql.ResolveParams) (interface{}, error) {
	id, err := argInt(p.Args, "id")
	if err != nil {
		return nil, err
	}

	log.Printf("Query celebrity(%d) - получение записи", id)

	celebrity, err := db.GetCelebrityByID(id)
	if err != nil {
		log.Printf("Запись с ID %d не найдена: %v", id, err)
		return nil, errors.New("Celebrity not found")
	}

	log.Printf("Успешно возвращена запись с ID %d", id)
	return celebrityToMap(*celebrity), nil
}

func resolveCreateCelebrity(p graphql.ResolveParams) (interface{}, error) {
	log.Println("Mutation createCelebrity - добавление новой записи")

	input, ok := p.Args["input"].(map[string]interface{})
	if !ok {
		return nil, errors.New("Invalid input")
	}

	celebrity := parseCelebrityInput(input)

	if celebrity.Id <= 0 {
		log.Printf("Неверный ID: %d (должен быть больше 0)", celebrity.Id)
		return nil, errors.New("Invalid ID: must be greater than 0")
	}

	if db.CheckCelebrityExists(celebrity.Id) {
		log.Printf("Запись с ID %d уже существует", celebrity.Id)
		return nil, errors.New("Celebrity with this ID already exists")
	}

	if err := db.CreateCelebrity(celebrity); err != nil {
		log.Printf("Ошибка создания записи: %v", err)
		return nil, err
	}

	log.Printf("Успешно создана запись с ID %d", celebrity.Id)
	return celebrityToMap(celebrity), nil
}

func resolveUpdateCelebrity(p graphql.ResolveParams) (interface{}, error) {
	id, err := argInt(p.Args, "id")
	if err != nil {
		return nil, err
	}

	log.Printf("Mutation updateCelebrity(%d) - обновление записи", id)

	if !db.CheckCelebrityExists(id) {
		log.Printf("Запись с ID %d не найдена для обновления", id)
		return nil, errors.New("Celebrity not found")
	}

	input, ok := p.Args["input"].(map[string]interface{})
	if !ok {
		return nil, errors.New("Invalid input")
	}

	celebrity := parseCelebrityInput(input)

	if inputID, hasID := input["id"]; hasID && inputID != nil {
		if celebrity.Id != id {
			log.Printf("ПРЕДУПРЕЖДЕНИЕ: ID в аргументе (%d) не совпадает с ID в input (%d)", id, celebrity.Id)
			return nil, errors.New("ID in URL does not match ID in request body")
		}
	}

	if err := db.UpdateCelebrity(id, celebrity); err != nil {
		log.Printf("Ошибка обновления записи: %v", err)
		return nil, err
	}

	celebrity.Id = id
	log.Printf("Успешно обновлена запись с ID %d", id)
	return celebrityToMap(celebrity), nil
}

func resolveDeleteCelebrity(p graphql.ResolveParams) (interface{}, error) {
	id, err := argInt(p.Args, "id")
	if err != nil {
		return nil, err
	}

	log.Printf("Mutation deleteCelebrity(%d) - удаление записи", id)

	if !db.CheckCelebrityExists(id) {
		log.Printf("Запись с ID %d не найдена для удаления", id)
		return nil, errors.New("Celebrity not found")
	}

	if err := db.DeleteCelebrity(id); err != nil {
		log.Printf("Ошибка удаления записи: %v", err)
		return nil, err
	}

	log.Printf("Успешно удалена запись с ID %d", id)
	return true, nil
}
