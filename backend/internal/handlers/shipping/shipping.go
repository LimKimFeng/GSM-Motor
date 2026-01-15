package shipping

import (
	"net/http"

	"gsm-motor/internal/config"
	"gsm-motor/internal/middleware"
	"gsm-motor/internal/utils"

	"github.com/gin-gonic/gin"
)

// SearchDestinations searches for shipping destinations
func SearchDestinations(c *gin.Context) {
	query := c.Query("q")
	if len(query) < 2 {
		c.JSON(http.StatusOK, gin.H{"data": []interface{}{}})
		return
	}

	client := utils.NewRajaOngkirClient()
	destinations, err := client.SearchDestination(query, 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari lokasi: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": destinations})
}

// CalculateCostRequest represents the shipping cost calculation request
type CalculateCostRequest struct {
	DestinationSubdistrictID string `json:"destination_subdistrict_id" binding:"required"`
	Weight                   int    `json:"weight" binding:"required,min=1"`
	Courier                  string `json:"courier"` // Optional: jne, jnt, pos, tiki. If empty, returns all
}

// CalculateCost calculates shipping cost
func CalculateCost(c *gin.Context) {
	var req CalculateCostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	client := utils.NewRajaOngkirClient()
	origin := client.GetStoreOrigin()

	if origin == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lokasi toko belum dikonfigurasi"})
		return
	}

	var costs []utils.CourierCost
	var err error

	if req.Courier != "" {
		costs, err = client.CalculateShippingCost(origin, req.DestinationSubdistrictID, req.Weight, req.Courier)
	} else {
		costs, err = client.CalculateAllCouriers(origin, req.DestinationSubdistrictID, req.Weight)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghitung ongkir: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": costs})
}

// GetShippingOptions returns available shipping methods
func GetShippingOptions(c *gin.Context) {
	user := middleware.GetCurrentUser(c)

	options := []gin.H{
		{
			"id":          "pickup",
			"name":        "Ambil di Tempat",
			"description": "Ambil pesanan langsung di toko GSM Motor",
			"cost":        0,
			"note":        "Gratis",
		},
		{
			"id":          "ojol",
			"name":        "Grab/Gojek/InDriver",
			"description": "Pengiriman via ojek online",
			"cost":        0,
			"note":        "Biaya diatur via WhatsApp",
		},
		{
			"id":          "jne",
			"name":        "JNE",
			"description": "Kurir JNE",
			"cost":        nil,
			"note":        "Hitung otomatis",
		},
		{
			"id":          "jnt",
			"name":        "J&T Express",
			"description": "Kurir J&T Express",
			"cost":        nil,
			"note":        "Hitung otomatis",
		},
	}

	// Check if user has address for courier options
	hasAddress := false
	if user != nil && user.SubdistrictID != nil && *user.SubdistrictID != "" {
		hasAddress = true
	}

	c.JSON(http.StatusOK, gin.H{
		"options":        options,
		"has_address":    hasAddress,
		"store_address":  config.AppConfig.StoreAddress,
		"store_whatsapp": config.AppConfig.StoreWhatsApp,
	})
}

// GetStoreInfo returns store information for pickup option
func GetStoreInfo(c *gin.Context) {
	cfg := config.AppConfig
	c.JSON(http.StatusOK, gin.H{
		"name":     cfg.StoreName,
		"address":  cfg.StoreAddress,
		"whatsapp": cfg.StoreWhatsApp,
	})
}
