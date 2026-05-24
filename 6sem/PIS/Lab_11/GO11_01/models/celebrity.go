package models

type Celebrity struct {
	Id           int    `json:"id" example:"1"`
	FullName     string `json:"fullName" example:"Leonardo DiCaprio"`
	Nationality  string `json:"nationality" example:"American"`
	ReqPhotoPath string `json:"reqPhotoPath" example:"/images/dicaprio.jpg"`
}
