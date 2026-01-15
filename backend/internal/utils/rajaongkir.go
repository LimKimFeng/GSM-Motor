package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"gsm-motor/internal/config"
)

// RajaOngkirClient handles shipping cost calculations
type RajaOngkirClient struct {
	APIKey      string
	DeliveryKey string
	BaseURL     string
	HTTPClient  *http.Client
}

// DestinationResult represents a destination search result
type DestinationResult struct {
	SubdistrictID   string `json:"subdistrict_id"`
	SubdistrictName string `json:"subdistrict_name"`
	CityID          string `json:"city_id"`
	CityName        string `json:"city_name"`
	ProvinceID      string `json:"province_id"`
	ProvinceName    string `json:"province_name"`
	ZipCode         string `json:"zip_code"`
}

// CostResult represents shipping cost calculation result
type CostResult struct {
	Service     string `json:"service"`
	Description string `json:"description"`
	Cost        int    `json:"cost"`
	ETD         string `json:"etd"` // Estimated delivery time
}

// CourierCost represents costs for a courier
type CourierCost struct {
	Code  string       `json:"code"`
	Name  string       `json:"name"`
	Costs []CostResult `json:"costs"`
}

// NewRajaOngkirClient creates a new RajaOngkir API client
func NewRajaOngkirClient() *RajaOngkirClient {
	return &RajaOngkirClient{
		APIKey:      config.AppConfig.RajaOngkirAPIKey,
		DeliveryKey: config.AppConfig.RajaOngkirDeliveryKey,
		BaseURL:     config.AppConfig.RajaOngkirBaseURL,
		HTTPClient:  &http.Client{},
	}
}

// SearchDestination searches for domestic destinations
func (c *RajaOngkirClient) SearchDestination(query string, limit int) ([]DestinationResult, error) {
	if limit <= 0 {
		limit = 10
	}

	endpoint := fmt.Sprintf("%s/destination/domestic-destination?search=%s&limit=%d&offset=0",
		c.BaseURL, url.QueryEscape(query), limit)

	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("key", c.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error: %s - %s", resp.Status, string(body))
	}

	var result struct {
		Data []DestinationResult `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return result.Data, nil
}

// CalculateShippingCost calculates shipping cost between two subdistricts
func (c *RajaOngkirClient) CalculateShippingCost(originSubdistrictID, destSubdistrictID string, weight int, courier string) ([]CourierCost, error) {
	endpoint := fmt.Sprintf("%s/cost/domestic-cost", c.BaseURL)

	// Prepare form data
	formData := url.Values{}
	formData.Set("origin", originSubdistrictID)
	formData.Set("destination", destSubdistrictID)
	formData.Set("weight", fmt.Sprintf("%d", weight))
	formData.Set("courier", strings.ToLower(courier))

	req, err := http.NewRequest("POST", endpoint, strings.NewReader(formData.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("key", c.APIKey)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error: %s - %s", resp.Status, string(body))
	}

	// Parse the nested response structure
	var apiResp struct {
		Data struct {
			Results []struct {
				Code  string `json:"code"`
				Name  string `json:"name"`
				Costs []struct {
					Service     string `json:"service"`
					Description string `json:"description"`
					Cost        []struct {
						Value int    `json:"value"`
						ETD   string `json:"etd"`
					} `json:"cost"`
				} `json:"costs"`
			} `json:"results"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Transform to simpler structure
	var costs []CourierCost
	for _, result := range apiResp.Data.Results {
		cc := CourierCost{
			Code: result.Code,
			Name: result.Name,
		}
		for _, cost := range result.Costs {
			if len(cost.Cost) > 0 {
				cc.Costs = append(cc.Costs, CostResult{
					Service:     cost.Service,
					Description: cost.Description,
					Cost:        cost.Cost[0].Value,
					ETD:         cost.Cost[0].ETD,
				})
			}
		}
		costs = append(costs, cc)
	}

	return costs, nil
}

// CalculateAllCouriers calculates costs for multiple couriers at once
func (c *RajaOngkirClient) CalculateAllCouriers(originSubdistrictID, destSubdistrictID string, weight int) ([]CourierCost, error) {
	var allCosts []CourierCost
	couriers := []string{"jne", "jnt", "pos", "tiki"}

	for _, courier := range couriers {
		costs, err := c.CalculateShippingCost(originSubdistrictID, destSubdistrictID, weight, courier)
		if err != nil {
			// Log but continue with other couriers
			fmt.Printf("Warning: failed to get costs for %s: %v\n", courier, err)
			continue
		}
		allCosts = append(allCosts, costs...)
	}

	return allCosts, nil
}

// GetStoreOrigin returns the store's origin subdistrict ID
func (c *RajaOngkirClient) GetStoreOrigin() string {
	return config.AppConfig.StoreOriginSubdistrictID
}
