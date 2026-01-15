package models

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleAdmin    UserRole = "admin"
	RoleSubAdmin UserRole = "subadmin"
	RoleCustomer UserRole = "customer"
)

type User struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	GoogleID        *string        `gorm:"size:255" json:"google_id,omitempty"`
	Name            string         `gorm:"size:255;not null" json:"name"`
	Email           string         `gorm:"size:255;uniqueIndex;not null" json:"email"`
	Phone           *string        `gorm:"size:255" json:"phone,omitempty"`
	Password        *string        `gorm:"size:255" json:"-"`
	Role            UserRole       `gorm:"type:enum('admin','subadmin','customer');default:'customer'" json:"role"`
	EmailVerifiedAt *time.Time     `json:"email_verified_at,omitempty"`
	RememberToken   *string        `gorm:"size:100" json:"-"`

	// Address fields
	Province       *string `gorm:"size:255" json:"province,omitempty"`
	ProvinceID     *string `gorm:"size:10" json:"province_id,omitempty"`
	City           *string `gorm:"size:255" json:"city,omitempty"`
	CityID         *string `gorm:"size:10" json:"city_id,omitempty"`
	District       *string `gorm:"size:255" json:"district,omitempty"`
	DistrictID     *string `gorm:"size:10" json:"district_id,omitempty"`
	Subdistrict    *string `gorm:"size:255" json:"subdistrict,omitempty"`
	SubdistrictID  *string `gorm:"size:10" json:"subdistrict_id,omitempty"`
	PostalCode     *string `gorm:"size:255" json:"postal_code,omitempty"`
	AddressDetail  *string `gorm:"type:text" json:"address_detail,omitempty"`

	// OTP
	OTPCode      *string    `gorm:"size:6" json:"-"`
	OTPExpiresAt *time.Time `json:"-"`

	// Timestamp
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	CartItems []CartItem `gorm:"foreignKey:UserID" json:"cart_items,omitempty"`
	Orders    []Order    `gorm:"foreignKey:UserID" json:"orders,omitempty"`
}

func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

func (u *User) IsSubAdmin() bool {
	return u.Role == RoleSubAdmin
}

func (u *User) HasCompleteAddress() bool {
	return u.Phone != nil && *u.Phone != "" &&
		u.AddressDetail != nil && *u.AddressDetail != "" &&
		u.Province != nil && *u.Province != "" &&
		u.City != nil && *u.City != ""
}

func (u *User) GetFullAddress() string {
	address := ""
	if u.AddressDetail != nil {
		address = *u.AddressDetail
	}
	if u.District != nil && *u.District != "" {
		address += ", " + *u.District
	}
	if u.City != nil && *u.City != "" {
		address += ", " + *u.City
	}
	if u.Province != nil && *u.Province != "" {
		address += ", " + *u.Province
	}
	if u.PostalCode != nil && *u.PostalCode != "" {
		address += " " + *u.PostalCode
	}
	return address
}

// TableName specifies the table name
func (User) TableName() string {
	return "users"
}
