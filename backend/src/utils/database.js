// src/utils/database.js
// ============================================================
// Database connection setup using Sequelize ORM
// Connects to PostgreSQL using credentials from .env
// ============================================================

const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,   // database name
  process.env.DB_USER,   // username
  process.env.DB_PASS,   // password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",  // we are using PostgreSQL
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    // Connection pool settings for performance
    pool: {
      max: 10,       // max open connections
      min: 2,        // min open connections
      acquire: 30000,// max time (ms) to wait for a connection
      idle: 10000    // max time (ms) a connection can sit idle
    }
  }
);

module.exports = sequelize;
