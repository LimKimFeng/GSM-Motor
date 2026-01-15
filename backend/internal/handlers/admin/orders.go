package admin

import (
	"net/http"
	"strconv"

	"gsm-motor/internal/config"
	"gsm-motor/internal/database"
	"gsm-motor/internal/models"

	"github.com/gin-gonic/gin"
)

// AdminListOrders returns all orders with filters
func AdminListOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	status := c.Query("status")
	paymentStatus := c.Query("payment_status")
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	offset := (page - 1) * perPage

	query := database.DB.Model(&models.Order{}).
		Preload("User").
		Preload("Items").
		Preload("Items.Product")

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if paymentStatus != "" {
		query = query.Where("payment_status = ?", paymentStatus)
	}
	if search != "" {
		query = query.Where("order_number LIKE ? OR shipping_address LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	var orders []models.Order
	query.
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

// AdminGetOrder returns a single order with all details
func AdminGetOrder(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var order models.Order
	if err := database.DB.
		Preload("User").
		Preload("Items").
		Preload("Items.Product").
		Preload("PaymentProofs").
		First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"order": order})
}

// UpdateOrderStatusRequest represents the update status request
type UpdateOrderStatusRequest struct {
	Status         string `json:"status"`
	PaymentStatus  string `json:"payment_status"`
	TrackingNumber string `json:"tracking_number"`
}

// AdminUpdateOrderStatus updates order status
func AdminUpdateOrderStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var order models.Order
	if err := database.DB.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	var req UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	// Update status
	if req.Status != "" {
		order.Status = models.OrderStatus(req.Status)
	}
	if req.PaymentStatus != "" {
		order.PaymentStatus = models.PaymentStatus(req.PaymentStatus)
	}
	if req.TrackingNumber != "" {
		order.TrackingNumber = &req.TrackingNumber
	}

	database.DB.Save(&order)

	c.JSON(http.StatusOK, gin.H{
		"message": "Status pesanan berhasil diperbarui",
		"order":   order,
	})
}

// AdminVerifyPayment verifies or rejects payment proof
func AdminVerifyPayment(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	proofID, err := strconv.ParseUint(c.Param("proofId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Proof ID tidak valid"})
		return
	}

	var req struct {
		Status     string `json:"status" binding:"required,oneof=verified rejected"`
		AdminNotes string `json:"admin_notes"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status tidak valid"})
		return
	}

	var proof models.PaymentProof
	if err := database.DB.Where("id = ? AND order_id = ?", proofID, id).First(&proof).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bukti pembayaran tidak ditemukan"})
		return
	}

	proof.Status = models.PaymentProofStatus(req.Status)
	if req.AdminNotes != "" {
		proof.AdminNotes = &req.AdminNotes
	}
	database.DB.Save(&proof)

	// Update order payment status
	var order models.Order
	if err := database.DB.First(&order, id).Error; err == nil {
		if req.Status == "verified" {
			order.PaymentStatus = models.PaymentVerified
			order.Status = models.OrderProcessing
		} else {
			order.PaymentStatus = models.PaymentFailed
		}
		database.DB.Save(&order)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Verifikasi pembayaran berhasil",
	})
}

// AdminDashboard returns dashboard statistics
func AdminDashboard(c *gin.Context) {
	var stats struct {
		TotalProducts    int64   `json:"total_products"`
		TotalOrders      int64   `json:"total_orders"`
		TotalCustomers   int64   `json:"total_customers"`
		PendingOrders    int64   `json:"pending_orders"`
		ProcessingOrders int64   `json:"processing_orders"`
		LowStockProducts int64   `json:"low_stock_products"`
		TotalRevenue     float64 `json:"total_revenue"`
		TodayOrders      int64   `json:"today_orders"`
		PendingPayments  int64   `json:"pending_payments"`
	}

	// Total products
	database.DB.Model(&models.Product{}).Count(&stats.TotalProducts)

	// Total orders
	database.DB.Model(&models.Order{}).Count(&stats.TotalOrders)

	// Total customers
	database.DB.Model(&models.User{}).Where("role = ?", "customer").Count(&stats.TotalCustomers)

	// Pending orders
	database.DB.Model(&models.Order{}).Where("status = ?", "pending").Count(&stats.PendingOrders)

	// Processing orders
	database.DB.Model(&models.Order{}).Where("status = ?", "processing").Count(&stats.ProcessingOrders)

	// Low stock products (< 10)
	database.DB.Model(&models.Product{}).Where("stock < 10").Count(&stats.LowStockProducts)

	// Total revenue from completed orders
	database.DB.Model(&models.Order{}).
		Where("status = ? AND payment_status = ?", "completed", "verified").
		Select("COALESCE(SUM(total_price + shipping_cost), 0)").
		Scan(&stats.TotalRevenue)

	// Today's orders
	database.DB.Model(&models.Order{}).
		Where("DATE(created_at) = CURDATE()").
		Count(&stats.TodayOrders)

	// Pending payments
	database.DB.Model(&models.Order{}).
		Where("payment_status = ?", "pending").
		Count(&stats.PendingPayments)

	// Recent orders
	var recentOrders []models.Order
	database.DB.
		Preload("User").
		Order("created_at DESC").
		Limit(5).
		Find(&recentOrders)

	// Low stock products list
	var lowStockProducts []models.Product
	database.DB.
		Preload("Category").
		Where("stock < 10").
		Order("stock ASC").
		Limit(10).
		Find(&lowStockProducts)

	c.JSON(http.StatusOK, gin.H{
		"stats":              stats,
		"recent_orders":      recentOrders,
		"low_stock_products": lowStockProducts,
	})
}

// GetReceiptData returns data for printing receipt
func GetReceiptData(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var order models.Order
	if err := database.DB.
		Preload("User").
		Preload("Items").
		Preload("Items.Product").
		First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	// Get QR code path
	qrPath := "qrcodes/" + order.OrderNumber + ".png"

	c.JSON(http.StatusOK, gin.H{
		"order":   order,
		"qr_code": qrPath,
		"store": gin.H{
			"name":     config.AppConfig.StoreName,
			"address":  config.AppConfig.StoreAddress,
			"whatsapp": config.AppConfig.StoreWhatsApp,
		},
	})
}
