package admin

import (
	"net/http"
	"strconv"

	"gsm-motor/internal/database"
	"gsm-motor/internal/models"
	"gsm-motor/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/gosimple/slug"
)

// ListCategories returns all categories for admin
func ListCategories(c *gin.Context) {
	var categories []models.Category
	database.DB.Order("name ASC").Find(&categories)

	c.JSON(http.StatusOK, gin.H{"data": categories})
}

// CreateCategory creates a new category
func CreateCategory(c *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required,min=2"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama wajib diisi"})
		return
	}

	category := models.Category{
		Name: req.Name,
		Slug: slug.Make(req.Name),
	}

	if err := database.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat kategori"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Kategori berhasil dibuat",
		"category": category,
	})
}

// UpdateCategory updates a category
func UpdateCategory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var category models.Category
	if err := database.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	var req struct {
		Name string `json:"name" binding:"required,min=2"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama wajib diisi"})
		return
	}

	category.Name = req.Name
	category.Slug = slug.Make(req.Name)
	database.DB.Save(&category)

	c.JSON(http.StatusOK, gin.H{
		"message":  "Kategori berhasil diperbarui",
		"category": category,
	})
}

// DeleteCategory deletes a category
func DeleteCategory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var category models.Category
	if err := database.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	// Check if any products use this category
	var count int64
	database.DB.Model(&models.Product{}).Where("category_id = ?", id).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kategori tidak dapat dihapus karena masih memiliki produk"})
		return
	}

	database.DB.Delete(&category)

	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil dihapus"})
}

// ListBanners returns all banners for admin
func ListBanners(c *gin.Context) {
	var banners []models.Banner
	database.DB.Order("`order` ASC, created_at DESC").Find(&banners)

	c.JSON(http.StatusOK, gin.H{"data": banners})
}

// CreateBanner creates a new banner
func CreateBanner(c *gin.Context) {
	title := c.PostForm("title")
	isActive := c.PostForm("is_active") == "true" || c.PostForm("is_active") == "1"

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gambar wajib diunggah"})
		return
	}

	if !utils.IsValidImageType(file) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format gambar tidak valid"})
		return
	}

	processor := utils.NewImageProcessor()
	imagePath, err := processor.ProcessBannerAndSave(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan gambar"})
		return
	}

	// Get next order
	var maxOrder int
	database.DB.Model(&models.Banner{}).Select("COALESCE(MAX(`order`), 0)").Scan(&maxOrder)

	banner := models.Banner{
		Title:     &title,
		ImagePath: imagePath,
		IsActive:  isActive,
		Order:     maxOrder + 1,
	}

	if err := database.DB.Create(&banner).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat banner"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Banner berhasil dibuat",
		"banner":  banner,
	})
}

// DeleteBanner deletes a banner
func DeleteBanner(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var banner models.Banner
	if err := database.DB.First(&banner, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Banner tidak ditemukan"})
		return
	}

	// Delete image file
	processor := utils.NewImageProcessor()
	processor.DeleteImage(banner.ImagePath)

	database.DB.Delete(&banner)

	c.JSON(http.StatusOK, gin.H{"message": "Banner berhasil dihapus"})
}

// ToggleBanner toggles banner active status
func ToggleBanner(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var banner models.Banner
	if err := database.DB.First(&banner, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Banner tidak ditemukan"})
		return
	}

	banner.IsActive = !banner.IsActive
	database.DB.Save(&banner)

	c.JSON(http.StatusOK, gin.H{
		"message":   "Status banner berhasil diperbarui",
		"is_active": banner.IsActive,
	})
}
