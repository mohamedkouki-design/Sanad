// src/models/Lesson.js
// ============================================================
// Lesson model — belongs to a Course
// Each lesson has a title, text content, and an order number
// so lessons can be sequenced within a course.
// ============================================================

const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Lesson = sequelize.define("Lesson", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false
    // Foreign key set via association
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  // The main text content of the lesson
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  // AI-generated summary (populated on demand via OpenAI)
  aiSummary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Display order inside the course (1, 2, 3, ...)
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  // Estimated reading time in minutes
  estimatedMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  // XP reward for completing this lesson
  xpReward: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  }
}, {
  tableName: "lessons",
  timestamps: true
});

module.exports = Lesson;
