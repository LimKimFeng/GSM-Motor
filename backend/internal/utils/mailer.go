package utils

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"net/smtp"

	"gsm-motor/internal/config"
)

// Admin notification email recipients
var adminNotificationEmails = []string{
	"corneliusnathaniel.08@gmail.com",
	"yantiprskl@gmail.com",
	"landpeace.07@gmail.com",
}

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

// SendOrderNotificationEmail sends order confirmation email to customer
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

// SendProductUploadNotification sends email notification when subadmin uploads a product
func SendProductUploadNotification(submittedBy, productName string, price float64, categoryName string) error {
	cfg := config.AppConfig

	if cfg.SMTPUser == "" || cfg.SMTPPassword == "" {
		return fmt.Errorf("SMTP credentials not configured")
	}

	subject := fmt.Sprintf("[GSM Motor] Produk Baru Diupload oleh %s", submittedBy)
	body := fmt.Sprintf(`
=====================================
NOTIFIKASI UPLOAD PRODUK BARU
=====================================

Subadmin/Admin yang mengupload: %s

Detail Produk:
- Nama Produk: %s
- Kategori: %s
- Harga: Rp %s

Waktu Upload: Baru saja

--
Silakan periksa produk ini di halaman admin untuk memverifikasi informasi yang diinput.

Salam,
Sistem GSM Motor
	`, submittedBy, productName, categoryName, FormatRupiah(price))

	auth := smtp.PlainAuth("", cfg.SMTPUser, cfg.SMTPPassword, cfg.SMTPHost)
	addr := fmt.Sprintf("%s:%s", cfg.SMTPHost, cfg.SMTPPort)

	// Send to all admin notification emails
	for _, email := range adminNotificationEmails {
		message := fmt.Sprintf("To: %s\r\n"+
			"From: %s\r\n"+
			"Subject: %s\r\n"+
			"Content-Type: text/plain; charset=utf-8\r\n"+
			"\r\n"+
			"%s", email, cfg.SMTPFrom, subject, body)

		// Send email (continue even if one fails)
		go smtp.SendMail(addr, auth, cfg.SMTPFrom, []string{email}, []byte(message))
	}

	return nil
}

// OrderItem represents an order item for email notification
type OrderItemInfo struct {
	ProductName string
	Quantity    int
	Price       float64
	Subtotal    float64
}

// SendOrderNotificationToAdmins sends email notification when customer places an order
func SendOrderNotificationToAdmins(orderNumber, customerName, customerEmail, customerPhone, shippingAddress string, items []OrderItemInfo, totalAmount, shippingCost float64, paymentMethod string) error {
	cfg := config.AppConfig

	if cfg.SMTPUser == "" || cfg.SMTPPassword == "" {
		return fmt.Errorf("SMTP credentials not configured")
	}

	// Build items list
	itemsList := ""
	for i, item := range items {
		itemsList += fmt.Sprintf("   %d. %s\n      Qty: %d x Rp %s = Rp %s\n",
			i+1, item.ProductName, item.Quantity, FormatRupiah(item.Price), FormatRupiah(item.Subtotal))
	}

	subject := fmt.Sprintf("[GSM Motor] Pesanan Baru #%s dari %s", orderNumber, customerName)
	body := fmt.Sprintf(`
=====================================
NOTIFIKASI PESANAN BARU
=====================================

Nomor Pesanan: %s

INFORMASI PELANGGAN:
- Nama: %s
- Email: %s
- No. HP: %s
- Alamat Pengiriman: 
  %s

DETAIL PESANAN:
%s
----------------------------------------
Subtotal Produk: Rp %s
Ongkos Kirim: Rp %s
----------------------------------------
TOTAL PEMBAYARAN: Rp %s

METODE PEMBAYARAN: %s

TINDAKAN YANG DIPERLUKAN:
1. Tunggu konfirmasi pembayaran dari pelanggan
2. Setelah bukti transfer diupload, verifikasi pembayaran
3. Proses pengiriman setelah pembayaran terverifikasi

--
Silakan cek dashboard admin untuk detail lebih lanjut.

Salam,
Sistem GSM Motor
	`, orderNumber, customerName, customerEmail, customerPhone, shippingAddress,
		itemsList, FormatRupiah(totalAmount-shippingCost), FormatRupiah(shippingCost), FormatRupiah(totalAmount), paymentMethod)

	auth := smtp.PlainAuth("", cfg.SMTPUser, cfg.SMTPPassword, cfg.SMTPHost)
	addr := fmt.Sprintf("%s:%s", cfg.SMTPHost, cfg.SMTPPort)

	// Send to all admin notification emails
	for _, email := range adminNotificationEmails {
		message := fmt.Sprintf("To: %s\r\n"+
			"From: %s\r\n"+
			"Subject: %s\r\n"+
			"Content-Type: text/plain; charset=utf-8\r\n"+
			"\r\n"+
			"%s", email, cfg.SMTPFrom, subject, body)

		// Send email (continue even if one fails)
		go smtp.SendMail(addr, auth, cfg.SMTPFrom, []string{email}, []byte(message))
	}

	return nil
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
