# Team Task Manager

A full-stack project management application built with **React, Node.js, Express, and MySQL**. 

This application demonstrates modern web development practices, including Role-Based Access Control (RBAC), secure REST API design, and dynamic database provisioning.

---

## 🏗️ System Architecture

The project is built on a decoupled, three-tier architecture:

### 1. Presentation Layer (Frontend)
- **Framework:** React.js + Vite
- **Styling:** Tailwind CSS (Custom Design System & Global Theme Engine)
- **State Management:** React Context API for Auth and Light/Dark Mode
- **Routing:** React Router DOM (with protected Admin/Member routes)

### 2. Application Layer (Backend API)
- **Framework:** Node.js + Express.js
- **Authentication:** JSON Web Tokens (JWT) for stateless session management
- **Security:** Bcrypt.js for password hashing and Express middleware for RBAC routing
- **Design:** RESTful architecture for predictable client-server communication

### 3. Data Layer (Database)
- **Engine:** MySQL (Relational)
- **Driver:** `mysql2/promise` for asynchronous connection pooling
- **Automation:** Programmatic initialization via `initDb.js` (auto-generates tables and seeds data on startup)

---

## 🗄️ Database Schema

The relational database strictly enforces data integrity using `ON DELETE CASCADE` and `ON DELETE SET NULL`.

- **Users:** Stores `id`, `name`, `email`, `password` (hashed), and `role` (Admin/Member).
- **Projects:** Stores `id`, `name`, `status`, and `created_by` (Foreign Key -> Users).
- **Tasks:** Stores `id`, `title`, `status`, `priority`, `due_date`, `project_id` (Foreign Key), and `assigned_to` (Foreign Key).

---

## 🧠 Key Technical Decisions

When discussing this project in an interview, these are the core engineering decisions made to ensure scalability and reliability:

1. **Auto-Initializing Database Scripts:**
   Rather than relying on manual `.sql` file imports, the server runs an `IF NOT EXISTS` startup script. This solves the "works on my machine" problem and allows any developer to run the project instantly.

2. **Hardened Registration Flow:**
   To prevent privilege escalation, the `/api/auth/register` endpoint ignores client-provided roles and strictly hardcodes all new public signups as `Member`.

3. **Stateless Authentication (JWT):**
   Using JWTs removes the need for server-side memory to store session cookies. This makes the API purely stateless, easier to scale, and avoids cross-origin (CORS) cookie complexity.

4. **Dynamic CSS Variables for Theming:**
   Instead of appending Tailwind `dark:` utility classes to every single component, the app utilizes a global CSS variable engine. Toggling the theme instantly swaps the underlying RGB color tokens across the entire application.

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL Server running locally on port 3306

### Step 1: Start the Backend (API & Database)
1. Navigate to the `server` folder
2. Install dependencies: `npm install`
3. Configure the `.env` file with your MySQL credentials:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=team_task_manager
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server: `npm run dev`
*(The server will automatically detect an empty database, build all necessary tables, and seed the demo data).*

### Step 2: Start the Frontend (Client)
1. Navigate to the `client` folder
2. Install dependencies: `npm install`
3. Start the application: `npm run dev`

---

## 🧪 Demo Credentials

The backend automatically creates the following test accounts on the first run:

**Admin Account** (Has access to create projects and assign tasks)
- **Email:** `admin@taskmanager.com`
- **Password:** `admin123`

**Member Account** (Standard user access)
- **Email:** `john@taskmanager.com`
- **Password:** `member123`
