-- ==========================================
-- DATABASE SCHEMA - EMAS KIOSK
-- ==========================================

-- Create Database
CREATE DATABASE IF NOT EXISTS emas_kiosk;
USE emas_kiosk;

-- ==========================================
-- TABLE: CATEGORIES
-- ==========================================
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: PRODUCTS
-- ==========================================
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    weight DECIMAL(10, 2) NOT NULL COMMENT 'dalam gram',
    karat VARCHAR(10) NOT NULL COMMENT '24K, 22K, 18K, 14K',
    price DECIMAL(15, 2) NOT NULL COMMENT 'dalam Rupiah',
    image_url VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: CUSTOMERS
-- ==========================================
CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: ORDERS
-- ==========================================
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    queue_number VARCHAR(10) NOT NULL UNIQUE COMMENT 'A001, A002, dst',
    order_items JSON NOT NULL COMMENT 'Array of product items',
    total_price DECIMAL(15, 2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    qr_code LONGTEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_queue_number (queue_number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: QUEUE
-- ==========================================
CREATE TABLE queue (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL UNIQUE,
    queue_number VARCHAR(10) NOT NULL UNIQUE,
    position INT NOT NULL COMMENT 'Urutan antrian',
    status ENUM('waiting', 'calling', 'processing', 'completed', 'cancelled') DEFAULT 'waiting',
    called_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_position (position),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: ADMIN USERS
-- ==========================================
CREATE TABLE admin_users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    email VARCHAR(100),
    role ENUM('admin', 'staff') DEFAULT 'staff',
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: ACTIVITY LOGS
-- ==========================================
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    admin_user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(36),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- INSERT SAMPLE DATA - CATEGORIES
-- ==========================================
INSERT INTO categories (id, name, description) VALUES
('cat-001', 'Cincin', 'Cincin emas dengan berbagai desain'),
('cat-002', 'Kalung', 'Kalung dan perhiasan leher dari emas'),
('cat-003', 'Gelang', 'Gelang tangan dari emas murni'),
('cat-004', 'Anting', 'Anting telinga dengan desain premium'),
('cat-005', 'Liontin', 'Liontin dan pendant dari emas'),
('cat-006', 'Emas Batangan', 'Emas batangan untuk investasi');

-- ==========================================
-- INSERT SAMPLE DATA - PRODUCTS
-- ==========================================
INSERT INTO products (id, category_id, name, description, weight, karat, price, image_url, status) VALUES
('prod-001', 'cat-001', 'Cincin Pertunangan Emas 24K', 'Cincin pertunangan mewah dengan batu mulia', 3.5, '24K', 2500000, '/images/cincin-001.jpg', 'active'),
('prod-002', 'cat-001', 'Cincin Kawin Emas 22K', 'Cincin kawin klasik untuk pasangan', 4.0, '22K', 2000000, '/images/cincin-002.jpg', 'active'),
('prod-003', 'cat-002', 'Kalung Panjang Emas 24K', 'Kalung panjang dengan desain etnik modern', 8.0, '24K', 4500000, '/images/kalung-001.jpg', 'active'),
('prod-004', 'cat-002', 'Kalung Pendant Emas 18K', 'Kalung dengan pendant batu akik', 5.5, '18K', 3200000, '/images/kalung-002.jpg', 'active'),
('prod-005', 'cat-003', 'Gelang Bangle Emas 22K', 'Gelang bangle solid dengan ukir tradisional', 12.0, '22K', 5500000, '/images/gelang-001.jpg', 'active'),
('prod-006', 'cat-003', 'Gelang Tali Emas 24K', 'Gelang dengan motif tali yang elegan', 6.0, '24K', 3800000, '/images/gelang-002.jpg', 'active'),
('prod-007', 'cat-004', 'Anting Studs Emas 24K', 'Anting tusuk dengan batu kristal', 2.0, '24K', 1200000, '/images/anting-001.jpg', 'active'),
('prod-008', 'cat-004', 'Anting Gantung Emas 22K', 'Anting gantung dengan desain modern', 3.5, '22K', 1800000, '/images/anting-002.jpg', 'active'),
('prod-009', 'cat-005', 'Liontin Salib Emas 24K', 'Liontin salib dengan finishing halus', 4.0, '24K', 2300000, '/images/liontin-001.jpg', 'active'),
('prod-010', 'cat-005', 'Liontin Bulan Bintang Emas 22K', 'Liontin dengan motif bulan bintang', 3.5, '22K', 2000000, '/images/liontin-002.jpg', 'active'),
('prod-011', 'cat-006', 'Emas Batangan 5 Gram 24K', 'Emas batangan 5 gram untuk investasi', 5.0, '24K', 3500000, '/images/batangan-005g.jpg', 'active'),
('prod-012', 'cat-006', 'Emas Batangan 10 Gram 24K', 'Emas batangan 10 gram untuk investasi', 10.0, '24K', 7000000, '/images/batangan-010g.jpg', 'active');

-- ==========================================
-- INSERT SAMPLE DATA - ADMIN
-- ==========================================
INSERT INTO admin_users (id, username, password_hash, full_name, email, role, status) VALUES
('admin-001', 'admin', '$2b$10$N9qo8uLOickgx2ZMRZoHyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Administrator', 'admin@tokoemas.com', 'admin', 'active'),
('admin-002', 'staff01', '$2b$10$N9qo8uLOickgx2ZMRZoHyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Staf Toko', 'staff@tokoemas.com', 'staff', 'active');
