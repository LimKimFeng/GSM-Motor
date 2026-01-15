package models

import (
	"time"

	"gorm.io/gorm"
)

type PaymentProofStatus string

const (
	ProofPending  PaymentProofStatus = "pending"
	ProofVerified PaymentProofStatus = "verified"
	ProofRejected PaymentProofStatus = "rejected"
)

type PaymentProof struct {
	ID         uint               `gorm:"primaryKey" json:"id"`
	OrderID    uint               `gorm:"not null;index" json:"order_id"`
	ImagePath  string             `gorm:"size:255;not null" json:"image_path"`
	Status     PaymentProofStatus `gorm:"type:enum('pending','verified','rejected');default:'pending'" json:"status"`
	AdminNotes *string            `gorm:"type:text" json:"admin_notes,omitempty"`
	CreatedAt  time.Time          `json:"created_at"`
	UpdatedAt  time.Time          `json:"updated_at"`
	DeletedAt  gorm.DeletedAt     `gorm:"index" json:"-"`

	// Relations
	Order *Order `gorm:"foreignKey:OrderID" json:"-"`
}

func (PaymentProof) TableName() string {
	return "payment_proofs"
}

// GetImageURL returns full URL for the payment proof image
func (pp *PaymentProof) GetImageURL(baseURL string) string {
	if pp.ImagePath == "" {
		return ""
	}
	return baseURL + "/uploads/" + pp.ImagePath
}
