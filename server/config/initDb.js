const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

/**
 * Auto-initializes the MySQL database, tables, and seed data on server startup.
 * Similar to how Mongoose auto-creates collections in MongoDB.
 * 
 * This runs every time the server starts but uses IF NOT EXISTS 
 * so it's safe to run repeatedly — it won't destroy existing data.
 */
async function initializeDatabase() {
  // Step 1: Connect WITHOUT a database to create it if needed
  const rootConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'team_task_manager';

  console.log('🔄 Initializing database...');

  // Create database if it doesn't exist
  await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await rootConnection.end();

  // Step 2: Connect to the actual database and create tables
  const pool = require('./db');

  // =============================================
  // Users Table
  // =============================================
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('Admin', 'Member') NOT NULL DEFAULT 'Member',
      avatar_color VARCHAR(7) DEFAULT '#6366f1',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // =============================================
  // Projects Table
  // =============================================
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      status ENUM('Active', 'On Hold', 'Completed') NOT NULL DEFAULT 'Active',
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // =============================================
  // Tasks Table
  // =============================================
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending',
      priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
      due_date DATE,
      project_id INT NOT NULL,
      assigned_to INT,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // =============================================
  // Seed Data: Only insert if users table is empty
  // This ensures we don't duplicate data on restart
  // =============================================
  const [existingUsers] = await pool.query('SELECT COUNT(*) AS count FROM users');

  if (existingUsers[0].count === 0) {
    console.log('📦 Seeding initial data...');

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const memberPass = await bcrypt.hash('member123', salt);

    // Seed Users
    await pool.query(
      `INSERT INTO users (name, email, password, role, avatar_color) VALUES
        (?, ?, ?, 'Admin', '#6366f1'),
        (?, ?, ?, 'Member', '#ec4899'),
        (?, ?, ?, 'Member', '#14b8a6')`,
      [
        'Admin User', 'admin@taskmanager.com', adminPass,
        'John Doe', 'john@taskmanager.com', memberPass,
        'Jane Smith', 'jane@taskmanager.com', memberPass,
      ]
    );

    // Seed Projects
    await pool.query(
      `INSERT INTO projects (name, description, status, created_by) VALUES
        ('Website Redesign', 'Complete overhaul of the company website with modern design', 'Active', 1),
        ('Mobile App MVP', 'Build the first version of our mobile application', 'Active', 1),
        ('API Integration', 'Integrate third-party APIs for payment and notifications', 'On Hold', 1)`
    );

    // Seed Tasks (some overdue on purpose for dashboard demo)
    await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, project_id, assigned_to, created_by) VALUES
        ('Design Homepage Mockup', 'Create wireframes and high-fidelity mockups for the homepage', 'Completed', 'High', '2026-05-01', 1, 2, 1),
        ('Implement Auth System', 'Build JWT-based authentication with login and registration', 'In Progress', 'Critical', '2026-05-10', 1, 3, 1),
        ('Setup CI/CD Pipeline', 'Configure GitHub Actions for automated testing and deployment', 'Pending', 'Medium', '2026-05-03', 2, 2, 1),
        ('Write API Documentation', 'Document all REST endpoints using Swagger', 'Pending', 'Low', '2026-05-15', 3, NULL, 1),
        ('Database Schema Review', 'Review and optimize the database schema for performance', 'Pending', 'High', '2026-04-28', 2, 3, 1)`
    );

    console.log('✅ Seed data inserted successfully');
    console.log('   📧 Admin: admin@taskmanager.com / admin123');
    console.log('   📧 Member: john@taskmanager.com / member123');
    console.log('   📧 Member: jane@taskmanager.com / member123');
  }

  console.log('✅ Database initialized — all tables ready');
}

module.exports = initializeDatabase;
