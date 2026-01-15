package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"gsm-motor/internal/config"
	"gsm-motor/internal/database"
	"gsm-motor/internal/models"
	"gsm-motor/internal/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var googleOauthConfig *oauth2.Config

// InitGoogleOAuth initializes Google OAuth config
func InitGoogleOAuth() {
	cfg := config.AppConfig
	googleOauthConfig = &oauth2.Config{
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		RedirectURL:  cfg.GoogleRedirectURL,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}
}

// GoogleRedirect redirects user to Google OAuth
func GoogleRedirect(c *gin.Context) {
	if googleOauthConfig == nil || googleOauthConfig.ClientID == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Google OAuth tidak dikonfigurasi"})
		return
	}

	// Generate state token for CSRF protection
	state := fmt.Sprintf("%d", time.Now().UnixNano())
	c.SetCookie("oauth_state", state, 300, "/", "", false, true)

	url := googleOauthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// GoogleCallback handles the OAuth callback from Google
func GoogleCallback(c *gin.Context) {
	// Verify state
	stateCookie, err := c.Cookie("oauth_state")
	if err != nil || stateCookie != c.Query("state") {
		c.Redirect(http.StatusTemporaryRedirect, "/login?error=invalid_state")
		return
	}

	// Exchange code for token
	code := c.Query("code")
	if code == "" {
		c.Redirect(http.StatusTemporaryRedirect, "/login?error=no_code")
		return
	}

	token, err := googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "/login?error=token_exchange")
		return
	}

	// Get user info from Google
	client := googleOauthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "/login?error=userinfo")
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var googleUser struct {
		ID            string `json:"id"`
		Email         string `json:"email"`
		Name          string `json:"name"`
		Picture       string `json:"picture"`
		VerifiedEmail bool   `json:"verified_email"`
	}

	if err := json.Unmarshal(body, &googleUser); err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "/login?error=parse_user")
		return
	}

	// Find or create user
	var user models.User
	result := database.DB.Where("google_id = ? OR email = ?", googleUser.ID, strings.ToLower(googleUser.Email)).First(&user)

	if result.Error != nil {
		// Create new user
		now := time.Now()
		user = models.User{
			GoogleID:        &googleUser.ID,
			Name:            googleUser.Name,
			Email:           strings.ToLower(googleUser.Email),
			Role:            models.RoleCustomer,
			EmailVerifiedAt: &now, // Google accounts are pre-verified
		}

		if err := database.DB.Create(&user).Error; err != nil {
			c.Redirect(http.StatusTemporaryRedirect, "/login?error=create_user")
			return
		}
	} else {
		// Update existing user's Google ID if not set
		if user.GoogleID == nil {
			user.GoogleID = &googleUser.ID
			// Also verify email if not verified
			if user.EmailVerifiedAt == nil {
				now := time.Now()
				user.EmailVerifiedAt = &now
			}
			database.DB.Save(&user)
		}
	}

	// Generate tokens
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, string(user.Role))
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "/login?error=token_gen")
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email, string(user.Role))
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "/login?error=refresh_token")
		return
	}

	// Set cookies
	setAuthCookies(c, accessToken, refreshToken)

	// Clear state cookie
	c.SetCookie("oauth_state", "", -1, "/", "", false, true)

	// Redirect to frontend dashboard or home
	frontendURL := config.AppConfig.ServerPort
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}

	// Redirect based on role
	redirectPath := "/"
	if user.Role == models.RoleAdmin || user.Role == models.RoleSubAdmin {
		redirectPath = "/admin"
	}

	c.Redirect(http.StatusTemporaryRedirect, redirectPath)
}
