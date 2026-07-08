const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const pool = require('../config/database');

router.use(authenticate);

// Get all inventory items
router.get('/', authorize(['Admin', 'Pharmacist', 'Doctor']), async (req, res) => {
  try {
    const { low_stock, expiring_soon } = req.query;
    let query = 'SELECT * FROM inventory ORDER BY expiry_date ASC';
    
    if (low_stock === 'true') {
      query = "SELECT * FROM inventory WHERE quantity < reorder_level ORDER BY quantity ASC";
    } else if (expiring_soon === 'true') {
      query = "SELECT * FROM inventory WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days' ORDER BY expiry_date ASC";
    }

    const result = await pool.query(query);
    res.json({ success: true, data: { items: result.rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add new inventory item
router.post('/', authorize(['Admin', 'Pharmacist']), async (req, res) => {
  try {
    const { medicine_name, batch_no, expiry_date, quantity, supplier_id, reorder_level, unit_price } = req.body;
    
    const result = await pool.query(
      `INSERT INTO inventory 
       (medicine_name, batch_no, expiry_date, quantity, supplier_id, reorder_level, unit_price) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [medicine_name, batch_no, expiry_date, quantity, supplier_id || null, reorder_level || 10, unit_price || 0]
    );

    res.status(201).json({ success: true, data: { item: result.rows[0] } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update inventory
router.put('/:id', authorize(['Admin', 'Pharmacist']), async (req, res) => {
  try {
    const { quantity, expiry_date, batch_no } = req.body;
    const result = await pool.query(
      `UPDATE inventory 
       SET quantity = COALESCE($1, quantity),
           expiry_date = COALESCE($2, expiry_date),
           batch_no = COALESCE($3, batch_no)
       WHERE id = $4 
       RETURNING *`,
      [quantity, expiry_date, batch_no, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: { item: result.rows[0] } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dispense medicine (deduct from inventory)
router.post('/:id/dispense', authorize(['Pharmacist', 'Doctor']), async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Valid quantity required' });
    }

    // Check current stock
    const current = await pool.query('SELECT quantity, medicine_name FROM inventory WHERE id = $1', [req.params.id]);
    
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (current.rows[0].quantity < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Available: ${current.rows[0].quantity}` 
      });
    }

    const result = await pool.query(
      `UPDATE inventory 
       SET quantity = quantity - $1 
       WHERE id = $2 
       RETURNING *`,
      [quantity, req.params.id]
    );

    // Log dispensing
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details) 
       VALUES ($1, $2, $3)`,
      [req.user.id, 'MEDICINE_DISPENSED', `Dispensed ${quantity} of ${current.rows[0].medicine_name}`]
    );

    res.json({ 
      success: true, 
      message: 'Medicine dispensed successfully',
      data: { item: result.rows[0] } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete inventory item
router.delete('/:id', authorize(['Admin']), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
