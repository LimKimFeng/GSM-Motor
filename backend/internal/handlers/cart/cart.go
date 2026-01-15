package cart

import (
	"net/http"
	"strconv"

	"gsm-motor/internal/database"
	"gsm-motor/internal/middleware"
	"gsm-motor/internal/models"

	"github.com/gin-gonic/gin"
)

// AddToCartRequest represents the add to cart request
type AddToCartRequest struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}

// AddToCart adds a product to the user's cart
func AddToCart(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	// Check if product exists and has stock
	var product models.Product
	if err := database.DB.First(&product, req.ProductID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Produk tidak ditemukan"})
		return
	}

	if product.Stock < req.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Stok tidak mencukupi"})
		return
	}

	// Check if item already in cart
	var existingItem models.CartItem
	result := database.DB.Where("user_id = ? AND product_id = ?", user.ID, req.ProductID).First(&existingItem)

	if result.Error == nil {
		// Update quantity
		newQty := existingItem.Quantity + req.Quantity
		if newQty > product.Stock {
			newQty = product.Stock
		}
		existingItem.Quantity = newQty
		database.DB.Save(&existingItem)
	} else {
		// Create new cart item
		cartItem := models.CartItem{
			UserID:    user.ID,
			ProductID: req.ProductID,
			Quantity:  req.Quantity,
		}
		if err := database.DB.Create(&cartItem).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan ke keranjang"})
			return
		}
	}

	// Get updated cart count
	var count int64
	database.DB.Model(&models.CartItem{}).Where("user_id = ?", user.ID).Count(&count)

	c.JSON(http.StatusOK, gin.H{
		"message":    "Produk berhasil ditambahkan ke keranjang",
		"cart_count": count,
	})
}

// GetCart returns the user's cart with all items
func GetCart(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var cartItems []models.CartItem
	database.DB.
		Preload("Product").
		Preload("Product.Images").
		Where("user_id = ?", user.ID).
		Find(&cartItems)

	// Calculate totals
	var subtotal float64
	var totalWeight int
	var totalItems int

	for _, item := range cartItems {
		if item.Product != nil {
			subtotal += item.Product.GetEffectivePrice(item.Quantity) * float64(item.Quantity)
			totalWeight += item.Product.Weight * item.Quantity
			totalItems += item.Quantity
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"items":        cartItems,
		"subtotal":     subtotal,
		"total_weight": totalWeight,
		"total_items":  totalItems,
	})
}

// UpdateCartItem updates the quantity of a cart item
func UpdateCartItem(c *gin.Context) {
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

	var req struct {
		Quantity int `json:"quantity" binding:"required,min=1"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Jumlah tidak valid"})
		return
	}

	// Find cart item
	var cartItem models.CartItem
	if err := database.DB.Preload("Product").Where("id = ? AND user_id = ?", id, user.ID).First(&cartItem).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item tidak ditemukan"})
		return
	}

	// Check stock
	if cartItem.Product != nil && req.Quantity > cartItem.Product.Stock {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Stok tidak mencukupi"})
		return
	}

	cartItem.Quantity = req.Quantity
	database.DB.Save(&cartItem)

	c.JSON(http.StatusOK, gin.H{"message": "Jumlah berhasil diperbarui"})
}

// RemoveCartItem removes an item from the cart
func RemoveCartItem(c *gin.Context) {
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

	result := database.DB.Where("id = ? AND user_id = ?", id, user.ID).Delete(&models.CartItem{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item berhasil dihapus"})
}

// ClearCart removes all items from the user's cart
func ClearCart(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	database.DB.Where("user_id = ?", user.ID).Delete(&models.CartItem{})

	c.JSON(http.StatusOK, gin.H{"message": "Keranjang dikosongkan"})
}

// GetCartCount returns the number of items in the cart
func GetCartCount(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	if user == nil {
		c.JSON(http.StatusOK, gin.H{"count": 0})
		return
	}

	var count int64
	database.DB.Model(&models.CartItem{}).Where("user_id = ?", user.ID).Count(&count)

	c.JSON(http.StatusOK, gin.H{"count": count})
}
