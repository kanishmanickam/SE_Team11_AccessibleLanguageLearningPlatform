const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const UserProgress = require('../models/UserProgress');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('preferences');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const { name, age, parentEmail } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(name && { name }),
        ...(age && { age }),
        ...(parentEmail && { parentEmail }),
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
});

// @route   POST /api/users/complete-lesson
// @desc    Mark a lesson as completed
// @access  Private
router.post('/complete-lesson', protect, async (req, res) => {
  const { lessonKey } = req.body;

  try {
    const user = await User.findById(req.user.id);
    
    const now = new Date();

    if (!user.completedLessons.includes(lessonKey)) {
      user.completedLessons.push(lessonKey);
    }

    // Update or add metadata timestamp for this lessonKey
    if (!Array.isArray(user.completedLessonsMeta)) user.completedLessonsMeta = [];
    const metaIndex = user.completedLessonsMeta.findIndex((m) => m.key === lessonKey);
    if (metaIndex === -1) {
      user.completedLessonsMeta.push({ key: lessonKey, completedAt: now });
    } else {
      user.completedLessonsMeta[metaIndex].completedAt = now;
    }

    await user.save();

    // Try to sync with UserProgress when we can map a lesson id from lessonKey
    let summary = null;
    try {
      const oidMatch = lessonKey && lessonKey.match(/([a-fA-F0-9]{24})/);
      let lesson = null;
      if (oidMatch) {
        const lessonId = oidMatch[1];
        if (mongoose.Types.ObjectId.isValid(lessonId)) {
          lesson = await Lesson.findById(lessonId).lean();
        }
      }

      if (lesson) {
        await UserProgress.findOneAndUpdate(
          { userId: user._id, lessonId: lesson._id },
          { completed: true, completedAt: now, lastAccessedAt: now },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
      }

      // Build a summary payload using the shared helper from progressController
      try {
        const { computeSummary } = require('../controllers/progressController');
        summary = await computeSummary(user._id);
      } catch (e) {
        // fallback: best-effort similar computation
        const totalLessons = await Lesson.countDocuments();
        const completedProgress = await UserProgress.find({ userId: user._id, completed: true })
          .populate('lessonId', 'title')
          .sort({ completedAt: -1 })
          .lean();
        const completedLessons = completedProgress.map((p) => ({
          lessonId: p.lessonId?._id || p.lessonId,
          title: p.lessonId?.title || 'Untitled',
          completedAt: p.completedAt || p.updatedAt || p.createdAt,
        }));
        summary = { totalLessons, completedCount: completedLessons.length, remaining: Math.max(0, totalLessons - completedLessons.length), completedLessons };
      }
    } catch (err) {
      // Not critical - we try to be best-effort here
      console.warn('Error syncing UserProgress for lessonKey', lessonKey, err && err.message);
    }

    res.json({
      success: true,
      message: 'Lesson marked as completed',
      completedLessons: user.completedLessons,
      summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking lesson as completed',
      error: error.message,
    });
  }
});

// @route   GET /api/users/completed-lessons
// @desc    Get user's completed lessons
// @access  Private
router.get('/completed-lessons', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('completedLessons');

    res.json({
      success: true,
      completedLessons: user.completedLessons || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching completed lessons',
      error: error.message,
    });
  }
});

module.exports = router;
