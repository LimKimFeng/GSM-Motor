package checkout

import (
	"fmt"
	"net/http"
	"strconv"

	"gsm-motor/internal/config"
	"gsm-motor/internal/database"
	"gsm-motor/internal/middleware"
	"gsm-motor/internal/models"
	"gsm-motor/internal/utils"

	"github.com/gin-gonic/gin"
)

// PrepareCheckout validates cart and returns checkout preview
func PrepareCheckout(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get cart items
	var cartItems []models.CartItem
	database.DB.
		Preload("Product").
		Where("user_id = ?", user.ID).
		Find(&cartItems)

	if len(cartItems) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Keranjang belanja kosong"})
		return
	}

	// Calculate totals
	var subtotal float64
	var totalWeight int
	for _, item := range cartItems {
		if item.Product != nil {
			subtotal += item.Product.GetEffectivePrice(item.Quantity) * float64(item.Quantity)
			totalWeight += item.Product.Weight * item.Quantity
		}
	}

	// Check address completeness
	hasAddress := user.HasCompleteAddress()

	c.JSON(http.StatusOK, gin.H{
		"items":        cartItems,
		"subtotal":     subtotal,
		"total_weight": totalWeight,
		"has_address":  hasAddress,
		"user": gin.H{
			"name":           user.Name,
			"email":          user.Email,
			"phone":          user.Phone,
			"province":       user.Province,
			"city":           user.City,
			"district":       user.District,
			"subdistrict":    user.Subdistrict,
			"postal_code":    user.PostalCode,
			"address_detail": user.AddressDetail,
			"subdistrict_id": user.SubdistrictID,
		},
		"bank": gin.H{
			"name":    config.AppConfig.BankName,
			"account": config.AppConfig.BankAccount,
			"number":  config.AppConfig.BankNumber,
		},
	})
}

// CheckoutRequest represents the checkout request
type CheckoutRequest struct {
	ShippingMethod string  `json:"shipping_method" binding:"required,oneof=pickup ojol courier"`
	Courier        string  `json:"courier"`         // Required if shipping_method is courier
	CourierService string  `json:"courier_service"` // e.g., REG, OKE
	ShippingCost   float64 `json:"shipping_cost"`
	Notes          string  `json:"notes"`
}

// ProcessCheckout creates a new order
func ProcessCheckout(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid: " + err.Error()})
		return
	}

	// Validate courier for courier method
	if req.ShippingMethod == "courier" && req.Courier == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Silakan pilih kurir"})
		return
	}

	// Validate address for courier method
	if req.ShippingMethod == "courier" && !user.HasCompleteAddress() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Silakan lengkapi alamat terlebih dahulu"})
		return
	}

	// Get cart items
	var cartItems []models.CartItem
	database.DB.
		Preload("Product").
		Where("user_id = ?", user.ID).
		Find(&cartItems)

	if len(cartItems) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Keranjang belanja kosong"})
		return
	}

	// Calculate totals
	var subtotal float64
	for _, item := range cartItems {
		if item.Product != nil {
			subtotal += item.Product.GetEffectivePrice(item.Quantity) * float64(item.Quantity)
		}
	}

	// Determine shipping cost
	shippingCost := float64(0)
	switch req.ShippingMethod {
	case "pickup":
		shippingCost = 0
	case "ojol":
		shippingCost = 0 // Will be arranged via WhatsApp
	case "courier":
		shippingCost = req.ShippingCost
	}

	// Build shipping address
	shippingAddress := user.GetFullAddress()
	if user.Phone != nil {
		shippingAddress += fmt.Sprintf(" (Telp: %s)", *user.Phone)
	}

	// Start transaction
	tx := database.DB.Begin()

	// Generate order number
	orderNumber := models.GenerateOrderNumber()

	// Create order
	order := models.Order{
		OrderNumber:     orderNumber,
		UserID:          user.ID,
		TotalPrice:      subtotal,
		ShippingCost:    shippingCost,
		ShippingMethod:  models.ShippingMethod(req.ShippingMethod),
		ShippingAddress: shippingAddress,
		Status:          models.OrderPending,
		PaymentStatus:   models.PaymentPending,
	}

	if req.Courier != "" {
		order.Courier = &req.Courier
	}
	if req.CourierService != "" {
		order.CourierService = &req.CourierService
	}
	if req.Notes != "" {
		order.Notes = &req.Notes
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat pesanan"})
		return
	}

	// Create order items
	for _, item := range cartItems {
		if item.Product == nil {
			continue
		}
		orderItem := models.OrderItem{
			OrderID:         order.ID,
			ProductID:       item.ProductID,
			Quantity:        item.Quantity,
			PriceAtPurchase: item.Product.GetEffectivePrice(item.Quantity),
		}
		if err := tx.Create(&orderItem).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan item pesanan"})
			return
		}

		// Reduce stock
		tx.Model(&models.Product{}).
			Where("id = ?", item.ProductID).
			Update("stock", item.Product.Stock-item.Quantity)
	}

	// Clear cart
	tx.Where("user_id = ?", user.ID).Delete(&models.CartItem{})

	// Commit transaction
	tx.Commit()

	// Generate QR code for order (async)
	go utils.GenerateQRCode(orderNumber, config.AppConfig.UploadPath)

	// Send order notification email to customer (async)
	go utils.SendOrderNotificationEmail(user.Email, orderNumber, user.Name, order.GetGrandTotal())

	// Send order notification email to admins (async)
	var orderItems []utils.OrderItemInfo
	for _, item := range cartItems {
		if item.Product != nil {
			orderItems = append(orderItems, utils.OrderItemInfo{
				ProductName: item.Product.Name,
				Quantity:    item.Quantity,
				Price:       item.Product.GetEffectivePrice(item.Quantity),
				Subtotal:    item.Product.GetEffectivePrice(item.Quantity) * float64(item.Quantity),
			})
		}
	}

	phone := ""
	if user.Phone != nil {
		phone = *user.Phone
	}

	go utils.SendOrderNotificationToAdmins(
		orderNumber,
		user.Name,
		user.Email,
		phone,
		shippingAddress,
		orderItems,
		order.GetGrandTotal(),
		shippingCost,
		"Transfer Bank",
	)

	c.JSON(http.StatusCreated, gin.H{
		"message":      "Pesanan berhasil dibuat",
		"order_number": orderNumber,
		"order_id":     order.ID,
		"total":        order.GetGrandTotal(),
		"bank": gin.H{
			"name":    config.AppConfig.BankName,
			"account": config.AppConfig.BankAccount,
			"number":  config.AppConfig.BankNumber,
		},
	})
}

// GetOrder returns order details
func GetOrder(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var order models.Order
	query := database.DB.
		Preload("Items").
		Preload("Items.Product").
		Preload("PaymentProofs")

	// Non-admin users can only see their own orders
	if user.Role != models.RoleAdmin && user.Role != models.RoleSubAdmin {
		query = query.Where("user_id = ?", user.ID)
	}

	if err := query.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"order": order,
		"bank": gin.H{
			"name":    config.AppConfig.BankName,
			"account": config.AppConfig.BankAccount,
			"number":  config.AppConfig.BankNumber,
		},
	})
}

// GetOrders returns user's order history
func GetOrders(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))

	if page < 1 {
		page = 1
	}
	offset := (page - 1) * perPage

	var orders []models.Order
	var total int64

	query := database.DB.Model(&models.Order{}).Where("user_id = ?", user.ID)
	query.Count(&total)

	database.DB.
		Preload("Items").
		Preload("Items.Product").
		Where("user_id = ?", user.ID).
		Order("created_at DESC").
		Offset(offset).
		Limit(perPage).
		Find(&orders)

	c.JSON(http.StatusOK, gin.H{
		"data": orders,
		"meta": gin.H{
			"current_page": page,
			"per_page":     perPage,
			"total":        total,
			"total_pages":  (total + int64(perPage) - 1) / int64(perPage),
		},
	})
}

// UploadPaymentProof handles payment proof upload
func UploadPaymentProof(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	// Find order
	var order models.Order
	if err := database.DB.Where("id = ? AND user_id = ?", id, user.ID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	// Check order status
	if order.PaymentStatus == models.PaymentVerified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pembayaran sudah diverifikasi"})
		return
	}

	// Get file
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File gambar diperlukan"})
		return
	}

	// Validate file type
	if !utils.IsValidImageType(file) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format file tidak valid"})
		return
	}

	// Process and save image
	processor := utils.NewImageProcessor()
	imagePath, err := processor.ProcessPaymentProof(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan gambar"})
		return
	}

	// Create payment proof record
	proof := models.PaymentProof{
		OrderID:   order.ID,
		ImagePath: imagePath,
		Status:    models.ProofPending,
	}

	if err := database.DB.Create(&proof).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan bukti pembayaran"})
		return
	}

	// Update order payment status
	order.PaymentStatus = models.PaymentUploaded
	database.DB.Save(&order)

	c.JSON(http.StatusOK, gin.H{
		"message": "Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.",
	})
}
