package models

import (
	"time"
)

type OrderItem struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	OrderID         uint      `gorm:"not null;index" json:"order_id"`
	ProductID       uint      `gorm:"not null;index" json:"product_id"`
	Quantity        int       `gorm:"not null" json:"quantity"`
	PriceAtPurchase float64   `gorm:"type:decimal(12,2);not null" json:"price_at_purchase"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	// Relations
	Order   *Order   `gorm:"foreignKey:OrderID" json:"-"`
	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

func (OrderItem) TableName() string {
	return "order_items"
}

// GetSubtotal returns the subtotal for this order item
func (oi *OrderItem) GetSubtotal() float64 {
	return oi.PriceAtPurchase * float64(oi.Quantity)
}
