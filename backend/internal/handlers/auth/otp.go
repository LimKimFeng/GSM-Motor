package auth

import (
	"net/http"
	"strings"
	"time"

	"gsm-motor/internal/database"
	"gsm-motor/internal/models"
	"gsm-motor/internal/utils"

	"github.com/gin-gonic/gin"
)

// VerifyOTPRequest represents the OTP verification request
type VerifyOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
	OTP   string `json:"otp" binding:"required,len=6"`
}

// VerifyOTP verifies the OTP code and activates the user account
func VerifyOTP(c *gin.Context) {
	var req VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	// Find user by email
	var user models.User
	if err := database.DB.Where("email = ?", strings.ToLower(req.Email)).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	// Check if already verified
	if user.EmailVerifiedAt != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email sudah diverifikasi"})
		return
	}

	// Check OTP
	if user.OTPCode == nil || *user.OTPCode != req.OTP {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode OTP salah"})
		return
	}

	// Check OTP expiry
	if user.OTPExpiresAt == nil || time.Now().After(*user.OTPExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode OTP sudah kadaluarsa. Silakan minta kode baru."})
		return
	}

	// Verify email
	now := time.Now()
	user.EmailVerifiedAt = &now
	user.OTPCode = nil
	user.OTPExpiresAt = nil

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memverifikasi akun"})
		return
	}

	// Generate tokens and log user in
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token"})
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email, string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat refresh token"})
		return
	}

	// Set cookies
	setAuthCookies(c, accessToken, refreshToken)

	c.JSON(http.StatusOK, gin.H{
		"message": "Verifikasi berhasil. Selamat datang!",
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

// ResendOTPRequest represents the resend OTP request
type ResendOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ResendOTP sends a new OTP code to the user's email
func ResendOTP(c *gin.Context) {
	var req ResendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email tidak valid"})
		return
	}

	// Find user
	var user models.User
	if err := database.DB.Where("email = ?", strings.ToLower(req.Email)).First(&user).Error; err != nil {
		// Don't reveal if email exists
		c.JSON(http.StatusOK, gin.H{"message": "Jika email terdaftar, kode OTP telah dikirim."})
		return
	}

	// Check if already verified
	if user.EmailVerifiedAt != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email sudah diverifikasi"})
		return
	}

	// Rate limit: check if last OTP was sent less than 1 minute ago
	if user.OTPExpiresAt != nil {
		lastSent := user.OTPExpiresAt.Add(-10 * time.Minute) // OTP expires in 10 min, so last sent = expiry - 10 min
		if time.Since(lastSent) < time.Minute {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Mohon tunggu 1 menit sebelum meminta kode baru"})
			return
		}
	}

	// Generate new OTP
	otpCode, err := utils.GenerateOTP()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat kode OTP"})
		return
	}

	otpExpiry := time.Now().Add(10 * time.Minute)
	user.OTPCode = &otpCode
	user.OTPExpiresAt = &otpExpiry

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan kode OTP"})
		return
	}

	// Send email
	go utils.SendOTPEmail(user.Email, otpCode, user.Name)

	c.JSON(http.StatusOK, gin.H{"message": "Kode OTP baru telah dikirim ke email Anda"})
}
