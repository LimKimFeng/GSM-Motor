package utils

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"net/smtp"

	"gsm-motor/internal/config"
)

// GenerateOTP generates a 6-digit OTP code
func GenerateOTP() (string, error) {
	const digits = "0123456789"
	otp := make([]byte, 6)
	for i := range otp {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		otp[i] = digits[n.Int64()]
	}
	return string(otp), nil
}

// SendOTPEmail sends OTP verification email
func SendOTPEmail(toEmail, otpCode, userName string) error {
	cfg := config.AppConfig
	
	if cfg.SMTPUser == "" || cfg.SMTPPassword == "" {
		return fmt.Errorf("SMTP credentials not configured")
	}

	// Email content
	subject := "Kode Verifikasi GSM Motor"
	body := fmt.Sprintf(`
Halo %s,

Kode verifikasi Anda adalah: %s

Kode ini berlaku selama 10 menit.
Jangan bagikan kode ini kepada siapapun.

Jika Anda tidak meminta kode ini, abaikan email ini.

Terima kasih,
Tim GSM Motor
	`, userName, otpCode)

	message := fmt.Sprintf("To: %s\r\n"+
		"From: %s\r\n"+
		"Subject: %s\r\n"+
		"Content-Type: text/plain; charset=utf-8\r\n"+
		"\r\n"+
		"%s", toEmail, cfg.SMTPFrom, subject, body)

	auth := smtp.PlainAuth("", cfg.SMTPUser, cfg.SMTPPassword, cfg.SMTPHost)
	addr := fmt.Sprintf("%s:%s", cfg.SMTPHost, cfg.SMTPPort)

	return smtp.SendMail(addr, auth, cfg.SMTPFrom, []string{toEmail}, []byte(message))
}

// SendOrderNotificationEmail sends order confirmation email
func SendOrderNotificationEmail(toEmail, orderNumber, userName string, totalAmount float64) error {
	cfg := config.AppConfig

	if cfg.SMTPUser == "" || cfg.SMTPPassword == "" {
		return fmt.Errorf("SMTP credentials not configured")
	}

	subject := fmt.Sprintf("Pesanan %s - GSM Motor", orderNumber)
	body := fmt.Sprintf(`
Halo %s,

Terima kasih atas pesanan Anda di GSM Motor!

Nomor Pesanan: %s
Total Pembayaran: Rp %s

Silakan lakukan pembayaran ke rekening berikut:
Bank: %s
Atas Nama: %s
Nomor Rekening: %s

Setelah melakukan pembayaran, silakan upload bukti transfer melalui halaman detail pesanan Anda.

Jika ada pertanyaan, hubungi kami via WhatsApp: %s

Terima kasih,
Tim GSM Motor
	`, userName, orderNumber, FormatRupiah(totalAmount), cfg.BankName, cfg.BankAccount, cfg.BankNumber, cfg.StoreWhatsApp)

	message := fmt.Sprintf("To: %s\r\n"+
		"From: %s\r\n"+
		"Subject: %s\r\n"+
		"Content-Type: text/plain; charset=utf-8\r\n"+
		"\r\n"+
		"%s", toEmail, cfg.SMTPFrom, subject, body)

	auth := smtp.PlainAuth("", cfg.SMTPUser, cfg.SMTPPassword, cfg.SMTPHost)
	addr := fmt.Sprintf("%s:%s", cfg.SMTPHost, cfg.SMTPPort)

	return smtp.SendMail(addr, auth, cfg.SMTPFrom, []string{toEmail}, []byte(message))
}

// FormatRupiah formats a number as Indonesian Rupiah
func FormatRupiah(amount float64) string {
	// Simple formatting - in production use proper locale formatting
	intAmount := int64(amount)
	str := fmt.Sprintf("%d", intAmount)
	
	// Add thousand separators
	n := len(str)
	if n <= 3 {
		return str
	}
	
	var result []byte
	for i, c := range str {
		if (n-i)%3 == 0 && i > 0 {
			result = append(result, '.')
		}
		result = append(result, byte(c))
	}
	
	return string(result)
}
