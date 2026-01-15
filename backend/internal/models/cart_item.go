package models

import (
	"time"
)

type CartItem struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;uniqueIndex:cart_items_user_id_product_id_unique" json:"user_id"`
	ProductID uint      `gorm:"not null;uniqueIndex:cart_items_user_id_product_id_unique" json:"product_id"`
	Quantity  int       `gorm:"not null;default:1" json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	User    *User    `gorm:"foreignKey:UserID" json:"-"`
	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

func (CartItem) TableName() string {
	return "cart_items"
}

// GetSubtotal returns the subtotal for this cart item
func (ci *CartItem) GetSubtotal() float64 {
	if ci.Product == nil {
		return 0
	}
	return ci.Product.GetEffectivePrice(ci.Quantity) * float64(ci.Quantity)
}

// GetTotalWeight returns total weight for this cart item
func (ci *CartItem) GetTotalWeight() int {
	if ci.Product == nil {
		return 0
	}
	return ci.Product.Weight * ci.Quantity
}
