// src/models/Progress.js
// ============================================================
// Progress model — tracks a student's completion of each lesson
// One row per (student, lesson) pair.
// Stores whether it's completed and how much XP was earned.
// ============================================================

const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Progress = sequelize.define("Progress", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false
    // FK → users.id
  },
  lessonId: {
    type: DataTypes.UUID,
    allowNull: false
    // FK → lessons.id
  },
  // Has the student completed this lesson?
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // XP earned from this lesson (0 if not completed)
  xpEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // When the student first started this lesson
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // When the student completed this lesson (null if not done)
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "progress",
  timestamps: true,
  // Only one progress record per student per lesson
  indexes: [
    {
      unique: true,
      fields: ["studentId", "lessonId"]
    }
  ]
});

module.exports = Progress;
