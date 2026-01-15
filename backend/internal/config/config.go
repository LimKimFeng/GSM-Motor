package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	// Server
	ServerPort string
	AppEnv     string

	// Database
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	// JWT
	JWTSecret        string
	JWTExpireMinutes int
	RefreshExpireDays int

	// Google OAuth
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string

	// SMTP
	SMTPHost     string
	SMTPPort     string
	SMTPUser     string
	SMTPPassword string
	SMTPFrom     string

	// RajaOngkir
	RajaOngkirAPIKey     string
	RajaOngkirDeliveryKey string
	RajaOngkirBaseURL    string

	// Store
	StoreOriginSubdistrictID string
	StoreWhatsApp            string
	StoreName                string
	StoreAddress             string

	// Bank
	BankName    string
	BankAccount string
	BankNumber  string

	// Upload
	UploadPath    string
	WatermarkPath string
	MaxImageSize  int64
}

var AppConfig *Config

func LoadConfig() error {
	_ = godotenv.Load()

	jwtExpire, _ := strconv.Atoi(getEnv("JWT_EXPIRE_MINUTES", "60"))
	refreshExpire, _ := strconv.Atoi(getEnv("REFRESH_EXPIRE_DAYS", "30"))
	maxImageSize, _ := strconv.ParseInt(getEnv("MAX_IMAGE_SIZE", "10485760"), 10, 64)

	AppConfig = &Config{
		// Server
		ServerPort: getEnv("SERVER_PORT", "8080"),
		AppEnv:     getEnv("APP_ENV", "development"),

		// Database
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "3306"),
		DBUser:     getEnv("DB_USER", "root"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "db_gsm_motor"),

		// JWT
		JWTSecret:         getEnv("JWT_SECRET", "your-super-secret-key-change-in-production"),
		JWTExpireMinutes:  jwtExpire,
		RefreshExpireDays: refreshExpire,

		// Google OAuth
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:  getEnv("GOOGLE_REDIRECT_URL", "http://localhost:8080/api/auth/google/callback"),

		// SMTP
		SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:     getEnv("SMTP_PORT", "587"),
		SMTPUser:     getEnv("SMTP_USER", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		SMTPFrom:     getEnv("SMTP_FROM", "noreply@gsmmotor.com"),

		// RajaOngkir
		RajaOngkirAPIKey:      getEnv("RAJAONGKIR_API_KEY", "FlW3zP4Y8acee1f1c54ab8ceVqgaCjGQ"),
		RajaOngkirDeliveryKey: getEnv("RAJAONGKIR_DELIVERY_KEY", "p2OZ2QpP8acee1f1c54ab8ceYkoa2Hjl"),
		RajaOngkirBaseURL:     getEnv("RAJAONGKIR_BASE_URL", "https://rajaongkir.komerce.id/api/v1"),

		// Store
		StoreOriginSubdistrictID: getEnv("STORE_ORIGIN_SUBDISTRICT_ID", ""),
		StoreWhatsApp:            getEnv("STORE_WHATSAPP", "6281386363979"),
		StoreName:                getEnv("STORE_NAME", "GSM Motor"),
		StoreAddress:             getEnv("STORE_ADDRESS", ""),

		// Bank
		BankName:    getEnv("BANK_NAME", ""),
		BankAccount: getEnv("BANK_ACCOUNT", ""),
		BankNumber:  getEnv("BANK_NUMBER", ""),

		// Upload
		UploadPath:    getEnv("UPLOAD_PATH", "./uploads"),
		WatermarkPath: getEnv("WATERMARK_PATH", "./assets/watermark.png"),
		MaxImageSize:  maxImageSize,
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
