# Emas Kiosk - Self-Service Ordering System 🏆

Aplikasi web **self-service kiosk** profesional untuk toko emas modern. Sistem pemesanan mandiri yang mirip dengan mesin pemesanan McDonald's atau Solaria, dilengkapi dengan dashboard admin real-time dan tampilan antrian fullscreen.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-v14+-brightgreen.svg)](https://nodejs.org/)
[![MySQL Version](https://img.shields.io/badge/mysql-8.0+-blue.svg)](https://www.mysql.com/)

---

## 🎯 Fitur Utama

### 👥 **Untuk Pelanggan**
- ✅ **Halaman Home** - Logo toko elegan dengan tombol mulai
- ✅ **Katalog Produk** - Tampilan grid dengan filter kategori
- ✅ **Detail Produk** - Modal lengkap dengan foto, berat, kadar, harga
- ✅ **Keranjang** - Manajemen item dengan jumlah dan total harga
- ✅ **Checkout** - Input nama dan nomor telepon pelanggan
- ✅ **Nomor Antrian** - Generate otomatis dengan QR Code
- ✅ **Touch-Optimized** - UI besar dan responsif untuk tablet

### 👨‍💼 **Untuk Admin**
- ✅ **Dashboard** - Statistik real-time (pesanan, pendapatan, antrian)
- ✅ **Kelola Antrian** - Panggil, ubah status, tracking
- ✅ **Kelola Produk** - CRUD produk dengan kategori
- ✅ **Admin Users** - Manajemen user staff
- ✅ **Activity Logs** - Track semua aktivitas admin

### 📺 **Untuk Display Monitor**
- ✅ **Fullscreen Queue** - Tampilan besar nomor antrian
- ✅ **Real-time Update** - Refresh otomatis setiap 3 detik
- ✅ **Animasi Premium** - Efek visual profesional

---

## 🛠️ Teknologi

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL 8.0+ |
| **Authentication** | JWT (JSON Web Token) |
| **QR Code** | qrcode.js library |
| **UI/UX** | Gold & Dark theme, Touch-optimized |

---

## 📁 Struktur Project

```
self-service-/
├── frontend/                 # Frontend aplikasi
│   ├── kiosk.html           # Halaman kiosk pelanggan
│   ├── admin.html           # Dashboard admin
│   ├── login.html           # Login admin
│   ├── display.html         # Tampilan antrian fullscreen
│   ├── css/
│   │   ├── style.css        # Style global
│   │   ├── kiosk.css        # Style kiosk
│   │   └── admin.css        # Style admin
│   └── js/
│       ├── kiosk.js         # Logic kiosk
│       └── admin.js         # Logic admin
│
├── backend/                  # Backend API
│   ├── server.js            # Entry point
│   ├── config/
│   │   └── database.js      # Database config
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── queueController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── queue.js
│   │   └── admin.js
│   └── middleware/
│       └── auth.js
│
├── database/
│   └── schema.sql           # Database schema
│
├── docs/
│   ├── INSTALASI.md         # Panduan instalasi
│   ├── API.md               # Dokumentasi API
│   └── DEPLOYMENT.md        # Panduan deployment
│
├── .env.example             # Environment template
├── package.json             # Dependencies
├── .gitignore              # Git ignore
└── README.md               # Dokumentasi
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- MySQL 8.0+
- npm atau yarn

### 1. Clone Repository
```bash
git clone https://github.com/fdlizak/self-service-.git
cd self-service-
```

### 2. Setup Database
```bash
mysql -u root -p < database/schema.sql
```

### 3. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan kredensial database Anda
npm start
```

### 4. Akses Aplikasi

| URL | Deskripsi |
|-----|-----------|
| http://localhost:3000/kiosk.html | Kiosk untuk pelanggan |
| http://localhost:3000/admin.html | Dashboard admin |
| http://localhost:3000/login.html | Login admin |
| http://localhost:3000/display.html | Display antrian |

---

## 📋 Default Credentials

```
Username: admin
Password: admin123
```

⚠️ **Ganti password di production!**

---

## 📊 Database Schema

### Tabel Utama
- **products** - Katalog produk emas
- **categories** - Kategori produk
- **orders** - Riwayat pesanan
- **queue** - Sistem antrian
- **customers** - Data pelanggan
- **admin_users** - User admin

Lihat `database/schema.sql` untuk detail lengkap.

---

## 🔌 API Endpoints

### Public Endpoints
```
GET    /api/products              # Semua produk
GET    /api/products/:id          # Detail produk
GET    /api/products/category/:id # Produk per kategori
POST   /api/orders                # Buat pesanan
GET    /api/queue                 # Daftar antrian
GET    /api/queue/current         # Antrian sekarang
```

### Protected Endpoints (Memerlukan JWT Token)
```
POST   /api/admin/login           # Login
POST   /api/admin/products        # Tambah produk
PUT    /api/admin/products/:id    # Edit produk
DELETE /api/admin/products/:id    # Hapus produk
PUT    /api/queue/:id/status      # Update status antrian
POST   /api/queue/call-next       # Panggil antrian berikutnya
```

Dokumentasi lengkap: [API.md](./docs/API.md)

---

## 📖 Dokumentasi

- 📚 [INSTALASI.md](./docs/INSTALASI.md) - Setup untuk Windows, macOS, Linux
- 🔧 [API.md](./docs/API.md) - Referensi semua endpoints
- 🚀 [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Production deployment

---

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Gold (#D4AF37) & Dark (#1a1a1a)
- **Typography**: Segoe UI, sans-serif
- **Responsive**: Mobile, tablet, desktop
- **Touch-Optimized**: Tombol besar (60-80px untuk kiosk)

### Pages
1. **Home** - Halaman sambutan dengan tombol besar
2. **Catalog** - Grid produk dengan filter kategori
3. **Detail Modal** - Popup detail produk
4. **Cart** - Tabel keranjang interaktif
5. **Checkout** - Form pelanggan & konfirmasi
6. **Success** - Tampilan nomor antrian + QR Code
7. **Admin Dashboard** - Statistik & manajemen
8. **Queue Display** - Fullscreen untuk monitor toko

---

## 🔐 Security

- ✅ JWT authentication untuk admin
- ✅ Password hashing dengan bcrypt
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention (prepared statements)
- ✅ XSS protection

---

## 📈 Performance

- Database indexes untuk query optimization
- Query caching untuk produk
- Efficient JSON responses
- Gzip compression (production)
- PM2 process management

---

## 🐛 Troubleshooting

### Backend tidak berjalan
```bash
cd backend
npm install
npm start
```

### Database error
```bash
mysql -u root -p emas_kiosk -e "SHOW TABLES;"
```

### Port 3000 sudah terpakai
```bash
# Ubah PORT di .env
PORT=3001
npm start
```

Lihat [INSTALASI.md](./docs/INSTALASI.md) untuk troubleshooting lengkap.

---

## 📋 Kategori Produk Default

1. **Cincin** - Cincin pertunangan, kawin, casual
2. **Kalung** - Kalung panjang, pendant, etnik
3. **Gelang** - Bangle, tali, dengan batu
4. **Anting** - Studs, gantung, dengan kristal
5. **Liontin** - Salib, bulan bintang, custom
6. **Emas Batangan** - Investasi 5gr-100gr

---

## 🌟 Fitur Unggulan

### Smart Queue System
- Nomor antrian otomatis (A001, A002, dst)
- QR Code untuk setiap pesanan
- Real-time status tracking
- Display fullscreen untuk monitor toko

### Admin Dashboard
- Statistik harian real-time
- Management antrian dengan update status
- CRUD produk lengkap
- Activity logs untuk audit

### Touch-Optimized UI
- Tombol minimal 60x60px
- Font besar & readable
- Minimal text input
- Responsive navigation

---

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Buat branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 Lisensi

Distributed under the MIT License. Lihat `LICENSE` untuk details.

---

## 📞 Support

Untuk pertanyaan atau masalah:
- 🐛 [Buka Issue](https://github.com/fdlizak/self-service-/issues)
- 📧 Email: support@tokoemas.com
- 💬 Chat support tersedia

---

## 🎯 Roadmap

- [ ] Multi-language support (Indonesia, English)
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Analytics dashboard
- [ ] Offline mode untuk kiosk
- [ ] Video tutorial

---

**Created with 💎 for Modern Gold Store - Toko Emas Mitra Jaya** ✨

[⬆ Back to top](#emas-kiosk---self-service-ordering-system-)
