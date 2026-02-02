// src/utils/syncDB.js
// ============================================================
// Database Sync Utility
// Run: npm run db:sync
// This file connects to PostgreSQL and creates all tables
// defined in the models. In development, use { force: true }
// to drop and recreate tables (WARNING: deletes all data).
// In production, use a proper migration tool like Sequelize CLI.
// ============================================================

require("dotenv").config();
const sequelize = require("./database");
require("../models"); // This registers all models with sequelize

const sync = async () => {
  try {
    console.log("🔄 Syncing database...");

    // force: true → drops tables first (DEV ONLY!)
    // alter: true → tries to alter tables to match models (safer but slower)
    // force: false → only creates tables if they don't exist
    const forceSync = process.env.NODE_ENV === "development";

    await sequelize.sync({ force: forceSync });

    console.log("✅ Database synced successfully!");
    console.log(`   Mode: ${forceSync ? "FORCE (tables recreated)" : "SAFE (tables preserved)"}`);
    console.log(`   DB:   ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Database sync failed:", err.message);
    process.exit(1);
  }
};

sync();
