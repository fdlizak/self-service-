const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middleware/auth');

// Admin Login (public)
router.post('/login', adminController.login);

// Protect all routes below
router.use(authMiddleware);

// Get admin statistics
router.get('/stats', adminController.getStats);

// Get all admins
router.get('/users', adminController.getAllAdmins);

// Add admin user
router.post('/users', adminController.addAdmin);

// Get activity logs
router.get('/logs', adminController.getActivityLogs);

// Product Management
router.post('/products', productController.addProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

module.exports = router;
