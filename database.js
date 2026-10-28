const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'jupeb-results.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_number TEXT UNIQUE NOT NULL,
    pin_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    results_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('JUPEB database ready!');

module.exports = db;