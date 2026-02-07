const mongoose = require('mongoose');
const LessonSection = require('../models/LessonSection');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');

const getFirstSectionId = async (lessonId) => {
  const first = await LessonSection.findOne({ lessonId }).sort({ order: 1 }).lean();
  return first ? first._id.toString() : '';
};

const countSections = async (lessonId) => {
  return LessonSection.countDocuments({ lessonId });
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
    const lessonExists = await require('../models/Lesson').exists({ _id: lessonId });
    if (!lessonExists) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

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
        completed: false,
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
    const lessonExists = await require('../models/Lesson').exists({ _id: lessonId });
    if (!lessonExists) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

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

    // Determine if lesson is completed
    const totalSections = await countSections(lessonId);
    if (Array.isArray(nextCompleted) && totalSections > 0 && nextCompleted.length >= totalSections) {
      payload.completed = true;
      payload.completedAt = new Date();
      console.log(`User ${req.user.id} completed lesson ${lessonId} at ${payload.completedAt.toISOString()}`);
    } else {
      payload.completed = false;
      payload.completedAt = null;
    }

    const progress = await UserProgress.findOneAndUpdate(
      { userId: req.user.id, lessonId },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // If lesson became completed, ensure the User.completedLessons array is in sync (store lesson id string)
    if (progress && progress.completed) {
      try {
        await User.findByIdAndUpdate(req.user.id, { $addToSet: { completedLessons: lessonId } });
      } catch (e) {
        console.warn('Failed to sync User.completedLessons for user', req.user.id, e && e.message);
      }
    }

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

// Helper: compute user's progress summary (includes UserProgress completed and User.completedLessons)
const Lesson = require('../models/Lesson');

const computeSummary = async (userId) => {
  // Total lessons available in the system
  const totalLessons = await Lesson.countDocuments();

  // Completed via UserProgress (DB-backed lessons)
  const completedProgress = await UserProgress.find({ userId, completed: true })
    .populate('lessonId', 'title')
    .sort({ completedAt: -1 })
    .lean();

  const dbCompletedMap = new Map(); // lessonId -> completedAt
  completedProgress.forEach((p) => {
    const lid = p.lessonId?._id?.toString() || (p.lessonId && p.lessonId.toString());
    if (lid) dbCompletedMap.set(lid, p.completedAt || p.updatedAt || p.createdAt);
  });

  // Completed via User.completedLessons and metadata (may contain non-DB keys like 'autism-lesson-1')
  const user = await User.findById(userId).select('completedLessons completedLessonsMeta').lean();
  const userKeys = (user && Array.isArray(user.completedLessons)) ? user.completedLessons : [];
  const userMeta = (user && Array.isArray(user.completedLessonsMeta)) ? user.completedLessonsMeta : [];

  const nonDbKeys = [];
  const extraDbIds = new Set();
  const metaByKey = new Map(userMeta.map((m) => [m.key, m.completedAt]));

  for (const key of userKeys) {
    // try to extract a 24-hex ObjectId portion
    const match = (key || '').match(/([a-fA-F0-9]{24})/);
    if (match && match[1]) {
      extraDbIds.add(match[1]);
    } else {
      nonDbKeys.push(key);
    }
  }

  // Merge DB IDs from both sources
  const allDbIds = new Set([...dbCompletedMap.keys(), ...Array.from(extraDbIds)]);

  // Fetch titles for DB lessons
  const dbLessons = allDbIds.size > 0 ? await Lesson.find({ _id: { $in: Array.from(allDbIds) } }).lean() : [];
  const dbLessonMap = new Map(dbLessons.map((l) => [l._id.toString(), l]));

  // Build completedLessons array
  const completedLessons = [];

  // Add DB-backed completed lessons
  for (const lid of allDbIds) {
    const lesson = dbLessonMap.get(lid);
    completedLessons.push({
      lessonId: lid,
      title: lesson ? lesson.title : 'Untitled',
      completedAt: dbCompletedMap.get(lid) || null,
    });
  }

  // Add non-DB keys as best-effort entries (use metadata timestamp when available)
  for (const key of nonDbKeys) {
    completedLessons.push({
      lessonId: key,
      title: key,
      completedAt: metaByKey.get(key) || null,
    });
  }

  // Ensure we produce a sensible total: include non-DB sample keys so display isn't '2 of 0'
  const totalLessonsAdjusted = Math.max(totalLessons, allDbIds.size + nonDbKeys.length);
  const completedCount = completedLessons.length;
  const remaining = Math.max(0, totalLessonsAdjusted - completedCount);

  // Sort completed lessons newest-first when completedAt is available
  completedLessons.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  return { success: true, totalLessons: totalLessonsAdjusted, completedCount, remaining, completedLessons };
};

// @route   GET /api/progress/summary
// @desc    Get summary of user progress across lessons
// @access  Private
exports.getSummary = async (req, res) => {
  try {
    const summary = await computeSummary(req.user.id);
    return res.json(summary);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching progress summary',
      error: error.message,
    });
  }
};

// Export helper for reuse
exports.computeSummary = computeSummary;
