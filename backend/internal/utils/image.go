package utils

import (
	"bytes"
	"fmt"
	"image"
	"image/draw"
	"image/png"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gsm-motor/internal/config"

	"github.com/disintegration/imaging"
	"github.com/google/uuid"
)

// ImageProcessor handles image upload, resize, watermark, and WebP conversion
type ImageProcessor struct {
	UploadPath    string
	WatermarkPath string
	MaxWidth      int
	MaxHeight     int
	Quality       int
}

// NewImageProcessor creates a new image processor with defaults
func NewImageProcessor() *ImageProcessor {
	return &ImageProcessor{
		UploadPath:    config.AppConfig.UploadPath,
		WatermarkPath: config.AppConfig.WatermarkPath,
		MaxWidth:      800,
		MaxHeight:     800,
		Quality:       80,
	}
}

// ProcessAndSave processes an uploaded image: resize, watermark (optional), and save as WebP
func (ip *ImageProcessor) ProcessAndSave(file *multipart.FileHeader, subDir string, addWatermark bool) (string, error) {
	// Open uploaded file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	// Decode image
	img, err := imaging.Decode(src)
	if err != nil {
		return "", fmt.Errorf("failed to decode image: %w", err)
	}

	// Resize if larger than max dimensions
	if img.Bounds().Dx() > ip.MaxWidth || img.Bounds().Dy() > ip.MaxHeight {
		img = imaging.Fit(img, ip.MaxWidth, ip.MaxHeight, imaging.Lanczos)
	}

	// Add watermark if requested
	if addWatermark && ip.WatermarkPath != "" {
		img, err = ip.addWatermark(img)
		if err != nil {
			// Log but don't fail if watermark fails
			fmt.Printf("Warning: failed to add watermark: %v\n", err)
		}
	}

	// Generate unique filename
	filename := fmt.Sprintf("%d_%s.webp", time.Now().Unix(), uuid.New().String()[:8])
	relPath := filepath.Join(subDir, filename)
	fullPath := filepath.Join(ip.UploadPath, relPath)

	// Create directory if not exists
	if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	// Save as WebP (using PNG as fallback since imaging doesn't support WebP natively)
	// For true WebP support, we save as PNG with .webp extension
	// In production, use a proper WebP encoder like github.com/chai2010/webp
	if err := imaging.Save(img, fullPath); err != nil {
		return "", fmt.Errorf("failed to save image: %w", err)
	}

	return relPath, nil
}

// ProcessBannerAndSave processes banner image with larger dimensions
func (ip *ImageProcessor) ProcessBannerAndSave(file *multipart.FileHeader) (string, error) {
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	img, err := imaging.Decode(src)
	if err != nil {
		return "", fmt.Errorf("failed to decode image: %w", err)
	}

	// Resize to max 1920px width for banners
	if img.Bounds().Dx() > 1920 {
		img = imaging.Resize(img, 1920, 0, imaging.Lanczos)
	}

	filename := fmt.Sprintf("banner_%d_%s.webp", time.Now().Unix(), uuid.New().String()[:8])
	relPath := filepath.Join("banners", filename)
	fullPath := filepath.Join(ip.UploadPath, relPath)

	if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	if err := imaging.Save(img, fullPath); err != nil {
		return "", fmt.Errorf("failed to save image: %w", err)
	}

	return relPath, nil
}

// addWatermark adds GSM Motor watermark to image
func (ip *ImageProcessor) addWatermark(img image.Image) (image.Image, error) {
	// Load watermark
	watermarkFile, err := os.Open(ip.WatermarkPath)
	if err != nil {
		return img, fmt.Errorf("failed to open watermark: %w", err)
	}
	defer watermarkFile.Close()

	watermark, err := png.Decode(watermarkFile)
	if err != nil {
		return img, fmt.Errorf("failed to decode watermark: %w", err)
	}

	// Resize watermark to be proportional (about 15% of image width)
	wmWidth := img.Bounds().Dx() / 7
	watermark = imaging.Resize(watermark, wmWidth, 0, imaging.Lanczos)

	// Create new image with watermark
	bounds := img.Bounds()
	result := image.NewRGBA(bounds)
	draw.Draw(result, bounds, img, image.Point{}, draw.Src)

	// Position watermark in bottom-right corner with padding
	padding := 10
	wmBounds := watermark.Bounds()
	offset := image.Pt(
		bounds.Dx()-wmBounds.Dx()-padding,
		bounds.Dy()-wmBounds.Dy()-padding,
	)
	draw.Draw(result, wmBounds.Add(offset), watermark, image.Point{}, draw.Over)

	return result, nil
}

// DeleteImage deletes an image from storage
func (ip *ImageProcessor) DeleteImage(relPath string) error {
	fullPath := filepath.Join(ip.UploadPath, relPath)
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return nil // File doesn't exist, nothing to delete
	}
	return os.Remove(fullPath)
}

// IsValidImageType checks if the uploaded file is a valid image
func IsValidImageType(file *multipart.FileHeader) bool {
	contentType := file.Header.Get("Content-Type")
	validTypes := []string{"image/jpeg", "image/png", "image/gif", "image/webp"}
	for _, vt := range validTypes {
		if strings.EqualFold(contentType, vt) {
			return true
		}
	}
	
	// Also check extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	validExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
	for _, ve := range validExts {
		if ext == ve {
			return true
		}
	}
	
	return false
}

// ProcessPaymentProof processes payment proof image
func (ip *ImageProcessor) ProcessPaymentProof(file *multipart.FileHeader) (string, error) {
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	img, err := imaging.Decode(src)
	if err != nil {
		return "", fmt.Errorf("failed to decode image: %w", err)
	}

	// Keep payment proofs at reasonable size
	if img.Bounds().Dx() > 1200 || img.Bounds().Dy() > 1200 {
		img = imaging.Fit(img, 1200, 1200, imaging.Lanczos)
	}

	filename := fmt.Sprintf("payment_%d_%s.webp", time.Now().Unix(), uuid.New().String()[:8])
	relPath := filepath.Join("payments", filename)
	fullPath := filepath.Join(ip.UploadPath, relPath)

	if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	if err := imaging.Save(img, fullPath); err != nil {
		return "", fmt.Errorf("failed to save image: %w", err)
	}

	return relPath, nil
}

// CopyReaderToFile copies io.Reader content to a file
func CopyReaderToFile(src io.Reader, destPath string) error {
	if err := os.MkdirAll(filepath.Dir(destPath), 0755); err != nil {
		return err
	}
	
	dest, err := os.Create(destPath)
	if err != nil {
		return err
	}
	defer dest.Close()

	buf := new(bytes.Buffer)
	if _, err := io.Copy(buf, src); err != nil {
		return err
	}
	
	_, err = dest.Write(buf.Bytes())
	return err
}
