// src/controllers/courseController.js
// ============================================================
// Course Controller — CRUD operations for courses
// Teachers can create/update/delete only THEIR OWN courses.
// Students can browse published courses.
// ============================================================

const { Course, Lesson, User, Enrollment } = require("../models");

// ── CREATE COURSE ────────────────────────────────────────────
// POST /api/courses
// Only teachers can create courses.
const createCourse = async (req, res) => {
  try {
    const { title, description, subject, gradeLevel, coverImage } = req.body;

    if (!title || !subject || !gradeLevel) {
      return res.status(400).json({ message: "Title, subject, and gradeLevel are required." });
    }

    const course = await Course.create({
      title,
      description,
      subject,
      gradeLevel,
      coverImage,
      teacherId: req.user.id,  // the authenticated teacher
      isPublished: false        // drafts are not published by default
    });

    res.status(201).json({ message: "Course created", course });
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET ALL PUBLISHED COURSES (for students) ────────────────
// GET /api/courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { isPublished: true },
      include: [
        { model: User, as: "teacher", attributes: ["name", "email"] }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({ courses });
  } catch (err) {
    console.error("Get courses error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET SINGLE COURSE ────────────────────────────────────────
// GET /api/courses/:id
const getCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User, as: "teacher", attributes: ["name"] },
        { model: Lesson, as: "lessons", order: [["order", "ASC"]] }
      ]
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    res.status(200).json({ course });
  } catch (err) {
    console.error("Get course error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── UPDATE COURSE ────────────────────────────────────────────
// PUT /api/courses/:id
// Only the course's teacher can update it.
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Ownership check
    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own courses." });
    }

    const { title, description, subject, gradeLevel, coverImage, isPublished } = req.body;

    await course.update({
      title:        title        ?? course.title,
      description:  description  ?? course.description,
      subject:      subject      ?? course.subject,
      gradeLevel:   gradeLevel   ?? course.gradeLevel,
      coverImage:   coverImage   ?? course.coverImage,
      isPublished:  isPublished  ?? course.isPublished
    });

    res.status(200).json({ message: "Course updated", course });
  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── DELETE COURSE ────────────────────────────────────────────
// DELETE /api/courses/:id
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own courses." });
    }

    // Cascade: delete lessons, enrollments linked to this course
    await Lesson.destroy({ where: { courseId: course.id } });
    await Enrollment.destroy({ where: { courseId: course.id } });
    await course.destroy();

    res.status(200).json({ message: "Course deleted successfully." });
  } catch (err) {
    console.error("Delete course error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse
};
