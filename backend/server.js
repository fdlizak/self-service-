const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Static files
app.use(express.static('../frontend'));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════╗
    ║  🏆 EMAS KIOSK SERVER              ║
    ║  Self-Service Ordering System      ║
    ╚════════════════════════════════════╝
    
    🚀 Server running on http://localhost:${PORT}
    📚 API Documentation: http://localhost:${PORT}/api-docs
    🔧 Health check: http://localhost:${PORT}/health
    `);
});

module.exports = app;
