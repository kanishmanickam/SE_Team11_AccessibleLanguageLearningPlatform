const express = require('express');
const { protect } = require('../middleware/auth');
const { getLessonById, searchLessons } = require('../controllers/lessonController');

const router = express.Router();

// @route   GET /api/lessons/search?q=
// @desc    Search lessons (text search fallback for semantic search)
// @access  Private
router.get('/search', protect, searchLessons);

// @route   GET /api/lessons/:id
// @desc    Get lesson by ID
// @access  Private
router.get('/:id', protect, getLessonById);

module.exports = router;
