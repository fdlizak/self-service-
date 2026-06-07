# Emas Kiosk - Self-Service Ordering System 🏆

Aplikasi web self-service kiosk untuk toko emas modern. Sistem pemesanan mandiri yang mirip dengan mesin pemesanan McDonald's atau Solaria.

## Fitur Utama

✅ **Halaman Home** - Logo toko, tombol mulai memilih produk  
✅ **Katalog Produk** - Menampilkan foto, kadar emas, berat, harga  
✅ **Detail Produk** - Informasi lengkap dengan tombol tambah ke keranjang  
✅ **Keranjang** - Daftar produk, total item, total harga  
✅ **Data Pelanggan** - Input nama dan nomor telepon  
✅ **Generate Nomor Antrian** - Nomor otomatis + QR Code  
✅ **Dashboard Admin** - Kelola produk dan antrian  
✅ **Tampilan Layar Antrian** - Fullscreen display untuk monitor toko  
✅ **Touch-Optimized** - Dioptimalkan untuk layar sentuh tablet  

## Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)
- **Backend**: Node.js + Express.js
- **Database**: MySQL 8.0+
- **QR Code**: qrcode.js library
- **UI/UX**: Desain premium dengan nuansa emas dan hitam

## Struktur Project

```
emas-kiosk/
├── frontend/                 # Aplikasi kiosk & admin
│   ├── index.html           # Halaman home
│   ├── kiosk.html           # Halaman kiosk pelanggan
│   ├── admin.html           # Dashboard admin
│   ├── display.html         # Tampilan antrian (fullscreen)
│   ├── css/
│   │   ├── style.css        # Style global
│   │   ├── kiosk.css        # Style kiosk
│   │   ├── admin.css        # Style admin
│   │   └── display.css      # Style display antrian
│   └── js/
│       ├── app.js           # Logic aplikasi
│       ├── kiosk.js         # Logic kiosk
│       ├── admin.js         # Logic admin
│       ├── display.js       # Logic display
│       └── utils.js         # Utility functions
├── backend/                  # API Server
│   ├── server.js            # Entry point
│   ├── config/
│   │   └── database.js      # Konfigurasi MySQL
│   ├── routes/
│   │   ├── products.js      # API produk
│   │   ├── orders.js        # API pesanan
│   │   ├── queue.js         # API antrian
│   │   └── admin.js         # API admin
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── queueController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js          # Middleware authentikasi
│   └── models/
│       └── index.js         # Model database
├── database/
│   └── schema.sql           # Schema lengkap
├── docs/
│   ├── INSTALASI.md         # Panduan instalasi
│   ├── API.md               # Dokumentasi API
│   └── DEPLOYMENT.md        # Panduan deployment
├── .env.example             # Environment template
├── package.json             # Dependencies
└── .gitignore               # Git ignore
```

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/fdlizak/self-service-.git
cd self-service-
```

### 2. Setup Backend
```bash
cd backend
npm install
```

### 3. Setup Database
```bash
mysql -u root -p
mysql> SOURCE ../database/schema.sql;
```

### 4. Konfigurasi Environment
```bash
cp .env.example .env
# Edit .env dengan konfigurasi database Anda
```

### 5. Jalankan Server
```bash
npm start
# Server berjalan di http://localhost:3000
```

### 6. Akses Aplikasi
- **Kiosk Pelanggan**: http://localhost:3000/kiosk.html
- **Admin Dashboard**: http://localhost:3000/admin.html
- **Tampilan Antrian**: http://localhost:3000/display.html

## API Endpoints

### Products
- `GET /api/products` - Daftar semua produk
- `GET /api/products/category/:category` - Produk berdasarkan kategori
- `GET /api/products/:id` - Detail produk
- `GET /api/categories` - Daftar kategori

### Orders
- `POST /api/orders` - Buat pesanan baru
- `GET /api/orders/:id` - Detail pesanan
- `GET /api/orders/:id/qrcode` - Generate QR code

### Queue
- `GET /api/queue` - Daftar antrian
- `POST /api/queue/:id/call` - Panggil nomor
- `PUT /api/queue/:id/status` - Update status

### Admin
- `POST /api/admin/login` - Login admin
- `POST /api/admin/products` - Tambah produk
- `PUT /api/admin/products/:id` - Edit produk
- `DELETE /api/admin/products/:id` - Hapus produk

## Requirements

- Node.js v14+
- MySQL 8.0+
- npm atau yarn
- Browser modern dengan support touch events

## Dokumentasi Lengkap

📖 [INSTALASI.md](./docs/INSTALASI.md) - Panduan instalasi detail  
🔧 [API.md](./docs/API.md) - Dokumentasi semua endpoint  
🚀 [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Panduan deployment production

## Lisensi

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan Anda.

---

**Created for Modern Gold Store Self-Service Ordering** ✨
