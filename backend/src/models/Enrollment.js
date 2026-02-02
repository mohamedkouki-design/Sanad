// src/models/Enrollment.js
// ============================================================
// Enrollment model — tracks which student enrolled in which course
// This is the "join table" between Users (students) and Courses.
// ============================================================

const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Enrollment = sequelize.define("Enrollment", {
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
  courseId: {
    type: DataTypes.UUID,
    allowNull: false
    // FK → courses.id
  },
  // Track overall status of this enrollment
  status: {
    type: DataTypes.ENUM("active", "completed", "dropped"),
    defaultValue: "active"
  },
  // Date the student enrolled
  enrolledAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "enrollments",
  timestamps: true,
  // Prevent duplicate enrollments (same student + same course)
  indexes: [
    {
      unique: true,
      fields: ["studentId", "courseId"]
    }
  ]
});

module.exports = Enrollment;
