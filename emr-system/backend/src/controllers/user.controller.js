import { query } from '../config/database.js';
import bcrypt from 'bcrypt';
import config from '../config/index.js';

/**
 * Get all users with pagination and filtering
 * GET /api/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build dynamic query based on filters
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (role) {
      whereConditions.push(`role = $${paramIndex}`);
      queryParams.push(role);
      paramIndex++;
    }

    if (isActive !== undefined) {
      whereConditions.push(`is_active = $${paramIndex}`);
      queryParams.push(isActive === 'true');
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get users
    const usersQuery = `
      SELECT id, name, email, role, phone, specialization, license_number, 
             is_active, last_login, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(parseInt(limit), offset);
    const usersResult = await query(usersQuery, queryParams);

    res.status(200).json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, name, email, role, phone, address, specialization, 
              license_number, is_active, last_login, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

/**
 * Update user
 * PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, email, phone, address, specialization, 
      licenseNumber, isActive 
    } = req.body;

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE id = $1', [id]);
    
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check email uniqueness if email is being updated
    if (email) {
      const emailExists = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), id]
      );

      if (emailExists.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Build update fields dynamically
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (name) {
      updateFields.push(`name = $${paramIndex}`);
      updateValues.push(name);
      paramIndex++;
    }

    if (email) {
      updateFields.push(`email = $${paramIndex}`);
      updateValues.push(email.toLowerCase());
      paramIndex++;
    }

    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex}`);
      updateValues.push(phone);
      paramIndex++;
    }

    if (address !== undefined) {
      updateFields.push(`address = $${paramIndex}`);
      updateValues.push(address);
      paramIndex++;
    }

    if (specialization !== undefined) {
      updateFields.push(`specialization = $${paramIndex}`);
      updateValues.push(specialization);
      paramIndex++;
    }

    if (licenseNumber !== undefined) {
      updateFields.push(`license_number = $${paramIndex}`);
      updateValues.push(licenseNumber);
      paramIndex++;
    }

    if (isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`);
      updateValues.push(isActive);
      paramIndex++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, role, phone, specialization, license_number, is_active
    `;

    const result = await query(updateQuery, updateValues);

    // Log audit
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        req.user.id,
        'UPDATE',
        'User',
        id,
        JSON.stringify(req.body),
        req.ip,
        req.get('user-agent')
      ]
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

/**
 * Delete user (soft delete by deactivating)
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE id = $1', [id]);
    
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete by deactivating
    await query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user.id,
        'DELETE',
        'User',
        id,
        req.ip,
        req.get('user-agent')
      ]
    );

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

/**
 * Get doctors list (for appointments, etc.)
 * GET /api/users/doctors
 */
export const getDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;

    let queryText = `
      SELECT id, name, email, specialization, license_number, phone
      FROM users
      WHERE role = 'Doctor' AND is_active = true
    `;

    const queryParams = [];

    if (specialization) {
      queryText += ' AND specialization = $1';
      queryParams.push(specialization);
    }

    queryText += ' ORDER BY name ASC';

    const result = await query(queryText, queryParams);

    res.status(200).json({
      success: true,
      data: {
        doctors: result.rows
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors'
    });
  }
};

/**
 * Get statistics for admin dashboard
 * GET /api/users/stats
 */
export const getUserStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE role = 'Doctor') as doctor_count,
        COUNT(*) FILTER (WHERE role = 'Nurse') as nurse_count,
        COUNT(*) FILTER (WHERE role = 'FrontDesk') as front_desk_count,
        COUNT(*) FILTER (WHERE role = 'LabTechnician') as lab_tech_count,
        COUNT(*) FILTER (WHERE role = 'Pharmacist') as pharmacist_count,
        COUNT(*) FILTER (WHERE is_active = true) as active_users,
        COUNT(*) FILTER (WHERE is_active = false) as inactive_users,
        COUNT(*) as total_users
      FROM users
    `);

    res.status(200).json({
      success: true,
      data: {
        stats: stats.rows[0]
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

export default {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDoctors,
  getUserStats
};
