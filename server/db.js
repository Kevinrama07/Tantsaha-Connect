import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'tantsaha',
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONN_LIMIT || 10),
});

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function getConnection() {
  return pool.getConnection();
}

export async function runMigrations() {
  // Create users table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // user_profiles
  await query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      village VARCHAR(255),
      cultures JSON,
      language VARCHAR(10) DEFAULT 'mg',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // favorites
  await query(`
    CREATE TABLE IF NOT EXISTS favorites (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      title VARCHAR(255),
      data JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // journal entries
  await query(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      title VARCHAR(255),
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // settings (per-user)
  await query(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      key_name VARCHAR(255) NOT NULL,
      value JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_setting (user_id, key_name)
    );
  `);

  // alerts (for AlertsPage)
  await query(`
    CREATE TABLE IF NOT EXISTS alerts (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36),
      title VARCHAR(255),
      description TEXT,
      severity VARCHAR(32),
      active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // advice entries (for AdvicePage content authored by admins/users)
  await query(`
    CREATE TABLE IF NOT EXISTS advice_entries (
      id VARCHAR(36) PRIMARY KEY,
      author_id VARCHAR(36),
      title VARCHAR(255),
      body TEXT,
      tags JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // notifications (for in-app notices)
  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      message TEXT,
      \`read\` TINYINT(1) DEFAULT 0,
      meta JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // attachments / media
  await query(`
    CREATE TABLE IF NOT EXISTS attachments (
      id VARCHAR(36) PRIMARY KEY,
      owner_id VARCHAR(36),
      filename VARCHAR(255),
      mime_type VARCHAR(127),
      size BIGINT,
      url VARCHAR(1024),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);
}


export function generateId() {
  return uuidv4();
}
