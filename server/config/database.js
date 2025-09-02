const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

class DatabaseConfig {
  constructor() {
    this.pool = null;
    this.initializePool();
  }

  initializePool() {
    try {
      // Check for required environment variables
      if (!process.env.DB_PASSWORD) {
        throw new Error('DB_PASSWORD environment variable is required. Please create a .env file with your database credentials.');
      }

      // Read SSL certificate
      const sslCert = fs.readFileSync(path.join(__dirname, '../../certs/rds-combined-ca-bundle.pem'));
      
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'db-mysql-filflo-do-user-23345121-0.f.db.ondigitalocean.com',
        port: parseInt(process.env.DB_PORT) || 25060,
        user: process.env.DB_USER || 'doadmin',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'defaultdb',
        ssl: {
          ca: sslCert,
          rejectUnauthorized: true
        },
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: false, // Security: prevent SQL injection
        timezone: 'Z'
      });

      console.log('✅ Database pool initialized successfully');
    } catch (error) {
      console.error('❌ Database pool initialization failed:', error);
      throw error;
    }
  }

  async executeQuery(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async executeTransaction(queries) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const results = [];
      for (const { sql, params } of queries) {
        const [rows] = await connection.execute(sql, params);
        results.push(rows);
      }
      
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async testConnection() {
    try {
      const result = await this.executeQuery('SELECT 1 as test');
      return result.length > 0;
    } catch (error) {
      return false;
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('🔌 Database pool closed');
    }
  }
}

module.exports = new DatabaseConfig(); 