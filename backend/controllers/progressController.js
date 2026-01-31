const mongoose = require('mongoose');
const LessonSection = require('../models/LessonSection');
const UserProgress = require('../models/UserProgress');

const getFirstSectionId = async (lessonId) => {
  const first = await LessonSection.findOne({ lessonId }).sort({ order: 1 }).lean();
  return first ? first._id.toString() : '';
};

// @route   GET /api/progress/:lessonId
// @desc    Get progress for a lesson
// @access  Private
exports.getProgress = async (req, res) => {
  const { lessonId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(lessonId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lesson ID',
    });
  }

  try {
    let progress = await UserProgress.findOne({
      userId: req.user.id,
      lessonId,
    });

    if (!progress) {
      const firstSectionId = await getFirstSectionId(lessonId);
      progress = await UserProgress.create({
        userId: req.user.id,
        lessonId,
        currentSectionId: firstSectionId,
        completedSections: [],
        interactionStates: {},
        lastAccessedAt: new Date(),
      });
    }

    return res.json({
      success: true,
      progress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message,
    });
  }
};

// @route   POST /api/progress/update
// @desc    Update lesson progress (only when moving forward)
// @access  Private
exports.updateProgress = async (req, res) => {
  const { lessonId, currentSectionId, completedSections, interactionStates, isReplay } = req.body;

  if (!mongoose.Types.ObjectId.isValid(lessonId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lesson ID',
    });
  }

  try {
    const existing = await UserProgress.findOne({
      userId: req.user.id,
      lessonId,
    });

    if (isReplay) {
      return res.json({
        success: true,
        progress: existing,
      });
    }

    const nextCompleted = Array.isArray(completedSections)
      ? Array.from(new Set(completedSections))
      : existing?.completedSections || [];

    const payload = {
      lastAccessedAt: new Date(),
    };

    if (typeof currentSectionId === 'string') {
      payload.currentSectionId = currentSectionId;
    }

    if (nextCompleted) {
      payload.completedSections = nextCompleted;
    }

    if (interactionStates) {
      payload.interactionStates = interactionStates;
    }

    const progress = await UserProgress.findOneAndUpdate(
      { userId: req.user.id, lessonId },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      progress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message,
    });
  }
};
