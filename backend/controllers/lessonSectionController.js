const mongoose = require('mongoose');
const LessonSection = require('../models/LessonSection');

// @route   GET /api/lessons/:lessonId/sections
// @desc    Get lesson sections for a lesson
// @access  Private
exports.getLessonSections = async (req, res) => {
  const { lessonId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(lessonId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lesson ID',
    });
  }

  try {
    const sections = await LessonSection.find({ lessonId })
      .sort({ order: 1 })
      .lean();

    return res.json({
      success: true,
      sections,
      count: sections.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching lesson sections',
      error: error.message,
    });
  }
};
