const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all queue
exports.getQueue = async (req, res) => {
    try {
        const conn = await pool.getConnection();
        
        const [queue] = await conn.query(
            `SELECT q.*, o.customer_id
             FROM queue q
             JOIN orders o ON q.order_id = o.id
             WHERE q.status IN ('waiting', 'calling', 'processing')
             ORDER BY q.position ASC`
        );
        conn.release();
        
        res.json({
            success: true,
            data: queue,
            count: queue.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get current queue (being called)
exports.getCurrentQueue = async (req, res) => {
    try {
        const conn = await pool.getConnection();
        
        const [queue] = await conn.query(
            `SELECT q.*, o.customer_id
             FROM queue q
             JOIN orders o ON q.order_id = o.id
             WHERE q.status = 'calling'
             LIMIT 1`
        );
        conn.release();
        
        if (queue.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: 'No queue being called'
            });
        }
        
        res.json({
            success: true,
            data: queue[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Call next queue
exports.callNextQueue = async (req, res) => {
    try {
        const conn = await pool.getConnection();
        
        // Update previous calling to processing
        await conn.query(
            `UPDATE queue SET status = 'processing', started_at = NOW()
             WHERE status = 'calling'`
        );
        
        // Get next waiting queue
        const [nextQueue] = await conn.query(
            `SELECT * FROM queue
             WHERE status = 'waiting'
             ORDER BY position ASC
             LIMIT 1`
        );
        conn.release();
        
        if (nextQueue.length === 0) {
            return res.json({
                success: true,
                message: 'No more queue to call',
                data: null
            });
        }
        
        const conn2 = await pool.getConnection();
        await conn2.query(
            `UPDATE queue SET status = 'calling', called_at = NOW()
             WHERE id = ?`,
            [nextQueue[0].id]
        );
        conn2.release();
        
        res.json({
            success: true,
            message: 'Queue called successfully',
            data: nextQueue[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update queue status
exports.updateQueueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['waiting', 'calling', 'processing', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const conn = await pool.getConnection();
        
        const updateData = { status };
        if (status === 'completed') {
            updateData.completed_at = 'NOW()';
        }
        
        await conn.query(
            `UPDATE queue SET status = ?, completed_at = ${status === 'completed' ? 'NOW()' : 'NULL'}
             WHERE id = ?`,
            [status, id]
        );
        
        // Also update order status
        const [queueData] = await conn.query('SELECT order_id FROM queue WHERE id = ?', [id]);
        if (queueData.length > 0) {
            const orderStatus = status === 'completed' ? 'completed' : 'processing';
            await conn.query(
                `UPDATE orders SET status = ?, completed_at = ${status === 'completed' ? 'NOW()' : 'NULL'}
                 WHERE id = ?`,
                [orderStatus, queueData[0].order_id]
            );
        }
        conn.release();
        
        res.json({
            success: true,
            message: 'Queue status updated successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get queue statistics
exports.getQueueStats = async (req, res) => {
    try {
        const conn = await pool.getConnection();
        
        const [stats] = await conn.query(
            `SELECT 
                COUNT(CASE WHEN status = 'waiting' THEN 1 END) as waiting,
                COUNT(CASE WHEN status = 'calling' THEN 1 END) as calling,
                COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(*) as total
             FROM queue
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`
        );
        conn.release();
        
        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
