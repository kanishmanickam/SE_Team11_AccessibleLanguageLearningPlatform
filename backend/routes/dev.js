const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const LessonSection = require('../models/LessonSection');

// Dev-only: create a test lesson with sections
router.post('/create-test-lesson', async (req, res) => {
  try {
    const { title = 'EPIC6 Test Lesson', sections = [{ title: 'Part 1', text: 'P1' }, { title: 'Part 2', text: 'P2' }] } = req.body;
    const lesson = await Lesson.create({ title, textContent: title });
    const created = await LessonSection.create(
      sections.map((s, i) => ({ lessonId: lesson._id, title: s.title, textContent: s.text || s.textContent || '', order: i }))
    );
    return res.json({ success: true, lesson, sections: created });
  } catch (error) {
    console.error('Dev create-test-lesson error:', error);
    return res.status(500).json({ success: false, message: 'Error creating test lesson', error: error.message });
  }
});

module.exports = router;
