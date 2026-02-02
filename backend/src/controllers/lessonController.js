// src/controllers/lessonController.js
// ============================================================
// Lesson Controller — CRUD + AI Summary
// Teachers manage lessons inside their courses.
// The AI summary feature calls OpenAI to auto-summarize content.
// ============================================================

const OpenAI = require("openai");
const { Lesson, Course } = require("../models");
require("dotenv").config();

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── CREATE LESSON ────────────────────────────────────────────
// POST /api/courses/:courseId/lessons
const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, order, estimatedMinutes, xpReward } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    // Verify the course exists and belongs to this teacher
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ message: "You can only add lessons to your own courses." });
    }

    const lesson = await Lesson.create({
      courseId,
      title,
      content,
      order:            order            ?? 1,
      estimatedMinutes: estimatedMinutes ?? 5,
      xpReward:         xpReward         ?? 10
    });

    res.status(201).json({ message: "Lesson created", lesson });
  } catch (err) {
    console.error("Create lesson error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET LESSONS FOR A COURSE ─────────────────────────────────
// GET /api/courses/:courseId/lessons
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { courseId: req.params.courseId },
      order: [["order", "ASC"]]   // sorted by lesson order
    });

    res.status(200).json({ lessons });
  } catch (err) {
    console.error("Get lessons error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET SINGLE LESSON ────────────────────────────────────────
// GET /api/courses/:courseId/lessons/:lessonId
const getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      where: {
        id:       req.params.lessonId,
        courseId:  req.params.courseId
      }
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    res.status(200).json({ lesson });
  } catch (err) {
    console.error("Get lesson error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── UPDATE LESSON ────────────────────────────────────────────
// PUT /api/courses/:courseId/lessons/:lessonId
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      where: { id: req.params.lessonId, courseId: req.params.courseId }
    });
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    // Ownership: check that the course belongs to this teacher
    const course = await Course.findByPk(lesson.courseId);
    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { title, content, order, estimatedMinutes, xpReward } = req.body;
    await lesson.update({
      title:            title            ?? lesson.title,
      content:          content          ?? lesson.content,
      order:            order            ?? lesson.order,
      estimatedMinutes: estimatedMinutes ?? lesson.estimatedMinutes,
      xpReward:         xpReward         ?? lesson.xpReward
    });

    res.status(200).json({ message: "Lesson updated", lesson });
  } catch (err) {
    console.error("Update lesson error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── DELETE LESSON ────────────────────────────────────────────
// DELETE /api/courses/:courseId/lessons/:lessonId
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      where: { id: req.params.lessonId, courseId: req.params.courseId }
    });
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    const course = await Course.findByPk(lesson.courseId);
    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ message: "Access denied." });
    }

    await lesson.destroy();
    res.status(200).json({ message: "Lesson deleted." });
  } catch (err) {
    console.error("Delete lesson error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── AI SUMMARIZE LESSON ──────────────────────────────────────
// POST /api/courses/:courseId/lessons/:lessonId/summarize
// Calls OpenAI GPT to generate a short summary of the lesson content.
// Saves it to the lesson's aiSummary field so it doesn't need to be
// regenerated every time.
const summarizeLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      where: { id: req.params.lessonId, courseId: req.params.courseId }
    });
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    // If we already have a cached summary, return it immediately
    if (lesson.aiSummary) {
      return res.status(200).json({ summary: lesson.aiSummary, cached: true });
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // lightweight, cost-effective model
      messages: [
        {
          role: "system",
          content: "You are an educational assistant. Summarize the following lesson content in 3-5 clear, simple sentences suitable for students."
        },
        {
          role: "user",
          content: lesson.content
        }
      ],
      max_tokens: 200
    });

    const summary = response.choices[0].message.content;

    // Cache the summary on the lesson record
    await lesson.update({ aiSummary: summary });

    res.status(200).json({ summary, cached: false });
  } catch (err) {
    console.error("Summarize error:", err);
    // If OpenAI fails, return a friendly error (don't crash)
    res.status(500).json({ message: "AI summarization failed. Please try again later." });
  }
};

module.exports = {
  createLesson,
  getLessons,
  getLesson,
  updateLesson,
  deleteLesson,
  summarizeLesson
};
