package utils

import (
	"os"
	"path/filepath"

	"github.com/skip2/go-qrcode"
)

// GenerateQRCode generates a QR code for an order number and saves it
func GenerateQRCode(orderNumber, uploadPath string) (string, error) {
	// Create QR code directory
	qrDir := filepath.Join(uploadPath, "qrcodes")
	if err := os.MkdirAll(qrDir, 0755); err != nil {
		return "", err
	}

	// Generate QR code
	filename := orderNumber + ".png"
	relPath := filepath.Join("qrcodes", filename)
	fullPath := filepath.Join(uploadPath, relPath)

	// Generate QR with order number as content
	err := qrcode.WriteFile(orderNumber, qrcode.Medium, 256, fullPath)
	if err != nil {
		return "", err
	}

	return relPath, nil
}

// GenerateQRCodeBytes generates a QR code and returns the PNG bytes
func GenerateQRCodeBytes(content string) ([]byte, error) {
	return qrcode.Encode(content, qrcode.Medium, 256)
}
