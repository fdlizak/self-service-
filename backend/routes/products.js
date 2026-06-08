const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products
router.get('/', productController.getAllProducts);

// Get products by category
router.get('/category/:category', productController.getProductsByCategory);

// Get product by ID
router.get('/:id', productController.getProductById);

module.exports = router;
