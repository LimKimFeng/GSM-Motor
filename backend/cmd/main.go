package main

import (
	"log"
	"os"

	"gsm-motor/internal/config"
	"gsm-motor/internal/database"
	"gsm-motor/internal/handlers/admin"
	"gsm-motor/internal/handlers/auth"
	"gsm-motor/internal/handlers/cart"
	"gsm-motor/internal/handlers/checkout"
	"gsm-motor/internal/handlers/products"
	"gsm-motor/internal/handlers/shipping"
	"gsm-motor/internal/middleware"
	"gsm-motor/internal/models"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	if err := config.LoadConfig(); err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Connect to database
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate models
	if err := database.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Product{},
		&models.ProductImage{},
		&models.Banner{},
		&models.CartItem{},
		&models.Order{},
		&models.OrderItem{},
		&models.PaymentProof{},
	); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Initialize Google OAuth
	auth.InitGoogleOAuth()

	// Create uploads directory
	if err := os.MkdirAll(config.AppConfig.UploadPath, 0755); err != nil {
		log.Println("Warning: Failed to create uploads directory:", err)
	}

	// Setup Gin
	if config.AppConfig.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Middleware
	r.Use(middleware.CORSMiddleware())

	// Security headers
	r.Use(func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		// Hide server information
		c.Header("Server", "")
		c.Next()
	})

	// Serve static files (uploads only)
	r.Static("/uploads", config.AppConfig.UploadPath)

	// API routes
	api := r.Group("/api")
	{
		// Public routes
		api.GET("/products", products.ListProducts)
		api.GET("/products/:slug", products.GetProduct)
		api.GET("/products/search", products.SearchProducts)
		api.GET("/categories", products.GetCategories)
		api.GET("/categories/:slug", products.GetProductsByCategory)
		api.GET("/banners", getBanners)

		// Shipping (public)
		api.GET("/shipping/destinations", shipping.SearchDestinations)
		api.GET("/shipping/options", middleware.OptionalAuthMiddleware(), shipping.GetShippingOptions)
		api.GET("/shipping/store", shipping.GetStoreInfo)

		// Auth routes
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/register", middleware.StrictRateLimitMiddleware(), auth.Register)
			authGroup.POST("/login", middleware.StrictRateLimitMiddleware(), auth.Login)
			authGroup.POST("/logout", auth.Logout)
			authGroup.POST("/refresh", auth.RefreshToken)
			authGroup.POST("/verify-otp", middleware.StrictRateLimitMiddleware(), auth.VerifyOTP)
			authGroup.POST("/resend-otp", middleware.StrictRateLimitMiddleware(), auth.ResendOTP)
			authGroup.GET("/google/redirect", auth.GoogleRedirect)
			authGroup.GET("/google/callback", auth.GoogleCallback)
			authGroup.GET("/me", middleware.AuthMiddleware(), auth.GetMe)
		}

		// Protected routes (requires auth)
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// Cart
			protected.GET("/cart", cart.GetCart)
			protected.GET("/cart/count", cart.GetCartCount)
			protected.POST("/cart", cart.AddToCart)
			protected.PATCH("/cart/:id", cart.UpdateCartItem)
			protected.DELETE("/cart/:id", cart.RemoveCartItem)
			protected.DELETE("/cart", cart.ClearCart)

			// Checkout
			protected.GET("/checkout", checkout.PrepareCheckout)
			protected.POST("/checkout", checkout.ProcessCheckout)
			protected.POST("/shipping/cost", shipping.CalculateCost)

			// Orders
			protected.GET("/orders", checkout.GetOrders)
			protected.GET("/orders/:id", checkout.GetOrder)
			protected.POST("/orders/:id/payment", checkout.UploadPaymentProof)

			// Profile
			protected.PATCH("/profile", updateProfile)
			protected.PATCH("/profile/address", updateAddress)
		}

		// Admin routes
		adminGroup := api.Group("/admin")
		adminGroup.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			// Dashboard
			adminGroup.GET("/dashboard", admin.AdminDashboard)
			adminGroup.GET("/subadmin-stats", admin.GetSubadminStats)

			// Products
			adminGroup.GET("/products", admin.AdminListProducts)
			adminGroup.POST("/products", admin.AdminCreateProduct)
			adminGroup.PUT("/products/:id", admin.AdminUpdateProduct)
			adminGroup.DELETE("/products/:id", admin.AdminDeleteProduct)
			adminGroup.POST("/products/bulk-price", admin.BulkPriceUpdate)

			// Categories
			adminGroup.GET("/categories", admin.ListCategories)
			adminGroup.POST("/categories", admin.CreateCategory)
			adminGroup.PUT("/categories/:id", admin.UpdateCategory)
			adminGroup.DELETE("/categories/:id", admin.DeleteCategory)

			// Banners
			adminGroup.GET("/banners", admin.ListBanners)
			adminGroup.POST("/banners", admin.CreateBanner)
			adminGroup.DELETE("/banners/:id", admin.DeleteBanner)
			adminGroup.PATCH("/banners/:id/toggle", admin.ToggleBanner)

			// Orders
			adminGroup.GET("/orders", admin.AdminListOrders)
			adminGroup.GET("/orders/:id", admin.AdminGetOrder)
			adminGroup.PATCH("/orders/:id", admin.AdminUpdateOrderStatus)
			adminGroup.POST("/orders/:id/verify-payment/:proofId", admin.AdminVerifyPayment)
			adminGroup.GET("/orders/:id/receipt", admin.GetReceiptData)
		}
	}

	// Health check (minimal info for security)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy"})
	})

	// API info endpoint (protected, only accessible via /api/info)
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		protected.GET("/info", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"name":    "GSM Motor API",
				"version": "1.0.0",
				"env":     config.AppConfig.AppEnv,
			})
		})
	}

	// NoRoute handler - return 404 for unknown routes (don't expose system info)
	r.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "Not found"})
	})

	// Start server
	port := config.AppConfig.ServerPort
	log.Printf("🚀 Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// getBanners returns active banners for homepage
func getBanners(c *gin.Context) {
	var banners []models.Banner
	database.DB.Where("is_active = ?", true).Order("`order` ASC").Find(&banners)
	c.JSON(200, gin.H{"data": banners})
}

// updateProfile handles profile updates
func updateProfile(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	if user == nil {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		Name  string `json:"name"`
		Phone string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Data tidak valid"})
		return
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Phone != "" {
		user.Phone = &req.Phone
	}

	database.DB.Save(user)
	c.JSON(200, gin.H{"message": "Profil berhasil diperbarui"})
}

// updateAddress handles address updates
func updateAddress(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	if user == nil {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		Province      string `json:"province"`
		ProvinceID    string `json:"province_id"`
		City          string `json:"city"`
		CityID        string `json:"city_id"`
		District      string `json:"district"`
		DistrictID    string `json:"district_id"`
		Subdistrict   string `json:"subdistrict"`
		SubdistrictID string `json:"subdistrict_id"`
		PostalCode    string `json:"postal_code"`
		AddressDetail string `json:"address_detail"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Data tidak valid"})
		return
	}

	if req.Province != "" {
		user.Province = &req.Province
	}
	if req.ProvinceID != "" {
		user.ProvinceID = &req.ProvinceID
	}
	if req.City != "" {
		user.City = &req.City
	}
	if req.CityID != "" {
		user.CityID = &req.CityID
	}
	if req.District != "" {
		user.District = &req.District
	}
	if req.DistrictID != "" {
		user.DistrictID = &req.DistrictID
	}
	if req.Subdistrict != "" {
		user.Subdistrict = &req.Subdistrict
	}
	if req.SubdistrictID != "" {
		user.SubdistrictID = &req.SubdistrictID
	}
	if req.PostalCode != "" {
		user.PostalCode = &req.PostalCode
	}
	if req.AddressDetail != "" {
		user.AddressDetail = &req.AddressDetail
	}

	database.DB.Save(user)
	c.JSON(200, gin.H{"message": "Alamat berhasil diperbarui"})
}
