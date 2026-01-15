package models

import (
	"strings"
	"time"

	"gorm.io/gorm"
)

type Product struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	CategoryID      uint           `gorm:"not null;index" json:"category_id"`
	Name            string         `gorm:"size:255;not null;index" json:"name"`
	Slug            string         `gorm:"size:255;uniqueIndex;not null" json:"slug"`
	Description     *string        `gorm:"type:text" json:"description,omitempty"`
	Price           float64        `gorm:"type:decimal(15,2);not null" json:"price"`
	Price3Items     *float64       `gorm:"type:decimal(12,2)" json:"price_3_items,omitempty"`
	Price5Items     *float64       `gorm:"type:decimal(12,2)" json:"price_5_items,omitempty"`
	Stock           int            `gorm:"default:0" json:"stock"`
	Weight          int            `gorm:"default:500" json:"weight"` // in grams
	ImagePath       *string        `gorm:"size:255" json:"image_path,omitempty"`
	LastPriceUpdate *time.Time     `json:"last_price_update,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Category *Category       `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Images   []ProductImage  `gorm:"foreignKey:ProductID" json:"images,omitempty"`
}

// GetImageURL returns full URL for the primary image
func (p *Product) GetImageURL(baseURL string) string {
	if p.ImagePath == nil || *p.ImagePath == "" {
		return baseURL + "/placeholder.webp"
	}
	return baseURL + "/uploads/" + *p.ImagePath
}

// GetEffectivePrice returns price based on quantity
func (p *Product) GetEffectivePrice(quantity int) float64 {
	if quantity >= 5 && p.Price5Items != nil && *p.Price5Items > 0 {
		return *p.Price5Items
	}
	if quantity >= 3 && p.Price3Items != nil && *p.Price3Items > 0 {
		return *p.Price3Items
	}
	return p.Price
}

func (Product) TableName() string {
	return "products"
}

// Scope for searching products
func ProductSearch(query string) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if query == "" {
			return db
		}
		terms := strings.Fields(query)
		for _, term := range terms {
			if term != "" {
				db = db.Where("name LIKE ?", "%"+term+"%")
			}
		}
		return db
	}
}
