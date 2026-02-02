// src/models/index.js
// ============================================================
// Central model registry + association definitions
// Import all models here, define their relationships, export them.
// This keeps FK/association logic in ONE place.
// ============================================================

const User       = require("./User");
const Course     = require("./Course");
const Lesson     = require("./Lesson");
const Enrollment = require("./Enrollment");
const Progress   = require("./Progress");

// ── Associations (Foreign Keys) ──────────────────────────────
// A Teacher (User) can create many Courses
User.hasMany(Course, { foreignKey: "teacherId", as: "courses" });
Course.belongsTo(User, { foreignKey: "teacherId", as: "teacher" });

// A Course has many Lessons
Course.hasMany(Lesson, { foreignKey: "courseId", as: "lessons" });
Lesson.belongsTo(Course, { foreignKey: "courseId", as: "course" });

// A Student (User) can have many Enrollments
User.hasMany(Enrollment, { foreignKey: "studentId", as: "enrollments" });
Enrollment.belongsTo(User, { foreignKey: "studentId", as: "student" });

// A Course can have many Enrollments
Course.hasMany(Enrollment, { foreignKey: "courseId", as: "enrollments" });
Enrollment.belongsTo(Course, { foreignKey: "courseId", as: "course" });

// A Student (User) has many Progress records
User.hasMany(Progress, { foreignKey: "studentId", as: "progress" });
Progress.belongsTo(User, { foreignKey: "studentId", as: "student" });

// A Lesson has many Progress records (one per student)
Lesson.hasMany(Progress, { foreignKey: "lessonId", as: "progress" });
Progress.belongsTo(Lesson, { foreignKey: "lessonId", as: "lesson" });

// ── Export all models ────────────────────────────────────────
module.exports = {
  User,
  Course,
  Lesson,
  Enrollment,
  Progress
};
