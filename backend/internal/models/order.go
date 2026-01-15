package models

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"gorm.io/gorm"
)

type OrderStatus string
type ShippingMethod string
type PaymentStatus string

const (
	OrderPending    OrderStatus = "pending"
	OrderProcessing OrderStatus = "processing"
	OrderShipped    OrderStatus = "shipped"
	OrderCompleted  OrderStatus = "completed"
	OrderCancelled  OrderStatus = "cancelled"

	ShippingPickup  ShippingMethod = "pickup"
	ShippingCourier ShippingMethod = "courier"
	ShippingOjol    ShippingMethod = "ojol"

	PaymentPending  PaymentStatus = "pending"
	PaymentUploaded PaymentStatus = "uploaded"
	PaymentVerified PaymentStatus = "verified"
	PaymentFailed   PaymentStatus = "failed"
)

type Order struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	OrderNumber     string         `gorm:"size:255;uniqueIndex;not null" json:"order_number"`
	UserID          uint           `gorm:"not null;index" json:"user_id"`
	TotalPrice      float64        `gorm:"type:decimal(12,2);not null" json:"total_price"`
	ShippingCost    float64        `gorm:"type:decimal(12,2);default:0" json:"shipping_cost"`
	Courier         *string        `gorm:"size:255" json:"courier,omitempty"`
	CourierService  *string        `gorm:"size:255" json:"courier_service,omitempty"`
	TrackingNumber  *string        `gorm:"size:255" json:"tracking_number,omitempty"`
	Status          OrderStatus    `gorm:"type:enum('pending','processing','shipped','completed','cancelled');default:'pending'" json:"status"`
	ShippingMethod  ShippingMethod `gorm:"type:enum('pickup','courier','ojol');default:'courier'" json:"shipping_method"`
	ShippingAddress string         `gorm:"type:text;not null" json:"shipping_address"`
	PaymentStatus   PaymentStatus  `gorm:"type:enum('pending','uploaded','verified','failed');default:'pending'" json:"payment_status"`
	Notes           *string        `gorm:"type:text" json:"notes,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	User          *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Items         []OrderItem    `gorm:"foreignKey:OrderID" json:"items,omitempty"`
	PaymentProofs []PaymentProof `gorm:"foreignKey:OrderID" json:"payment_proofs,omitempty"`
}

func (Order) TableName() string {
	return "orders"
}

// GenerateOrderNumber creates a unique order number: GSM-YYYYMMDD-XXXXX
func GenerateOrderNumber() string {
	date := time.Now().Format("20060102")
	chars := "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	suffix := make([]byte, 5)
	for i := range suffix {
		suffix[i] = chars[rand.Intn(len(chars))]
	}
	return fmt.Sprintf("GSM-%s-%s", date, string(suffix))
}

// GetGrandTotal returns total price + shipping cost
func (o *Order) GetGrandTotal() float64 {
	return o.TotalPrice + o.ShippingCost
}

// GetStatusLabel returns human-readable status in Indonesian
func (o *Order) GetStatusLabel() string {
	switch o.Status {
	case OrderPending:
		return "Menunggu Pembayaran"
	case OrderProcessing:
		return "Diproses"
	case OrderShipped:
		return "Dikirim"
	case OrderCompleted:
		return "Selesai"
	case OrderCancelled:
		return "Dibatalkan"
	default:
		return string(o.Status)
	}
}

// GetPaymentStatusLabel returns human-readable payment status
func (o *Order) GetPaymentStatusLabel() string {
	switch o.PaymentStatus {
	case PaymentPending:
		return "Menunggu Pembayaran"
	case PaymentUploaded:
		return "Bukti Diunggah"
	case PaymentVerified:
		return "Terverifikasi"
	case PaymentFailed:
		return "Gagal"
	default:
		return string(o.PaymentStatus)
	}
}

// GetShippingMethodLabel returns human-readable shipping method
func (o *Order) GetShippingMethodLabel() string {
	switch o.ShippingMethod {
	case ShippingPickup:
		return "Ambil di Tempat"
	case ShippingCourier:
		courier := "Kurir"
		if o.Courier != nil {
			courier = strings.ToUpper(*o.Courier)
		}
		return courier
	case ShippingOjol:
		return "Grab/Gojek/InDriver"
	default:
		return string(o.ShippingMethod)
	}
}
