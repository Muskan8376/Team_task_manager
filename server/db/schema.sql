-- =============================================
-- Team Task Manager - Database Schema Reference
-- =============================================
-- NOTE: This file is for REFERENCE ONLY.
-- The server auto-creates all tables and seed data on startup
-- via server/config/initDb.js (like Mongoose does in MongoDB).
--
-- You do NOT need to run this file manually.
-- Just start the server with: npm run dev
-- =============================================

-- Tables created automatically:
--   1. users    (id, name, email, password, role, avatar_color, timestamps)
--   2. projects (id, name, description, status, created_by FK, timestamps)
--   3. tasks    (id, title, description, status, priority, due_date, project_id FK, assigned_to FK, created_by FK, timestamps)

-- Seed credentials (created on first run if DB is empty):
--   Admin:  admin@taskmanager.com / admin123
--   Member: john@taskmanager.com  / member123
--   Member: jane@taskmanager.com  / member123
