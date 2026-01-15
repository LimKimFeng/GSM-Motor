package models

import (
	"time"
)

type ProductImage struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ProductID uint      `gorm:"not null;index" json:"product_id"`
	ImagePath string    `gorm:"size:255;not null" json:"image_path"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	Product *Product `gorm:"foreignKey:ProductID" json:"-"`
}

func (ProductImage) TableName() string {
	return "product_images"
}

// GetImageURL returns full URL for this image
func (pi *ProductImage) GetImageURL(baseURL string) string {
	if pi.ImagePath == "" {
		return baseURL + "/placeholder.webp"
	}
	return baseURL + "/uploads/" + pi.ImagePath
}
