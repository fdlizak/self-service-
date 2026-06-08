const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

// Get all queue
router.get('/', queueController.getQueue);

// Get current queue
router.get('/current', queueController.getCurrentQueue);

// Call next queue
router.post('/call-next', queueController.callNextQueue);

// Update queue status
router.put('/:id/status', queueController.updateQueueStatus);

// Get queue statistics
router.get('/stats', queueController.getQueueStats);

module.exports = router;
