package products

import (
	"net/http"
	"strconv"

	"gsm-motor/internal/database"
	"gsm-motor/internal/models"

	"github.com/gin-gonic/gin"
)

// ListProducts returns a paginated list of products with optional search and filtering
func ListProducts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	search := c.Query("search")
	categorySlug := c.Query("category")
	sortBy := c.DefaultQuery("sort", "latest")

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	offset := (page - 1) * perPage

	query := database.DB.Model(&models.Product{}).
		Preload("Category").
		Preload("Images")

	// Apply search
	if search != "" {
		query = query.Scopes(models.ProductSearch(search))
	}

	// Apply category filter
	if categorySlug != "" {
		var category models.Category
		if err := database.DB.Where("slug = ?", categorySlug).First(&category).Error; err == nil {
			query = query.Where("category_id = ?", category.ID)
		}
	}

	// Only show in-stock products to customers
	query = query.Where("stock > 0")

	// Get total count
	var total int64
	query.Count(&total)

	// Apply sorting
	switch sortBy {
	case "price_asc":
		query = query.Order("price ASC")
	case "price_desc":
		query = query.Order("price DESC")
	case "name":
		query = query.Order("name ASC")
	default: // latest
		query = query.Order("created_at DESC")
	}

	// Get products
	var products []models.Product
	if err := query.Offset(offset).Limit(perPage).Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat produk"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": products,
		"meta": gin.H{
			"current_page": page,
			"per_page":     perPage,
			"total":        total,
			"total_pages":  (total + int64(perPage) - 1) / int64(perPage),
		},
	})
}

// GetProduct returns a single product by slug
func GetProduct(c *gin.Context) {
	slug := c.Param("slug")

	var product models.Product
	if err := database.DB.
		Preload("Category").
		Preload("Images").
		Where("slug = ?", slug).
		First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Produk tidak ditemukan"})
		return
	}

	// Get related products from same category
	var related []models.Product
	database.DB.
		Preload("Category").
		Where("category_id = ? AND id != ?", product.CategoryID, product.ID).
		Limit(4).
		Find(&related)

	c.JSON(http.StatusOK, gin.H{
		"product": product,
		"related": related,
	})
}

// SearchProducts returns search suggestions (for autocomplete)
func SearchProducts(c *gin.Context) {
	query := c.Query("q")
	if len(query) < 2 {
		c.JSON(http.StatusOK, gin.H{"results": []interface{}{}})
		return
	}

	var products []models.Product
	database.DB.
		Select("id, name, slug, price, image_path").
		Scopes(models.ProductSearch(query)).
		Where("stock > 0").
		Limit(10).
		Find(&products)

	c.JSON(http.StatusOK, gin.H{"results": products})
}

// GetCategories returns all categories
func GetCategories(c *gin.Context) {
	var categories []models.Category
	database.DB.Order("name ASC").Find(&categories)

	c.JSON(http.StatusOK, gin.H{"data": categories})
}

// GetProductsByCategory returns products in a specific category
func GetProductsByCategory(c *gin.Context) {
	slug := c.Param("slug")

	var category models.Category
	if err := database.DB.Where("slug = ?", slug).First(&category).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	if page < 1 {
		page = 1
	}
	offset := (page - 1) * perPage

	var products []models.Product
	var total int64

	query := database.DB.Model(&models.Product{}).
		Where("category_id = ? AND stock > 0", category.ID)

	query.Count(&total)

	query.Preload("Images").
		Order("created_at DESC").
		Offset(offset).
		Limit(perPage).
		Find(&products)

	c.JSON(http.StatusOK, gin.H{
		"category": category,
		"products": products,
		"meta": gin.H{
			"current_page": page,
			"per_page":     perPage,
			"total":        total,
			"total_pages":  (total + int64(perPage) - 1) / int64(perPage),
		},
	})
}
