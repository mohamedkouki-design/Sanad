// src/models/User.js
// ============================================================
// User model — stores students and teachers
// role: 'student' | 'teacher' | 'admin'
// ============================================================

const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { len: [2, 100] }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM("student", "teacher", "admin"),
    defaultValue: "student",
    allowNull: false
  },
  // Gamification fields
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  // Language preference: fr, ar, en
  language: {
    type: DataTypes.STRING(5),
    defaultValue: "fr"
  },
  // For JWT refresh token rotation
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "users",
  timestamps: true  // adds createdAt, updatedAt automatically
});

module.exports = User;
