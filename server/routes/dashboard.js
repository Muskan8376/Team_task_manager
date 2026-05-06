const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// =============================================
// GET /api/dashboard/stats - Dashboard Analytics
// Returns: total, completed, pending, in-progress, overdue counts
// =============================================
router.get('/stats', async (req, res) => {
  try {
    // Total tasks
    const [totalResult] = await pool.query('SELECT COUNT(*) AS total FROM tasks');
    
    // Completed tasks
    const [completedResult] = await pool.query(
      "SELECT COUNT(*) AS completed FROM tasks WHERE status = 'Completed'"
    );

    // Pending tasks
    const [pendingResult] = await pool.query(
      "SELECT COUNT(*) AS pending FROM tasks WHERE status = 'Pending'"
    );

    // In Progress tasks
    const [inProgressResult] = await pool.query(
      "SELECT COUNT(*) AS in_progress FROM tasks WHERE status = 'In Progress'"
    );

    // =============================================
    // OVERDUE TASKS: due_date < CURRENT_DATE AND status != 'Completed'
    // =============================================
    const [overdueResult] = await pool.query(
      "SELECT COUNT(*) AS overdue FROM tasks WHERE due_date < CURDATE() AND status != 'Completed'"
    );

    // Overdue task details
    const [overdueTasks] = await pool.query(
      `SELECT t.id, t.title, t.due_date, t.status, t.priority,
              u.name AS assigned_to_name, u.avatar_color AS assigned_to_color,
              p.name AS project_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.due_date < CURDATE() AND t.status != 'Completed'
       ORDER BY t.due_date ASC`
    );

    // Tasks by priority
    const [priorityStats] = await pool.query(
      `SELECT priority, COUNT(*) AS count FROM tasks GROUP BY priority`
    );

    // Recent tasks (last 5)
    const [recentTasks] = await pool.query(
      `SELECT t.id, t.title, t.status, t.priority, t.due_date, t.created_at,
              u.name AS assigned_to_name, u.avatar_color AS assigned_to_color,
              p.name AS project_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN projects p ON t.project_id = p.id
       ORDER BY t.created_at DESC
       LIMIT 5`
    );

    // Project stats
    const [projectStats] = await pool.query(
      `SELECT p.id, p.name, p.status,
              COUNT(t.id) AS task_count,
              SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completed_count
       FROM projects p
       LEFT JOIN tasks t ON t.project_id = p.id
       GROUP BY p.id, p.name, p.status`
    );

    res.json({
      success: true,
      stats: {
        total: totalResult[0].total,
        completed: completedResult[0].completed,
        pending: pendingResult[0].pending,
        in_progress: inProgressResult[0].in_progress,
        overdue: overdueResult[0].overdue,
        overdue_tasks: overdueTasks,
        priority_breakdown: priorityStats,
        recent_tasks: recentTasks,
        project_stats: projectStats
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats.' });
  }
});

module.exports = router;
