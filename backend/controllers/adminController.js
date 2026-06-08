const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

// Admin Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const conn = await pool.getConnection();
    const [users] = await conn.query('SELECT * FROM admin_users WHERE username = ? AND status = "active"', [username]);
    conn.release();

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];


    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
}

    // Update last login
    const conn2 = await pool.getConnection();
    await conn2.query("UPDATE admin_users SET last_login = NOW() WHERE id = ?", [user.id]);
    conn2.release();

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all admin users
exports.getAllAdmins = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [admins] = await conn.query("SELECT id, username, full_name, email, role, status, last_login FROM admin_users");
    conn.release();

    res.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add admin user
exports.addAdmin = async (req, res) => {
  try {
    const { username, password, fullName, email, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const conn = await pool.getConnection();

    // Check if username exists
    const [existing] = await conn.query("SELECT id FROM admin_users WHERE username = ?", [username]);

    if (existing.length > 0) {
      conn.release();
      return res.status(400).json({ error: "Username already exists" });
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    await conn.query(
      `INSERT INTO admin_users (id, username, password_hash, full_name, email, role, status)
             VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [userId, username, passwordHash, fullName || "", email || "", role || "staff"],
    );
    conn.release();

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      data: { id: userId },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get admin statistics
exports.getStats = async (req, res) => {
  try {
    const conn = await pool.getConnection();

    // Orders today
    const [ordersToday] = await conn.query(
      `SELECT COUNT(*) as count, SUM(total_price) as revenue
             FROM orders WHERE DATE(created_at) = CURDATE()`,
    );

    // Queue waiting
    const [queueWaiting] = await conn.query(`SELECT COUNT(*) as count FROM queue WHERE status = 'waiting'`);

    // Queue completed today
    const [queueCompleted] = await conn.query(
      `SELECT COUNT(*) as count FROM queue 
             WHERE status = 'completed' AND DATE(completed_at) = CURDATE()`,
    );

    conn.release();

    res.json({
      success: true,
      data: {
        ordersToday: ordersToday[0].count,
        revenueToday: ordersToday[0].revenue || 0,
        queueWaiting: queueWaiting[0].count,
        queueCompleted: queueCompleted[0].count,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const conn = await pool.getConnection();
    const [logs] = await conn.query(
      `SELECT al.*, au.username 
             FROM activity_logs al
             LEFT JOIN admin_users au ON al.admin_user_id = au.id
             ORDER BY al.created_at DESC
             LIMIT ?`,
      [parseInt(limit)],
    );
    conn.release();

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Log activity
exports.logActivity = async (adminUserId, action, entityType, entityId, description) => {
  try {
    const conn = await pool.getConnection();
    const logId = uuidv4();

    await conn.query(
      `INSERT INTO activity_logs (id, admin_user_id, action, entity_type, entity_id, description)
             VALUES (?, ?, ?, ?, ?, ?)`,
      [logId, adminUserId || null, action, entityType || null, entityId || null, description || ""],
    );
    conn.release();
  } catch (error) {
    console.error("Error logging activity:", error.message);
  }
};
