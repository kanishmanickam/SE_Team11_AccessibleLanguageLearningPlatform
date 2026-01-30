const express = require('express');
const router = express.Router();
const User = require('../models/User');
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
    
    if (!user.completedLessons.includes(lessonKey)) {
      user.completedLessons.push(lessonKey);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Lesson marked as completed',
      completedLessons: user.completedLessons,
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
