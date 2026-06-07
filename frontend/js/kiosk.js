/* ==========================================
   KIOSK APP - MAIN LOGIC
   ========================================== */

const API_BASE_URL = 'http://localhost:3000/api';

class EmasKiosk {
    constructor() {
        this.currentPage = 'home';
        this.cart = [];
        this.products = [];
        this.categories = [];
        this.selectedCategory = null;
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadProducts();
        this.renderHome();
        this.setupEventListeners();
    }

    // Load categories from API
    async loadCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            const result = await response.json();
            
            if (result.success) {
                // Extract unique categories
                const catMap = new Map();
                result.data.forEach(product => {
                    if (!catMap.has(product.category_id)) {
                        catMap.set(product.category_id, {
                            id: product.category_id,
                            name: product.category_name
                        });
                    }
                });
                this.categories = Array.from(catMap.values());
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showAlert('Gagal memuat kategori', 'error');
        }
    }

    // Load products from API
    async loadProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            const result = await response.json();
            
            if (result.success) {
                this.products = result.data;
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showAlert('Gagal memuat produk', 'error');
        }
    }

    // Render home page
    renderHome() {
        const container = document.getElementById('app-container');
        container.innerHTML = `
            <div class="home-page">
                <div class="logo-container">
                    <div class="logo">💎</div>
                    <h1 class="store-name">TOKO EMAS MITRA JAYA</h1>
                    <p class="store-tagline">Perhiasan Emas Premium Terpercaya</p>
                </div>
                <button class="start-btn" onclick="kioskApp.renderCatalog()">
                    MULAI PILIH PRODUK
                </button>
            </div>
        `;
        this.currentPage = 'home';
    }

    // Render catalog page
    renderCatalog() {
        const container = document.getElementById('app-container');
        const categoryFilters = this.categories.map(cat => `
            <button class="category-btn ${!this.selectedCategory ? 'active' : ''}" 
                    onclick="kioskApp.filterByCategory('${cat.id}')">
                ${cat.name}
            </button>
        `).join('');

        const filteredProducts = this.selectedCategory 
            ? this.products.filter(p => p.category_id === this.selectedCategory)
            : this.products;

        const productsHtml = filteredProducts.map(product => `
            <div class="product-card" onclick="kioskApp.showProductDetail('${product.id}')">
                <div class="product-image">
                    ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}">` : '💍'}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-specs">
                        <div class="product-spec">
                            <span>Kadar:</span>
                            <strong>${product.karat}</strong>
                        </div>
                        <div class="product-spec">
                            <span>Berat:</span>
                            <strong>${product.weight}gr</strong>
                        </div>
                    </div>
                    <div class="product-price">
                        Rp ${this.formatPrice(product.price)}
                    </div>
                    <button class="product-card-btn">LIHAT DETAIL</button>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="header">
                <div class="header-left">
                    <button class="btn btn-secondary" onclick="kioskApp.renderHome()">← KEMBALI</button>
                    <h2 class="header-title">Pilih Produk Emas</h2>
                </div>
                <div class="header-right">
                    <span>Total Item: <strong>${this.cart.length}</strong></span>
                </div>
            </div>
            <div class="catalog-container">
                <div class="categories-sidebar">
                    <button class="category-btn ${!this.selectedCategory ? 'active' : ''}" 
                            onclick="kioskApp.filterByCategory(null)">
                        ✓ SEMUA
                    </button>
                    ${categoryFilters}
                </div>
                <div class="products-grid">
                    ${productsHtml}
                </div>
            </div>
            <div class="cart-badge" onclick="kioskApp.renderCart()">
                <div class="cart-count">${this.cart.length}</div>
                <div class="cart-label">KERANJANG</div>
            </div>
        `;
        this.currentPage = 'catalog';
    }

    // Filter products by category
    filterByCategory(categoryId) {
        this.selectedCategory = categoryId;
        this.renderCatalog();
    }

    // Show product detail
    showProductDetail(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                <div class="detail-image">💎</div>
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                
                <div class="detail-info">
                    <div class="detail-label">Kategori</div>
                    <div class="detail-value">${product.category_name}</div>
                    
                    <div class="detail-label">Kadar Emas</div>
                    <div class="detail-value">${product.karat}</div>
                    
                    <div class="detail-label">Berat</div>
                    <div class="detail-value">${product.weight} gram</div>
                    
                    <div class="detail-label">Harga</div>
                    <div class="detail-value text-gold" style="font-size: 28px;">
                        Rp ${this.formatPrice(product.price)}
                    </div>
                </div>
                
                <button class="btn btn-primary btn-large" onclick="kioskApp.addToCart('${product.id}'); this.parentElement.parentElement.remove();">
                    + TAMBAH KE KERANJANG
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Add to cart
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                weight: product.weight,
                karat: product.karat,
                quantity: 1
            });
        }

        this.showAlert(`${product.name} ditambahkan ke keranjang`, 'success');
    }

    // Render cart
    renderCart() {
        if (this.cart.length === 0) {
            this.showAlert('Keranjang masih kosong', 'info');
            return;
        }

        const container = document.getElementById('app-container');
        const cartItems = this.cart.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.weight}gr ${item.karat}</td>
                <td>Rp ${this.formatPrice(item.price)}</td>
                <td>
                    <button class="btn btn-sm" onclick="kioskApp.updateQuantity(${index}, -1)">-</button>
                    <span style="margin: 0 10px;">${item.quantity}</span>
                    <button class="btn btn-sm" onclick="kioskApp.updateQuantity(${index}, 1)">+</button>
                </td>
                <td>Rp ${this.formatPrice(item.price * item.quantity)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="kioskApp.removeFromCart(${index})">HAPUS</button>
                </td>
            </tr>
        `).join('');

        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        container.innerHTML = `
            <div class="header">
                <div class="header-left">
                    <button class="btn btn-secondary" onclick="kioskApp.renderCatalog()">← KEMBALI</button>
                    <h2 class="header-title">Keranjang Belanja</h2>
                </div>
            </div>
            <div style="padding: 30px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: var(--secondary-dark); color: var(--white);">
                            <th style="padding: 12px; text-align: left;">#</th>
                            <th style="padding: 12px; text-align: left;">Produk</th>
                            <th style="padding: 12px; text-align: left;">Spesifikasi</th>
                            <th style="padding: 12px; text-align: left;">Harga</th>
                            <th style="padding: 12px; text-align: center;">Jumlah</th>
                            <th style="padding: 12px; text-align: right;">Total</th>
                            <th style="padding: 12px; text-align: center;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cartItems}
                    </tbody>
                </table>
                
                <div style="margin-top: 30px; text-align: right; border-top: 2px solid var(--primary-gold); padding-top: 20px;">
                    <h2 style="font-size: 28px; color: var(--primary-gold);">
                        Total: Rp ${this.formatPrice(totalPrice)}
                    </h2>
                </div>
                
                <div style="margin-top: 30px; display: flex; gap: 20px; justify-content: flex-end;">
                    <button class="btn btn-secondary btn-lg-touch" onclick="kioskApp.cart = []; kioskApp.renderCatalog();">
                        HAPUS SEMUA
                    </button>
                    <button class="btn btn-primary btn-lg-touch" onclick="kioskApp.renderCheckout();">
                        LANJUTKAN PEMBAYARAN →
                    </button>
                </div>
            </div>
        `;
        this.currentPage = 'cart';
    }

    // Update quantity
    updateQuantity(index, change) {
        this.cart[index].quantity += change;
        if (this.cart[index].quantity <= 0) {
            this.removeFromCart(index);
        } else {
            this.renderCart();
        }
    }

    // Remove from cart
    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.renderCart();
    }

    // Render checkout
    renderCheckout() {
        const container = document.getElementById('app-container');
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        container.innerHTML = `
            <div class="header">
                <div class="header-left">
                    <h2 class="header-title">Data Pelanggan & Konfirmasi</h2>
                </div>
            </div>
            <div style="padding: 30px; max-width: 800px; margin: 0 auto;">
                <h3>Masukkan Data Anda</h3>
                
                <div class="form-group" style="margin-top: 20px;">
                    <label for="customerName">Nama Lengkap *</label>
                    <input type="text" id="customerName" placeholder="Masukkan nama lengkap Anda" style="padding: 16px; font-size: 18px;">
                </div>
                
                <div class="form-group">
                    <label for="customerPhone">Nomor Telepon (Opsional)</label>
                    <input type="tel" id="customerPhone" placeholder="Nomor telepon Anda" style="padding: 16px; font-size: 18px;">
                </div>
                
                <h3 style="margin-top: 30px;">Ringkasan Pesanan</h3>
                <div style="background: var(--secondary-dark); color: var(--white); padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <p><strong>Total Item:</strong> ${this.cart.length}</p>
                    <p><strong>Total Harga:</strong> Rp ${this.formatPrice(totalPrice)}</p>
                </div>
                
                <div style="margin-top: 30px; display: flex; gap: 20px;">
                    <button class="btn btn-secondary btn-lg-touch" onclick="kioskApp.renderCart();">
                        ← KEMBALI
                    </button>
                    <button class="btn btn-primary btn-lg-touch" onclick="kioskApp.submitOrder();">
                        KONFIRMASI PESANAN →
                    </button>
                </div>
            </div>
        `;
        this.currentPage = 'checkout';
    }

    // Submit order
    async submitOrder() {
        const name = document.getElementById('customerName').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();

        if (!name) {
            this.showAlert('Nama pelanggan harus diisi', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: name,
                    customerPhone: phone,
                    items: this.cart
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.renderQueueNumber(result.data);
            } else {
                this.showAlert('Gagal membuat pesanan: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            this.showAlert('Terjadi kesalahan saat membuat pesanan', 'error');
        }
    }

    // Render queue number
    renderQueueNumber(orderData) {
        const container = document.getElementById('app-container');
        container.innerHTML = `
            <div style="height: 100%; display: flex; align-items: center; justify-content: center; padding: 40px;">
                <div style="text-align: center;">
                    <h1 style="font-size: 64px; margin-bottom: 20px;">✓ PESANAN BERHASIL</h1>
                    
                    <div style="background: linear-gradient(135deg, var(--primary-gold) 0%, var(--dark-gold) 100%); 
                                padding: 40px; border-radius: 16px; margin-bottom: 30px;">
                        <p style="color: var(--dark-bg); font-size: 18px; margin-bottom: 10px;">NOMOR ANTRIAN ANDA</p>
                        <h1 style="color: var(--dark-bg); font-size: 96px; letter-spacing: 10px;">
                            ${orderData.queueNumber}
                        </h1>
                    </div>
                    
                    <div style="background: var(--white); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        ${orderData.qrCode ? `<img src="${orderData.qrCode}" style="width: 250px; height: 250px;">` : ''}
                        <p style="margin-top: 20px; font-size: 16px;">Tunjukkan QR Code ini ke kasir</p>
                    </div>
                    
                    <div style="background: var(--secondary-dark); color: var(--white); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p><strong>Total Harga:</strong> Rp ${this.formatPrice(orderData.totalPrice)}</p>
                        <p style="margin-top: 10px; font-size: 14px;">Silakan tunggu hingga nomor Anda dipanggil di layar display</p>
                    </div>
                    
                    <button class="btn btn-primary btn-lg-touch" onclick="kioskApp.renderHome();">
                        MULAI LAGI
                    </button>
                </div>
            </div>
        `;
        this.cart = [];
        this.currentPage = 'success';
    }

    // Show alert
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; max-width: 400px; z-index: 10000;';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => alertDiv.remove(), 4000);
    }

    // Format price
    formatPrice(price) {
        return new Intl.NumberFormat('id-ID').format(Math.round(price));
    }

    // Setup event listeners
    setupEventListeners() {
        // Touch events optimization
        document.addEventListener('touchstart', function() {}, true);
    }
}

// Initialize app
let kioskApp;
document.addEventListener('DOMContentLoaded', () => {
    kioskApp = new EmasKiosk();
});
