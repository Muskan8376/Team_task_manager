const express = require('express');
const pool = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// =============================================
// GET /api/tasks - Get all tasks (with filters)
// =============================================
router.get('/', async (req, res) => {
  try {
    const { status, priority, project_id, assigned_to, overdue } = req.query;

    let query = `
      SELECT t.*, 
             u.name AS assigned_to_name, 
             u.avatar_color AS assigned_to_color,
             p.name AS project_name,
             c.name AS created_by_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by status
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    // Filter by priority
    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    // Filter by project
    if (project_id) {
      query += ' AND t.project_id = ?';
      params.push(parseInt(project_id));
    }

    // Filter by assigned user
    if (assigned_to) {
      query += ' AND t.assigned_to = ?';
      params.push(parseInt(assigned_to));
    }

    // =============================================
    // OVERDUE FILTER: due_date < CURRENT_DATE AND status != 'Completed'
    // =============================================
    if (overdue === 'true') {
      query += ' AND t.due_date < CURDATE() AND t.status != ?';
      params.push('Completed');
    }

    query += ' ORDER BY t.created_at DESC';

    const [tasks] = await pool.query(query, params);

    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tasks.' });
  }
});

// =============================================
// GET /api/tasks/:id - Get single task
// =============================================
router.get('/:id', async (req, res) => {
  try {
    const [tasks] = await pool.query(
      `SELECT t.*, 
              u.name AS assigned_to_name, 
              u.avatar_color AS assigned_to_color,
              p.name AS project_name,
              c.name AS created_by_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN users c ON t.created_by = c.id
       WHERE t.id = ?`,
      [req.params.id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.json({ success: true, task: tasks[0] });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// =============================================
// POST /api/tasks - Create a new task (Admin only)
// =============================================
router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, description, status, priority, due_date, project_id, assigned_to } = req.body;

    if (!title || !project_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and project_id are required.' 
      });
    }

    const [result] = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, project_id, assigned_to, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        status || 'Pending',
        priority || 'Medium',
        due_date || null,
        project_id,
        assigned_to || null,
        req.user.id
      ]
    );

    // Fetch the created task with joins
    const [tasks] = await pool.query(
      `SELECT t.*, 
              u.name AS assigned_to_name,
              u.avatar_color AS assigned_to_color,
              p.name AS project_name,
              c.name AS created_by_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN users c ON t.created_by = c.id
       WHERE t.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, message: 'Task created.', task: tasks[0] });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Server error creating task.' });
  }
});

// =============================================
// PUT /api/tasks/:id - Update a task
// =============================================
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, due_date, project_id, assigned_to } = req.body;

    // Only Admin can reassign tasks
    if (assigned_to !== undefined && req.user.role !== 'Admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only Admins can assign tasks to users.' 
      });
    }

    const fields = [];
    const params = [];

    if (title) { fields.push('title = ?'); params.push(title); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (status) { fields.push('status = ?'); params.push(status); }
    if (priority) { fields.push('priority = ?'); params.push(priority); }
    if (due_date !== undefined) { fields.push('due_date = ?'); params.push(due_date || null); }
    if (project_id) { fields.push('project_id = ?'); params.push(project_id); }
    if (assigned_to !== undefined) { fields.push('assigned_to = ?'); params.push(assigned_to || null); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    params.push(req.params.id);
    await pool.query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, params);

    // Fetch updated task
    const [tasks] = await pool.query(
      `SELECT t.*, 
              u.name AS assigned_to_name,
              u.avatar_color AS assigned_to_color,
              p.name AS project_name,
              c.name AS created_by_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN users c ON t.created_by = c.id
       WHERE t.id = ?`,
      [req.params.id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.json({ success: true, message: 'Task updated.', task: tasks[0] });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Server error updating task.' });
  }
});

// =============================================
// DELETE /api/tasks/:id - Delete a task (Admin only)
// =============================================
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.json({ success: true, message: 'Task deleted.' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting task.' });
  }
});

module.exports = router;
