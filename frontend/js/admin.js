/* ==========================================
   ADMIN DASHBOARD LOGIC
   ========================================== */

const API_BASE_URL = 'http://localhost:3000/api';

class AdminDashboard {
    constructor() {
        this.currentPage = 'dashboard';
        this.token = localStorage.getItem('adminToken');
        this.user = JSON.parse(localStorage.getItem('adminUser') || '{}');
        
        if (!this.token) {
            window.location.href = 'login.html';
            return;
        }
        
        this.init();
    }

    async init() {
        this.updateClock();
        this.loadDashboard();
        this.loadCategories();
        setInterval(() => this.updateClock(), 1000);
        setInterval(() => this.loadDashboard(), 5000); // Refresh setiap 5 detik
    }

    updateClock() {
        const now = new Date();
        document.getElementById('current-time').textContent = now.toLocaleTimeString('id-ID');
        document.getElementById('user-name').textContent = this.user.fullName || 'Admin';
    }

    async loadDashboard() {
        try {
            // Load statistics
            const statsRes = await this.apiCall('/admin/stats', 'GET');
            if (statsRes) {
                document.getElementById('stat-total-orders').textContent = statsRes.data.ordersToday;
                document.getElementById('stat-revenue').textContent = 'Rp ' + this.formatPrice(statsRes.data.revenueToday);
                document.getElementById('stat-waiting').textContent = statsRes.data.queueWaiting;
                document.getElementById('stat-completed').textContent = statsRes.data.queueCompleted;
            }

            // Load queue
            const queueRes = await this.apiCall('/queue', 'GET');
            if (queueRes) {
                this.renderQueueData(queueRes.data);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    renderQueueData(queue) {
        const waitingQueue = queue.filter(q => q.status === 'waiting').slice(0, 5);
        const completedQueue = queue.filter(q => q.status === 'completed').slice(0, 5);

        document.getElementById('waiting-queue').innerHTML = waitingQueue.map(q => `
            <div class="queue-item">
                <div class="queue-number">${q.queue_number}</div>
                <div class="queue-info">
                    <div class="queue-info-row">Posisi: ${q.position}</div>
                    <div class="queue-info-row">Status: ${q.status}</div>
                </div>
            </div>
        `).join('');

        document.getElementById('completed-queue').innerHTML = completedQueue.map(q => `
            <div class="queue-item">
                <div class="queue-number">${q.queue_number}</div>
                <div class="queue-info">
                    <div class="queue-info-row">Selesai: ${new Date(q.completed_at).toLocaleTimeString('id-ID')}</div>
                </div>
            </div>
        `).join('');
    }

    async loadCategories() {
        try {
            const res = await this.apiCall('/products', 'GET');
            if (res && res.data) {
                const categories = [...new Set(res.data.map(p => ({ id: p.category_id, name: p.category_name })))];
                const select = document.getElementById('product-category');
                select.innerHTML = categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadProducts() {
        try {
            const res = await this.apiCall('/products', 'GET');
            if (res && res.data) {
                const tbody = document.getElementById('products-table-body');
                tbody.innerHTML = res.data.map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td>${product.category_name}</td>
                        <td>${product.karat}</td>
                        <td>${product.weight}gr</td>
                        <td>Rp ${this.formatPrice(product.price)}</td>
                        <td>
                            <span class="queue-status ${product.status}">
                                ${product.status === 'active' ? '✓ Aktif' : '✗ Nonaktif'}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-secondary" onclick="adminApp.editProduct('${product.id}')">Edit</button>
                                <button class="btn btn-danger" onclick="adminApp.deleteProduct('${product.id}')">Hapus</button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    async loadQueue() {
        try {
            const res = await this.apiCall('/queue', 'GET');
            if (res && res.data) {
                const tbody = document.getElementById('queue-table-body');
                tbody.innerHTML = res.data.map(queue => `
                    <tr>
                        <td>${queue.position}</td>
                        <td><strong>${queue.queue_number}</strong></td>
                        <td>${queue.customer_id}</td>
                        <td>
                            <span class="queue-status ${queue.status}">
                                ${queue.status}
                            </span>
                        </td>
                        <td>
                            <select onchange="adminApp.updateQueueStatus('${queue.id}', this.value)">
                                <option value="waiting" ${queue.status === 'waiting' ? 'selected' : ''}>Menunggu</option>
                                <option value="processing" ${queue.status === 'processing' ? 'selected' : ''}>Diproses</option>
                                <option value="completed" ${queue.status === 'completed' ? 'selected' : ''}>Selesai</option>
                            </select>
                        </td>
                    </tr>
                `).join('');

                // Load current queue
                const currentRes = await this.apiCall('/queue/current', 'GET');
                if (currentRes && currentRes.data) {
                    document.getElementById('current-queue').textContent = `🎯 ${currentRes.data.queue_number}`;
                } else {
                    document.getElementById('current-queue').textContent = '❌ Tidak ada';
                }
            }
        } catch (error) {
            console.error('Error loading queue:', error);
        }
    }

    async loadUsers() {
        try {
            const res = await this.apiCall('/admin/users', 'GET');
            if (res && res.data) {
                const tbody = document.getElementById('users-table-body');
                tbody.innerHTML = res.data.map(user => `
                    <tr>
                        <td>${user.username}</td>
                        <td>${user.full_name}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>
                            <span class="queue-status ${user.status}">
                                ${user.status === 'active' ? '✓ Aktif' : '✗ Nonaktif'}
                            </span>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('[id$="-page"]').forEach(el => el.style.display = 'none');
        
        // Show selected page
        document.getElementById(pageName + '-page').style.display = 'block';
        
        // Update menu
        document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
        event.target.classList.add('active');
        
        // Update title
        const titles = {
            dashboard: 'Dashboard',
            queue: 'Kelola Antrian',
            products: 'Kelola Produk',
            users: 'Admin Users'
        };
        document.getElementById('page-title').textContent = titles[pageName];
        
        // Load data
        if (pageName === 'queue') this.loadQueue();
        if (pageName === 'products') this.loadProducts();
        if (pageName === 'users') this.loadUsers();
    }

    async callNextQueue() {
        try {
            const res = await this.apiCall('/queue/call-next', 'POST');
            if (res && res.data) {
                this.showAlert('Antrian ' + res.data.queue_number + ' dipanggil', 'success');
                this.loadQueue();
                this.loadDashboard();
            }
        } catch (error) {
            this.showAlert('Gagal memanggil antrian', 'error');
        }
    }

    async updateQueueStatus(queueId, status) {
        try {
            await this.apiCall(`/queue/${queueId}/status`, 'PUT', { status });
            this.showAlert('Status antrian diperbarui', 'success');
            this.loadQueue();
            this.loadDashboard();
        } catch (error) {
            this.showAlert('Gagal memperbarui status', 'error');
        }
    }

    showAddProductModal() {
        document.getElementById('add-product-modal').classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    async addProduct(event) {
        event.preventDefault();
        
        const product = {
            categoryId: document.getElementById('product-category').value,
            name: document.getElementById('product-name').value,
            description: document.getElementById('product-description').value,
            weight: parseFloat(document.getElementById('product-weight').value),
            karat: document.getElementById('product-karat').value,
            price: parseFloat(document.getElementById('product-price').value)
        };

        try {
            await this.apiCall('/admin/products', 'POST', product);
            this.showAlert('Produk berhasil ditambahkan', 'success');
            this.closeModal('add-product-modal');
            this.loadProducts();
            event.target.reset();
        } catch (error) {
            this.showAlert('Gagal menambahkan produk', 'error');
        }
    }

    async deleteProduct(productId) {
        if (confirm('Yakin ingin menghapus produk ini?')) {
            try {
                await this.apiCall(`/admin/products/${productId}`, 'DELETE');
                this.showAlert('Produk berhasil dihapus', 'success');
                this.loadProducts();
            } catch (error) {
                this.showAlert('Gagal menghapus produk', 'error');
            }
        }
    }

    showAddUserModal() {
        document.getElementById('add-user-modal').classList.add('active');
    }

    async addUser(event) {
        event.preventDefault();
        
        const user = {
            username: document.getElementById('user-username').value,
            password: document.getElementById('user-password').value,
            fullName: document.getElementById('user-fullname').value,
            email: document.getElementById('user-email').value
        };

        try {
            await this.apiCall('/admin/users', 'POST', user);
            this.showAlert('Admin user berhasil ditambahkan', 'success');
            this.closeModal('add-user-modal');
            this.loadUsers();
            event.target.reset();
        } catch (error) {
            this.showAlert('Gagal menambahkan user', 'error');
        }
    }

    logout() {
        if (confirm('Yakin ingin logout?')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = 'login.html';
        }
    }

    async apiCall(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        };

        if (body) options.body = JSON.stringify(body);

        const response = await fetch(API_BASE_URL + endpoint, options);
        
        if (response.status === 401) {
            window.location.href = 'login.html';
            return null;
        }

        return await response.json();
    }

    formatPrice(price) {
        return new Intl.NumberFormat('id-ID').format(Math.round(price));
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; max-width: 400px; z-index: 10000;';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => alertDiv.remove(), 4000);
    }
}

// Initialize
let adminApp;
document.addEventListener('DOMContentLoaded', () => {
    adminApp = new AdminDashboard();
});
