package middleware

import (
	"net/http"
	"strings"

	"gsm-motor/internal/config"
	"gsm-motor/internal/database"
	"gsm-motor/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// AuthMiddleware validates JWT token from cookie or Authorization header
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string

		// Try to get token from cookie first
		if cookie, err := c.Cookie("access_token"); err == nil && cookie != "" {
			tokenString = cookie
		}

		// Fallback to Authorization header
		if tokenString == "" {
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token tidak ditemukan"})
			c.Abort()
			return
		}

		// Parse and validate token
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(config.AppConfig.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid"})
			c.Abort()
			return
		}

		// Get user from database
		var user models.User
		if err := database.DB.First(&user, claims.UserID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User tidak ditemukan"})
			c.Abort()
			return
		}

		// Set user in context
		c.Set("user", &user)
		c.Set("user_id", user.ID)
		c.Set("user_role", user.Role)

		c.Next()
	}
}

// OptionalAuthMiddleware sets user in context if token exists, but doesn't require it
func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string

		if cookie, err := c.Cookie("access_token"); err == nil && cookie != "" {
			tokenString = cookie
		}

		if tokenString == "" {
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenString != "" {
			claims := &Claims{}
			token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
				return []byte(config.AppConfig.JWTSecret), nil
			})

			if err == nil && token.Valid {
				var user models.User
				if err := database.DB.First(&user, claims.UserID).Error; err == nil {
					c.Set("user", &user)
					c.Set("user_id", user.ID)
					c.Set("user_role", user.Role)
				}
			}
		}

		c.Next()
	}
}

// AdminMiddleware requires user to be admin or subadmin
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		u := user.(*models.User)
		if u.Role != models.RoleAdmin && u.Role != models.RoleSubAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// SuperAdminMiddleware requires user to be admin only (not subadmin)
func SuperAdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		u := user.(*models.User)
		if u.Role != models.RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Hanya admin yang dapat mengakses"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// GetCurrentUser helper to get user from context
func GetCurrentUser(c *gin.Context) *models.User {
	user, exists := c.Get("user")
	if !exists {
		return nil
	}
	return user.(*models.User)
}
