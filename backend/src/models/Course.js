// src/models/Course.js
// ============================================================
// Course model — a course belongs to a teacher (User)
// Contains metadata like title, description, subject, level
// ============================================================

const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  subject: {
    // e.g. "Mathematics", "Science", "French", "Arabic"
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // Target grade level (1-12)
  gradeLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 12 }
  },
  // Cover image URL (optional)
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // teacherId is set via association (belongsTo User)
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  // Whether the course is published/visible to students
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "courses",
  timestamps: true
});

module.exports = Course;
