const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./cpd_tracker.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite database');
});

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    profession TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS cpd_activities (
    id TEXT PRIMARY KEY,
    staff_id TEXT NOT NULL,
    activity_name TEXT NOT NULL,
    points REAL NOT NULL,
    category TEXT NOT NULL,
    date_completed DATETIME NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(staff_id) REFERENCES staff(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS cpd_targets (
    id TEXT PRIMARY KEY,
    staff_id TEXT NOT NULL,
    target_points REAL NOT NULL,
    period TEXT NOT NULL,
    year INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(staff_id) REFERENCES staff(id)
  )`);
});

// API Endpoints

// Get all staff
app.get('/api/staff', (req, res) => {
  db.all('SELECT * FROM staff ORDER BY name', [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// Add new staff member
app.post('/api/staff', (req, res) => {
  const { name, email, profession } = req.body;
  const id = uuidv4();
  db.run('INSERT INTO staff (id, name, email, profession) VALUES (?, ?, ?, ?)',
    [id, name, email, profession],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else {
        const newStaff = { id, name, email, profession };
        io.emit('staff-added', newStaff);
        res.status(201).json(newStaff);
      }
    });
});

// Get staff CPD points
app.get('/api/staff/:staffId/cpd', (req, res) => {
  const { staffId } = req.params;
  db.all(
    'SELECT * FROM cpd_activities WHERE staff_id = ? ORDER BY date_completed DESC',
    [staffId],
    (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(rows);
    }
  );
});

// Add CPD activity
app.post('/api/cpd-activity', (req, res) => {
  const { staff_id, activity_name, points, category, date_completed, description } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO cpd_activities (id, staff_id, activity_name, points, category, date_completed, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, staff_id, activity_name, points, category, date_completed, description],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else {
        const newActivity = { id, staff_id, activity_name, points, category, date_completed, description };
        io.emit('cpd-activity-added', newActivity);
        io.emit('dashboard-update', { type: 'activity-added', staff_id });
        res.status(201).json(newActivity);
      }
    }
  );
});

// Get CPD summary for staff
app.get('/api/staff/:staffId/summary', (req, res) => {
  const { staffId } = req.params;
  
  db.get(
    `SELECT 
      SUM(points) as total_points,
      COUNT(*) as activity_count,
      MAX(date_completed) as last_activity
    FROM cpd_activities 
    WHERE staff_id = ?`,
    [staffId],
    (err, row) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(row || { total_points: 0, activity_count: 0, last_activity: null });
    }
  );
});

// Get all staff summaries
app.get('/api/dashboard/summary', (req, res) => {
  db.all(
    `SELECT 
      s.id,
      s.name,
      s.profession,
      COALESCE(SUM(ca.points), 0) as total_points,
      COUNT(ca.id) as activity_count,
      MAX(ca.date_completed) as last_activity
    FROM staff s
    LEFT JOIN cpd_activities ca ON s.id = ca.staff_id
    GROUP BY s.id
    ORDER BY total_points DESC`,
    [],
    (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(rows);
    }
  );
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('request-dashboard-update', () => {
    db.all(
      `SELECT 
        s.id,
        s.name,
        s.profession,
        COALESCE(SUM(ca.points), 0) as total_points,
        COUNT(ca.id) as activity_count,
        MAX(ca.date_completed) as last_activity
      FROM staff s
      LEFT JOIN cpd_activities ca ON s.id = ca.staff_id
      GROUP BY s.id
      ORDER BY total_points DESC`,
      [],
      (err, rows) => {
        if (!err) {
          socket.emit('dashboard-data', rows);
        }
      }
    );
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`CPD Dashboard server running on http://localhost:${PORT}`);
});
