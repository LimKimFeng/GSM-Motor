package middleware

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware handles CORS for frontend requests
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		frontendURL := os.Getenv("FRONTEND_URL")
		if frontendURL == "" {
			frontendURL = "http://localhost:5173"
		}

		origin := c.GetHeader("Origin")
		
		// Allow configured frontend URL and localhost for development
		allowedOrigins := []string{
			frontendURL,
			"http://localhost:5173",
			"http://localhost:3000",
			"https://gsm.linjinfeng.site",
		}

		allowed := false
		for _, ao := range allowedOrigins {
			if origin == ao || strings.HasPrefix(origin, ao) {
				allowed = true
				break
			}
		}

		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
		}

		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
