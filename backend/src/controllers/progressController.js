// src/controllers/progressController.js
// ============================================================
// Progress Controller — Gamification & Tracking
// Handles: completing lessons, earning XP, leveling up, leaderboard
// ============================================================

const { Progress, Lesson, User, Course, Enrollment } = require("../models");
const { Op } = require("sequelize");

// ── XP & LEVELING CONSTANTS ──────────────────────────────────
// Level thresholds: level N requires N * 100 total XP
// e.g., Level 2 = 200 XP, Level 3 = 300 XP, etc.
const getRequiredXP = (level) => level * 100;

// ── Helper: recalculate user level based on total XP ─────────
const recalculateLevel = (totalXP) => {
  let level = 1;
  while (totalXP >= getRequiredXP(level + 1)) {
    level++;
  }
  return level;
};

// ── COMPLETE A LESSON ────────────────────────────────────────
// POST /api/progress/complete
// Body: { lessonId }
// Awards XP, updates level, and returns gamification feedback.
const completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.body;
    if (!lessonId) {
      return res.status(400).json({ message: "lessonId is required." });
    }

    // 1. Find the lesson
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    // 2. Check if student is enrolled in this course
    const enrollment = await Enrollment.findOne({
      where: { studentId: req.user.id, courseId: lesson.courseId }
    });
    if (!enrollment) {
      return res.status(403).json({ message: "You are not enrolled in this course." });
    }

    // 3. Find or create a progress record
    let progress = await Progress.findOne({
      where: { studentId: req.user.id, lessonId }
    });

    // If already completed, return early (no double XP)
    if (progress && progress.isCompleted) {
      return res.status(200).json({
        message: "Already completed",
        alreadyCompleted: true,
        xpEarned: 0
      });
    }

    const now = new Date();

    if (!progress) {
      // First time seeing this lesson — create record
      progress = await Progress.create({
        studentId:   req.user.id,
        lessonId,
        isCompleted: true,
        xpEarned:    lesson.xpReward,
        startedAt:   now,
        completedAt: now
      });
    } else {
      // Was started but not completed — mark complete now
      await progress.update({
        isCompleted: true,
        xpEarned:    lesson.xpReward,
        completedAt: now
      });
    }

    // 4. Update user's total XP and level
    const user = await User.findByPk(req.user.id);
    const newXP    = user.xp + lesson.xpReward;
    const newLevel = recalculateLevel(newXP);
    const leveledUp = newLevel > user.level;

    await user.update({ xp: newXP, level: newLevel });

    // 5. Check if the entire course is now completed
    const totalLessons = await Lesson.count({ where: { courseId: lesson.courseId } });
    const completedLessons = await Progress.count({
      where: { studentId: req.user.id, isCompleted: true },
      include: [{
        model: Lesson,
        as: "lesson",
        where: { courseId: lesson.courseId }
      }]
    });
    const courseCompleted = (completedLessons === totalLessons);

    // Update enrollment status if course is done
    if (courseCompleted) {
      await enrollment.update({ status: "completed" });
    }

    res.status(200).json({
      message:        "Lesson completed!",
      xpEarned:       lesson.xpReward,
      totalXP:        newXP,
      level:          newLevel,
      leveledUp,
      courseCompleted,
      completedLessons,
      totalLessons
    });
  } catch (err) {
    console.error("Complete lesson error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── START A LESSON ───────────────────────────────────────────
// POST /api/progress/start
// Body: { lessonId }
// Records that the student started reading this lesson.
const startLesson = async (req, res) => {
  try {
    const { lessonId } = req.body;
    if (!lessonId) {
      return res.status(400).json({ message: "lessonId is required." });
    }

    let progress = await Progress.findOne({
      where: { studentId: req.user.id, lessonId }
    });

    if (!progress) {
      progress = await Progress.create({
        studentId: req.user.id,
        lessonId,
        isCompleted: false,
        startedAt: new Date()
      });
    }

    res.status(200).json({ message: "Lesson started", progress });
  } catch (err) {
    console.error("Start lesson error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET MY PROGRESS FOR A COURSE ─────────────────────────────
// GET /api/progress/course/:courseId
const getCourseProgress = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { courseId: req.params.courseId },
      order: [["order", "ASC"]]
    });

    // For each lesson, find the student's progress
    const progressData = await Promise.all(
      lessons.map(async (lesson) => {
        const progress = await Progress.findOne({
          where: { studentId: req.user.id, lessonId: lesson.id }
        });
        return {
          lessonId:    lesson.id,
          lessonTitle: lesson.title,
          order:       lesson.order,
          xpReward:    lesson.xpReward,
          isCompleted: progress?.isCompleted || false,
          xpEarned:    progress?.xpEarned   || 0,
          startedAt:   progress?.startedAt  || null,
          completedAt: progress?.completedAt|| null
        };
      })
    );

    const totalXP       = progressData.reduce((sum, p) => sum + p.xpEarned, 0);
    const completedCount= progressData.filter(p => p.isCompleted).length;

    res.status(200).json({
      courseId: req.params.courseId,
      progress: progressData,
      summary: {
        totalLessons:   lessons.length,
        completedCount,
        totalXP,
        percentComplete: lessons.length > 0
          ? Math.round((completedCount / lessons.length) * 100)
          : 0
      }
    });
  } catch (err) {
    console.error("Get progress error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── LEADERBOARD ──────────────────────────────────────────────
// GET /api/progress/leaderboard
// Returns top 20 students ranked by XP.
const getLeaderboard = async (req, res) => {
  try {
    const topStudents = await User.findAll({
      where: { role: "student" },
      attributes: ["id", "name", "xp", "level"],
      order: [["xp", "DESC"]],
      limit: 20
    });

    // Add rank number to each entry
    const leaderboard = topStudents.map((student, index) => ({
      rank:  index + 1,
      id:    student.id,
      name:  student.name,
      xp:    student.xp,
      level: student.level,
      isYou: student.id === req.user.id  // highlight current user
    }));

    res.status(200).json({ leaderboard });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  completeLesson,
  startLesson,
  getCourseProgress,
  getLeaderboard
};
