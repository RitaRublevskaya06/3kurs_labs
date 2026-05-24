package models

type Celebrity struct {
	Id           int    `gorm:"primaryKey;autoIncrement:false" json:"id"`
	FullName     string `gorm:"column:full_name" json:"fullName"`
	Nationality  string `json:"nationality"`
	ReqPhotoPath string `gorm:"column:req_photo_path" json:"reqPhotoPath"`
}

func (Celebrity) TableName() string {
	return "celebrities"
}
