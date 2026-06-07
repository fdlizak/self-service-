# Panduan Instalasi - Emas Kiosk

## Persyaratan Sistem

- **Node.js**: v14 atau lebih tinggi
- **MySQL**: 8.0 atau lebih tinggi
- **npm** atau **yarn**
- Browser modern (Chrome, Firefox, Safari, Edge)
- Tablet 10-15 inch (untuk kiosk pelanggan)

## Instalasi di Windows

### 1. Download dan Install Requirements

#### Node.js
1. Download dari https://nodejs.org/
2. Pilih LTS version
3. Install dengan default settings
4. Verifikasi:
```bash
node --version
npm --version
```

#### MySQL
1. Download dari https://dev.mysql.com/downloads/mysql/
2. Install dengan default settings
3. Catat username (default: root) dan password
4. Verifikasi MySQL berjalan

### 2. Clone Repository

```bash
git clone https://github.com/fdlizak/self-service-.git
cd self-service-
```

### 3. Setup Database

1. Buka MySQL Command Line atau MySQL Workbench
2. Buat database:
```sql
mysql -u root -p < database/schema.sql
```

3. Verifikasi database:
```sql
SHOW DATABASES;
USE emas_kiosk;
SHOW TABLES;
```

### 4. Setup Backend

```bash
# Masuk folder backend
cd backend

# Install dependencies
npm install

# Setup environment file
copy .env.example .env

# Edit .env dengan text editor
# Sesuaikan DB_PASSWORD dan konfigurasi lainnya
```

File `.env` harus memiliki:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_anda
DB_NAME=emas_kiosk
PORT=3000
NODE_ENV=development
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 5. Jalankan Backend Server

```bash
npm start
# Atau untuk development dengan auto-reload:
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### 6. Akses Aplikasi

**Frontend Kiosk (Pelanggan):**
- http://localhost:3000/kiosk.html

**Admin Dashboard:**
- http://localhost:3000/login.html
- Username: `admin`
- Password: `admin123`

---

## Instalasi di macOS

### 1. Install Homebrew (jika belum)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js dan MySQL

```bash
brew install node
brew install mysql

# Start MySQL
brew services start mysql

# Verifikasi
node --version
npm --version
mysql --version
```

### 3. Clone dan Setup

```bash
git clone https://github.com/fdlizak/self-service-.git
cd self-service-
mysql -u root < database/schema.sql
```

### 4. Setup Backend

```bash
cd backend
npm install
cp .env.example .env

# Edit .env dengan text editor Anda
```

### 5. Jalankan Server

```bash
npm start
```

---

## Instalasi di Linux (Ubuntu/Debian)

### 1. Update System

```bash
sudo apt update
sudo apt upgrade
```

### 2. Install Dependencies

```bash
sudo apt install nodejs npm mysql-server
sudo systemctl start mysql
```

### 3. Clone Repository

```bash
git clone https://github.com/fdlizak/self-service-.git
cd self-service-
```

### 4. Setup Database

```bash
sudo mysql -u root -p < database/schema.sql
```

### 5. Setup Backend

```bash
cd backend
npm install
cp .env.example .env

# Edit .env
nano .env
```

### 6. Jalankan Server

```bash
npm start
```

---

## Database Setup Manual (Jika gagal auto-import)

1. Login ke MySQL:
```bash
mysql -u root -p
```

2. Jalankan script SQL:
```sql
CREATE DATABASE emas_kiosk;
USE emas_kiosk;

-- Salin seluruh isi dari database/schema.sql
-- Paste di sini
```

3. Verifikasi:
```sql
SHOW TABLES;
SELECT * FROM categories;
SELECT COUNT(*) FROM products;
```

---

## Troubleshooting

### Error: "Cannot find module 'mysql2'"
**Solusi:**
```bash
cd backend
npm install mysql2
```

### Error: "ECONNREFUSED 127.0.0.1:3306"
**Solusi:** MySQL tidak berjalan
- Windows: Cek Services (services.msc) - MySQL80 harus running
- macOS: `brew services start mysql`
- Linux: `sudo systemctl start mysql`

### Error: "Port 3000 already in use"
**Solusi:** Ubah PORT di .env:
```
PORT=3001
```

### Error: "Database connection failed"
**Solusi:** Verifikasi credentials di .env
```bash
mysql -u root -p
# Masukkan password yang sama dengan DB_PASSWORD di .env
```

### Frontend tidak connect ke API
**Solusi:** Cek CORS di backend/server.js
- API_BASE_URL di frontend harus sesuai dengan server URL
- Default: `http://localhost:3000/api`

---

## Testing Aplikasi

### 1. Test Kiosk (Pelanggan)
- Buka http://localhost:3000/kiosk.html
- Klik "MULAI PILIH PRODUK"
- Pilih produk dan tambah ke keranjang
- Checkout dan lihat nomor antrian

### 2. Test Admin Dashboard
- Buka http://localhost:3000/login.html
- Login dengan:
  - Username: `admin`
  - Password: `admin123`
- Lihat dashboard dengan statistik
- Kelola antrian dan produk

### 3. Test API dengan cURL

**Get Products:**
```bash
curl http://localhost:3000/api/products
```

**Create Order:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Budi Santoso",
    "customerPhone": "081234567890",
    "items": [
      {"id": "prod-001", "name": "Cincin", "price": 2500000, "quantity": 1}
    ]
  }'
```

---

## Pengaturan Lanjutan

### Setup SSL/HTTPS (Production)
1. Generate certificate:
```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

2. Update backend/server.js untuk menggunakan HTTPS

### Backup Database
```bash
mysqldump -u root -p emas_kiosk > backup.sql
```

### Restore Database
```bash
mysql -u root -p emas_kiosk < backup.sql
```

---

## Performance Optimization

### 1. Enable Database Query Caching
Edit `/etc/mysql/my.cnf`:
```ini
query_cache_size = 256M
query_cache_type = 1
```

### 2. Optimize Node.js
```bash
node --max-old-space-size=4096 backend/server.js
```

### 3. Use PM2 untuk Production
```bash
npm install -g pm2
pm2 start backend/server.js
pm2 save
pm2 startup
```

---

## Support & Documentation

- 📖 Full API Documentation: [API.md](./API.md)
- 🚀 Deployment Guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 Report Issues: https://github.com/fdlizak/self-service-/issues

Untuk pertanyaan atau bantuan, silakan membuka issue di repository.

---

**Selamat! Instalasi selesai. Aplikasi siap digunakan!** ✨
