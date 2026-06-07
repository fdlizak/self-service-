const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const [products] = await conn.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             JOIN categories c ON p.category_id = c.id 
             WHERE p.status = 'active'
             ORDER BY p.name ASC`
        );
        conn.release();
        
        res.json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const conn = await pool.getConnection();
        
        const [products] = await conn.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             JOIN categories c ON p.category_id = c.id 
             WHERE c.id = ? AND p.status = 'active'
             ORDER BY p.name ASC`,
            [category]
        );
        conn.release();
        
        res.json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const conn = await pool.getConnection();
        
        const [products] = await conn.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             JOIN categories c ON p.category_id = c.id 
             WHERE p.id = ?`,
            [id]
        );
        conn.release();
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({
            success: true,
            data: products[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const [categories] = await conn.query('SELECT * FROM categories ORDER BY name ASC');
        conn.release();
        
        res.json({
            success: true,
            data: categories,
            count: categories.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add product (Admin)
exports.addProduct = async (req, res) => {
    try {
        const { categoryId, name, description, weight, karat, price, imageUrl } = req.body;
        
        if (!categoryId || !name || !weight || !karat || !price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const productId = uuidv4();
        const conn = await pool.getConnection();
        
        await conn.query(
            `INSERT INTO products (id, category_id, name, description, weight, karat, price, image_url, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [productId, categoryId, name, description || '', weight, karat, price, imageUrl || '']
        );
        conn.release();
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { id: productId }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update product (Admin)
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, weight, karat, price, imageUrl, status } = req.body;
        
        const conn = await pool.getConnection();
        
        await conn.query(
            `UPDATE products 
             SET name = ?, description = ?, weight = ?, karat = ?, price = ?, image_url = ?, status = ?
             WHERE id = ?`,
            [name, description || '', weight, karat, price, imageUrl || '', status || 'active', id]
        );
        conn.release();
        
        res.json({
            success: true,
            message: 'Product updated successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete product (Admin)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const conn = await pool.getConnection();
        
        await conn.query('DELETE FROM products WHERE id = ?', [id]);
        conn.release();
        
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
