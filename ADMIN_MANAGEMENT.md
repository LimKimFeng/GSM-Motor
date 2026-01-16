# 📝 Admin Account Management

## Quick Create Admin/Subadmin

### Interactive Script (Recommended)
```bash
./create-admin.sh
```

Script akan memandu Anda step-by-step:
1. Pilih tipe: Super Admin atau Sub Admin
2. Input nama, email, password
3. Otomatis create account dengan password ter-hash

---

## Manual Create (Direct SQL)

### 1. Generate Password Hash
```bash
cd backend
cat > /tmp/hash.go << 'EOF'
package main
import (
    "fmt"
    "os"
    "golang.org/x/crypto/bcrypt"
)
func main() {
    hash, _ := bcrypt.GenerateFromPassword([]byte(os.Args[1]), bcrypt.DefaultCost)
    fmt.Println(string(hash))
}
EOF

go run /tmp/hash.go "YourPasswordHere"
# Output: $2a$10$...
```

### 2. Insert ke Database
```sql
-- Get DB credentials from backend/.env
mysql -u gsm_user -p db_gsm_motor

-- Create Super Admin
INSERT INTO users (name, email, password, role, email_verified_at, created_at, updated_at) 
VALUES (
  'Admin Name',
  'admin@example.com',
  '$2a$10$...', -- paste hash dari step 1
  'admin',
  NOW(),
  NOW(),
  NOW()
);

-- Create Sub Admin
INSERT INTO users (name, email, password, role, email_verified_at, created_at, updated_at) 
VALUES (
  'Subadmin Name',
  'subadmin@example.com',
  '$2a$10$...', -- paste hash dari step 1
  'subadmin',
  NOW(),
  NOW(),
  NOW()
);
```

---

## Default Admin Accounts

**Super Admin:**
- Email: `superadmin@gsmmotor.com`
- Password: `Admin@123456`

**Sub Admin:**
- Email: `subadmin@gsmmotor.com`
- Password: `Admin@123456`

> ⚠️ **SECURITY**: Ganti password default ini setelah login pertama!

---

## Roles & Permissions

### Super Admin (`admin`)
- ✅ Full access to all features
- ✅ Manage products, categories, banners
- ✅ Manage orders & customers
- ✅ View all statistics
- ✅ Bulk price updates
- ✅ Delete products/categories
- ✅ View subadmin performance

### Sub Admin (`subadmin`)
- ✅ Manage products (upload with name tracking)
- ✅ View & manage orders
- ✅ View statistics (read-only)
- ❌ Cannot delete products
- ❌ Cannot manage system settings
- ❌ Limited access to sensitive data

---

## Managing Existing Accounts

### Update Password
```sql
-- Generate new hash first (see step 1 above)
UPDATE users 
SET password = '$2a$10$...',  -- new hash
    updated_at = NOW()
WHERE email = 'admin@example.com';
```

### Change Role
```sql
-- Make user admin
UPDATE users 
SET role = 'admin',
    updated_at = NOW()
WHERE email = 'user@example.com';

-- Make user subadmin
UPDATE users 
SET role = 'subadmin',
    updated_at = NOW()
WHERE email = 'user@example.com';
```

### Delete Account
```sql
DELETE FROM users 
WHERE email = 'user@example.com';
```

---

## Troubleshooting

**Login gagal?**
- Periksa email_verified_at sudah di-set
- Pastikan role adalah 'admin' atau 'subadmin'
- Cek password hash generate dengan benar

**Permission denied?**
- Periksa role di database
- Super Admin: `role = 'admin'`
- Sub Admin: `role = 'subadmin'`

**Email sudah terdaftar?**
```sql
-- Check existing user
SELECT id, name, email, role FROM users 
WHERE email = 'check@example.com';

-- Update instead of insert
UPDATE users 
SET role = 'admin', 
    password = '$2a$10$...',
    email_verified_at = NOW()
WHERE email = 'existing@example.com';
```

---

## Quick Commands Reference

```bash
# Create admin (interactive)
./create-admin.sh

# Check admin users
mysql -u gsm_user -p db_gsm_motor -e "SELECT id, name, email, role FROM users WHERE role IN ('admin', 'subadmin');"

# Reset admin password (after generating hash)
mysql -u gsm_user -p db_gsm_motor -e "UPDATE users SET password='$2a$10$...' WHERE email='admin@example.com';"
```
