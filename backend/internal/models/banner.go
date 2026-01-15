package models

import (
	"time"

	"gorm.io/gorm"
)

type Banner struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Title     *string        `gorm:"size:255" json:"title,omitempty"`
	ImagePath string         `gorm:"size:255;not null" json:"image_path"`
	IsActive  bool           `gorm:"default:true" json:"is_active"`
	Order     int            `gorm:"default:0" json:"order"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Banner) TableName() string {
	return "banners"
}

// GetImageURL returns full URL for the banner image
func (b *Banner) GetImageURL(baseURL string) string {
	if b.ImagePath == "" {
		return baseURL + "/placeholder-banner.webp"
	}
	return baseURL + "/uploads/" + b.ImagePath
}
