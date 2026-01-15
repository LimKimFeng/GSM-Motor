package admin

import (
	"math"
	"net/http"
	"strconv"
	"sync"
	"time"

	"gsm-motor/internal/database"
	"gsm-motor/internal/middleware"
	"gsm-motor/internal/models"
	"gsm-motor/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/gosimple/slug"
)

// AdminListProducts returns all products for admin
func AdminListProducts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	offset := (page - 1) * perPage

	query := database.DB.Model(&models.Product{}).
		Preload("Category").
		Preload("Images")

	if search != "" {
		query = query.Scopes(models.ProductSearch(search))
	}

	var total int64
	query.Count(&total)

	var products []models.Product
	query.
		Order("CASE WHEN stock < 10 THEN 0 ELSE 1 END, stock ASC, created_at DESC").
		Offset(offset).
		Limit(perPage).
		Find(&products)

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

// AdminCreateProduct creates a new product
func AdminCreateProduct(c *gin.Context) {
	name := c.PostForm("name")
	categoryID, _ := strconv.ParseUint(c.PostForm("category_id"), 10, 32)
	price, _ := strconv.ParseFloat(c.PostForm("price"), 64)
	price3, _ := strconv.ParseFloat(c.PostForm("price_3_items"), 64)
	price5, _ := strconv.ParseFloat(c.PostForm("price_5_items"), 64)
	stock, _ := strconv.Atoi(c.PostForm("stock"))
	weight, _ := strconv.Atoi(c.PostForm("weight"))
	description := c.PostForm("description")

	if name == "" || categoryID == 0 || price <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama, kategori, dan harga wajib diisi"})
		return
	}

	if weight <= 0 {
		weight = 500 // Default weight in grams
	}

	// Generate slug
	productSlug := slug.Make(name) + "-" + strconv.FormatInt(time.Now().Unix(), 36)

	product := models.Product{
		Name:        name,
		Slug:        productSlug,
		CategoryID:  uint(categoryID),
		Price:       price,
		Stock:       stock,
		Weight:      weight,
		Description: &description,
	}

	if price3 > 0 {
		product.Price3Items = &price3
	}
	if price5 > 0 {
		product.Price5Items = &price5
	}

	if err := database.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat produk"})
		return
	}

	// Handle image uploads
	form, _ := c.MultipartForm()
	if form != nil && form.File["images"] != nil {
		processor := utils.NewImageProcessor()
		for i, file := range form.File["images"] {
			if !utils.IsValidImageType(file) {
				continue
			}

			imagePath, err := processor.ProcessAndSave(file, "products", true)
			if err != nil {
				continue
			}

			// Create product image
			productImage := models.ProductImage{
				ProductID: product.ID,
				ImagePath: imagePath,
			}
			database.DB.Create(&productImage)

			// Set first image as primary
			if i == 0 {
				product.ImagePath = &imagePath
				database.DB.Save(&product)
			}
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Produk berhasil dibuat",
		"product": product,
	})
}

// AdminUpdateProduct updates a product
func AdminUpdateProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var product models.Product
	if err := database.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Produk tidak ditemukan"})
		return
	}

	// Update fields
	if name := c.PostForm("name"); name != "" {
		product.Name = name
	}
	if categoryID, _ := strconv.ParseUint(c.PostForm("category_id"), 10, 32); categoryID > 0 {
		product.CategoryID = uint(categoryID)
	}
	if price, _ := strconv.ParseFloat(c.PostForm("price"), 64); price > 0 {
		product.Price = price
	}
	if price3, _ := strconv.ParseFloat(c.PostForm("price_3_items"), 64); price3 >= 0 {
		product.Price3Items = &price3
	}
	if price5, _ := strconv.ParseFloat(c.PostForm("price_5_items"), 64); price5 >= 0 {
		product.Price5Items = &price5
	}
	if stock, err := strconv.Atoi(c.PostForm("stock")); err == nil {
		product.Stock = stock
	}
	if weight, _ := strconv.Atoi(c.PostForm("weight")); weight > 0 {
		product.Weight = weight
	}
	if desc := c.PostForm("description"); desc != "" {
		product.Description = &desc
	}

	database.DB.Save(&product)

	// Handle new image uploads
	form, _ := c.MultipartForm()
	if form != nil && form.File["images"] != nil {
		processor := utils.NewImageProcessor()
		for _, file := range form.File["images"] {
			if !utils.IsValidImageType(file) {
				continue
			}

			imagePath, err := processor.ProcessAndSave(file, "products", true)
			if err != nil {
				continue
			}

			productImage := models.ProductImage{
				ProductID: product.ID,
				ImagePath: imagePath,
			}
			database.DB.Create(&productImage)

			// Update primary image if not set
			if product.ImagePath == nil {
				product.ImagePath = &imagePath
				database.DB.Save(&product)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Produk berhasil diperbarui",
		"product": product,
	})
}

// AdminDeleteProduct deletes a product (admin only)
func AdminDeleteProduct(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	if user == nil || user.Role != models.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya admin yang dapat menghapus produk"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var product models.Product
	if err := database.DB.Preload("Images").First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Produk tidak ditemukan"})
		return
	}

	// Delete images from storage
	processor := utils.NewImageProcessor()
	for _, img := range product.Images {
		processor.DeleteImage(img.ImagePath)
	}
	if product.ImagePath != nil {
		processor.DeleteImage(*product.ImagePath)
	}

	// Delete product (cascade deletes images)
	database.DB.Delete(&product)

	c.JSON(http.StatusOK, gin.H{"message": "Produk berhasil dihapus"})
}

// BulkPriceUpdate updates all product prices by percentage
func BulkPriceUpdate(c *gin.Context) {
	var req struct {
		Percentage float64 `json:"percentage" binding:"required,min=-100,max=100"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Persentase tidak valid (-100 sampai 100)"})
		return
	}

	// Get all products
	var products []models.Product
	database.DB.Find(&products)

	// Use goroutines for parallel processing
	var wg sync.WaitGroup
	batchSize := 100
	now := time.Now()

	for i := 0; i < len(products); i += batchSize {
		end := i + batchSize
		if end > len(products) {
			end = len(products)
		}

		wg.Add(1)
		go func(batch []models.Product) {
			defer wg.Done()
			for _, p := range batch {
				// Calculate new price with rounding to nearest 100 (ceil)
				newPrice := p.Price * (1 + req.Percentage/100)
				newPrice = math.Ceil(newPrice/100) * 100

				database.DB.Model(&p).Updates(map[string]interface{}{
					"price":             newPrice,
					"last_price_update": now,
				})

				// Also update tiered prices if they exist
				if p.Price3Items != nil && *p.Price3Items > 0 {
					newPrice3 := *p.Price3Items * (1 + req.Percentage/100)
					newPrice3 = math.Ceil(newPrice3/100) * 100
					database.DB.Model(&p).Update("price_3_items", newPrice3)
				}
				if p.Price5Items != nil && *p.Price5Items > 0 {
					newPrice5 := *p.Price5Items * (1 + req.Percentage/100)
					newPrice5 = math.Ceil(newPrice5/100) * 100
					database.DB.Model(&p).Update("price_5_items", newPrice5)
				}
			}
		}(products[i:end])
	}

	wg.Wait()

	c.JSON(http.StatusOK, gin.H{
		"message": "Harga berhasil diperbarui",
		"count":   len(products),
	})
}
