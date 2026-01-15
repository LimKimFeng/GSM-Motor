package auth

import (
	"net/http"
	"strings"
	"time"

	"gsm-motor/internal/config"
	"gsm-motor/internal/database"
	"gsm-motor/internal/models"
	"gsm-motor/internal/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// RegisterRequest represents the registration request body
type RegisterRequest struct {
	Name            string `json:"name" binding:"required,min=2"`
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=6"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
	Phone           string `json:"phone" binding:"required"`
	Honeypot        string `json:"website"` // Honeypot field - should be empty
}

// Register handles user registration
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid: " + err.Error()})
		return
	}

	// Honeypot check - if filled, it's a bot
	if req.Honeypot != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Registrasi gagal"})
		return
	}

	// Validate password match
	if req.Password != req.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password tidak cocok"})
		return
	}

	// Check if email already exists
	var existingUser models.User
	if err := database.DB.Where("email = ?", strings.ToLower(req.Email)).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email sudah terdaftar"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses password"})
		return
	}

	// Generate OTP
	otpCode, err := utils.GenerateOTP()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat kode OTP"})
		return
	}
	otpExpiry := time.Now().Add(10 * time.Minute)

	// Create user
	hashedPwd := string(hashedPassword)
	user := models.User{
		Name:         req.Name,
		Email:        strings.ToLower(req.Email),
		Password:     &hashedPwd,
		Phone:        &req.Phone,
		Role:         models.RoleCustomer,
		OTPCode:      &otpCode,
		OTPExpiresAt: &otpExpiry,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat akun: " + err.Error()})
		return
	}

	// Send OTP email (async - don't block registration)
	go utils.SendOTPEmail(user.Email, otpCode, user.Name)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registrasi berhasil. Silakan cek email untuk kode verifikasi.",
		"email":   user.Email,
	})
}

// LoginRequest represents the login request body
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Login handles user login
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	// Find user by email
	var user models.User
	if err := database.DB.Where("email = ?", strings.ToLower(req.Email)).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah"})
		return
	}

	// Check password
	if user.Password == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Silakan login menggunakan Google"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah"})
		return
	}

	// Check if email is verified
	if user.EmailVerifiedAt == nil {
		// Generate new OTP and send
		otpCode, _ := utils.GenerateOTP()
		otpExpiry := time.Now().Add(10 * time.Minute)
		user.OTPCode = &otpCode
		user.OTPExpiresAt = &otpExpiry
		database.DB.Save(&user)
		go utils.SendOTPEmail(user.Email, otpCode, user.Name)

		c.JSON(http.StatusForbidden, gin.H{
			"error":        "Email belum diverifikasi. Kode OTP baru telah dikirim.",
			"requires_otp": true,
			"email":        user.Email,
		})
		return
	}

	// Generate tokens
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
		"message": "Login berhasil",
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

// Logout handles user logout
func Logout(c *gin.Context) {
	// Clear cookies
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logout berhasil"})
}

// RefreshToken handles token refresh
func RefreshToken(c *gin.Context) {
	// Try to get refresh token from cookie
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		// Try from body
		var req struct {
			RefreshToken string `json:"refresh_token"`
		}
		if err := c.ShouldBindJSON(&req); err != nil || req.RefreshToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token tidak ditemukan"})
			return
		}
		refreshToken = req.RefreshToken
	}

	// Parse refresh token
	claims, err := utils.ParseToken(refreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token tidak valid"})
		return
	}

	// Get user
	var user models.User
	if err := database.DB.First(&user, claims.UserID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User tidak ditemukan"})
		return
	}

	// Generate new tokens
	newAccessToken, err := utils.GenerateAccessToken(user.ID, user.Email, string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token"})
		return
	}

	newRefreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email, string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat refresh token"})
		return
	}

	// Set cookies
	setAuthCookies(c, newAccessToken, newRefreshToken)

	c.JSON(http.StatusOK, gin.H{
		"access_token":  newAccessToken,
		"refresh_token": newRefreshToken,
	})
}

// GetMe returns the current authenticated user
func GetMe(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	u := user.(*models.User)
	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":             u.ID,
			"name":           u.Name,
			"email":          u.Email,
			"phone":          u.Phone,
			"role":           u.Role,
			"province":       u.Province,
			"city":           u.City,
			"district":       u.District,
			"subdistrict":    u.Subdistrict,
			"postal_code":    u.PostalCode,
			"address_detail": u.AddressDetail,
			"has_address":    u.HasCompleteAddress(),
		},
	})
}

// setAuthCookies sets JWT tokens as HTTP-only cookies
func setAuthCookies(c *gin.Context, accessToken, refreshToken string) {
	cfg := config.AppConfig
	secure := cfg.AppEnv == "production"

	// Access token cookie (shorter expiry)
	c.SetCookie(
		"access_token",
		accessToken,
		cfg.JWTExpireMinutes*60,
		"/",
		"",
		secure,
		true, // HTTP-only
	)

	// Refresh token cookie (longer expiry)
	c.SetCookie(
		"refresh_token",
		refreshToken,
		cfg.RefreshExpireDays*24*60*60,
		"/",
		"",
		secure,
		true,
	)
}
