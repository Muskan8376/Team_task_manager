const express = require('express');
const pool = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

// =============================================
// GET /api/projects - Get all projects
// =============================================
router.get('/', async (req, res) => {
  try {
    const [projects] = await pool.query(
      `SELECT p.*, 
              u.name AS created_by_name,
              (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) AS task_count,
              (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'Completed') AS completed_count
       FROM projects p
       LEFT JOIN users u ON p.created_by = u.id
       ORDER BY p.created_at DESC`
    );

    res.json({ success: true, projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// =============================================
// GET /api/projects/:id - Get single project with tasks
// =============================================
router.get('/:id', async (req, res) => {
  try {
    const [projects] = await pool.query(
      `SELECT p.*, u.name AS created_by_name 
       FROM projects p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const [tasks] = await pool.query(
      `SELECT t.*, u.name AS assigned_to_name, u.avatar_color AS assigned_to_color
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = ?
       ORDER BY t.created_at DESC`,
      [req.params.id]
    );

    res.json({ success: true, project: { ...projects[0], tasks } });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// =============================================
// POST /api/projects - Create project (Admin only)
// =============================================
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO projects (name, description, status, created_by) VALUES (?, ?, ?, ?)',
      [name, description || null, status || 'Active', req.user.id]
    );

    const [projects] = await pool.query(
      `SELECT p.*, u.name AS created_by_name 
       FROM projects p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, message: 'Project created.', project: projects[0] });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// =============================================
// PUT /api/projects/:id - Update project (Admin only)
// =============================================
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const fields = [];
    const params = [];

    if (name) { fields.push('name = ?'); params.push(name); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (status) { fields.push('status = ?'); params.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    params.push(req.params.id);
    await pool.query(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, params);

    const [projects] = await pool.query(
      `SELECT p.*, u.name AS created_by_name 
       FROM projects p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.id = ?`,
      [req.params.id]
    );

    res.json({ success: true, message: 'Project updated.', project: projects[0] });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// =============================================
// DELETE /api/projects/:id - Delete project (Admin only)
// =============================================
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.json({ success: true, message: 'Project deleted.' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
