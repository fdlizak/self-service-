const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

// Create order
exports.createOrder = async (req, res) => {
    try {
        const { customerName, customerPhone, items } = req.body;
        
        if (!customerName || !items || items.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const customerId = uuidv4();
        const orderId = uuidv4();
        const queueNumber = await generateQueueNumber();
        
        let totalPrice = 0;
        for (const item of items) {
            totalPrice += item.price * item.quantity;
        }
        
        const conn = await pool.getConnection();
        
        try {
            await conn.beginTransaction();
            
            // Insert customer
            await conn.query(
                `INSERT INTO customers (id, name, phone) VALUES (?, ?, ?)`,
                [customerId, customerName, customerPhone || null]
            );
            
            // Generate QR Code
            const qrData = JSON.stringify({
                orderId,
                queueNumber,
                customerName,
                timestamp: new Date().toISOString()
            });
            const qrCode = await QRCode.toDataURL(qrData);
            
            // Insert order
            await conn.query(
                `INSERT INTO orders (id, customer_id, queue_number, order_items, total_price, qr_code)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, customerId, queueNumber, JSON.stringify(items), totalPrice, qrCode]
            );
            
            // Insert queue
            const queueId = uuidv4();
            const [queueResult] = await conn.query(
                `SELECT COUNT(*) as count FROM queue WHERE status IN ('waiting', 'calling', 'processing')`
            );
            const position = queueResult[0].count + 1;
            
            await conn.query(
                `INSERT INTO queue (id, order_id, queue_number, position, status)
                 VALUES (?, ?, ?, ?, 'waiting')`,
                [queueId, orderId, queueNumber, position]
            );
            
            await conn.commit();
            
            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: {
                    orderId,
                    queueNumber,
                    totalPrice,
                    qrCode
                }
            });
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const conn = await pool.getConnection();
        
        const [orders] = await conn.query(
            `SELECT o.*, c.name, c.phone
             FROM orders o
             JOIN customers c ON o.customer_id = c.id
             WHERE o.id = ?`,
            [id]
        );
        conn.release();
        
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = orders[0];
        order.order_items = JSON.parse(order.order_items);
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get order by queue number
exports.getOrderByQueueNumber = async (req, res) => {
    try {
        const { queueNumber } = req.params;
        const conn = await pool.getConnection();
        
        const [orders] = await conn.query(
            `SELECT o.*, c.name, c.phone
             FROM orders o
             JOIN customers c ON o.customer_id = c.id
             WHERE o.queue_number = ?`,
            [queueNumber]
        );
        conn.release();
        
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = orders[0];
        order.order_items = JSON.parse(order.order_items);
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generate queue number
async function generateQueueNumber() {
    const conn = await pool.getConnection();
    
    const [result] = await conn.query(
        `SELECT MAX(CAST(SUBSTRING(queue_number, 2) AS UNSIGNED)) as maxNum FROM orders WHERE queue_number LIKE 'A%'`
    );
    conn.release();
    
    const maxNum = result[0].maxNum || 0;
    const nextNum = maxNum + 1;
    return 'A' + String(nextNum).padStart(3, '0');
}

module.exports.generateQueueNumber = generateQueueNumber;
