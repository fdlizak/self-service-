const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create order
router.post('/', orderController.createOrder);

// Get order by ID
router.get('/:id', orderController.getOrderById);

// Get order by queue number
router.get('/queue/:queueNumber', orderController.getOrderByQueueNumber);

module.exports = router;
