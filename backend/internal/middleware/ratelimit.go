package middleware

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// Simple in-memory rate limiter
type rateLimiter struct {
	requests map[string][]time.Time
	mu       sync.RWMutex
	limit    int
	window   time.Duration
}

var limiter = &rateLimiter{
	requests: make(map[string][]time.Time),
	limit:    100,
	window:   time.Minute,
}

// RateLimitMiddleware limits requests per IP
func RateLimitMiddleware(requestsPerMinute int) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		limiter.mu.Lock()
		defer limiter.mu.Unlock()

		now := time.Now()
		windowStart := now.Add(-limiter.window)

		// Clean old requests
		if times, exists := limiter.requests[ip]; exists {
			var validTimes []time.Time
			for _, t := range times {
				if t.After(windowStart) {
					validTimes = append(validTimes, t)
				}
			}
			limiter.requests[ip] = validTimes
		}

		// Check limit
		if len(limiter.requests[ip]) >= requestsPerMinute {
			c.JSON(429, gin.H{"error": "Terlalu banyak permintaan. Silakan coba lagi nanti."})
			c.Abort()
			return
		}

		// Add current request
		limiter.requests[ip] = append(limiter.requests[ip], now)

		c.Next()
	}
}

// StrictRateLimitMiddleware for sensitive endpoints like login/register
func StrictRateLimitMiddleware() gin.HandlerFunc {
	return RateLimitMiddleware(10) // 10 requests per minute
}
