const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Preferences = require('../models/Preferences');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/preferences
// @desc    Get user preferences (1.7)
// @access  Private
router.get('/', protect, async (req, res) => {
  // EPIC 1.7.1: Persisted preference retrieval (DB-backed)
  try {
    const preferences = await Preferences.findOne({ user: req.user.id });

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: 'Preferences not found',
      });
    }

    res.json({
      success: true,
      preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences',
      error: error.message,
    });
  }
});

// @route   PUT /api/preferences
// @desc    Update user preferences (1.3, 1.4, 1.5, 1.6)
// @access  Private
router.put('/', protect, async (req, res) => {
  // EPIC 1.3.2 / 1.4.2 / 1.5.1 / 1.6.1: Save preference updates from the client
  try {
    let preferences = await Preferences.findOne({ user: req.user.id });

    if (!preferences) {
      // Create preferences if they don't exist
      preferences = await Preferences.create({
        user: req.user.id,
        ...req.body,
      });
    } else {
      // Update existing preferences
      preferences = await Preferences.findOneAndUpdate(
        { user: req.user.id },
        { ...req.body, lastModified: Date.now() },
        {
          new: true,
          runValidators: true,
        }
      );
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message,
    });
  }
});

// @route   PATCH /api/preferences/accessibility
// @desc    Update specific accessibility settings (1.3)
// @access  Private
router.patch('/accessibility', protect, async (req, res) => {
  // EPIC 1.3.2: Targeted updates for core accessibility controls (font/theme/etc)
  const {
    fontSize,
    contrastTheme,
    learningPace,
    fontFamily,
    letterSpacing,
    distractionFreeMode
  } = req.body;

  try {
    const updateData = {};
    if (fontSize !== undefined) updateData.fontSize = fontSize;
    if (contrastTheme !== undefined) updateData.contrastTheme = contrastTheme;
    if (learningPace !== undefined) updateData.learningPace = learningPace;
    if (fontFamily !== undefined) updateData.fontFamily = fontFamily;
    if (letterSpacing !== undefined) updateData.letterSpacing = letterSpacing;
    if (distractionFreeMode !== undefined) updateData.distractionFreeMode = distractionFreeMode;

    const preferences = await Preferences.findOneAndUpdate(
      { user: req.user.id },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: 'Preferences not found',
      });
    }

    res.json({
      success: true,
      message: 'Accessibility settings updated',
      preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating accessibility settings',
      error: error.message,
    });
  }
});

// @route   PATCH /api/preferences/dyslexia
// @desc    Update dyslexia-specific settings (1.4)
// @access  Private
router.patch('/dyslexia', protect, async (req, res) => {
  // EPIC 1.4.2: Persist dyslexia-friendly reading preferences (spacing/font)
  const { fontFamily, letterSpacing, wordSpacing, lineHeight, colorOverlay } =
    req.body;

  try {
    const preferences = await Preferences.findOneAndUpdate(
      { user: req.user.id },
      {
        ...(fontFamily && { fontFamily }),
        ...(letterSpacing && { letterSpacing }),
        ...(wordSpacing && { wordSpacing }),
        ...(lineHeight && { lineHeight }),
        ...(colorOverlay && { colorOverlay }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: 'Dyslexia settings updated',
      preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating dyslexia settings',
      error: error.message,
    });
  }
});

// @route   PATCH /api/preferences/adhd
// @desc    Update ADHD-specific settings (1.5)
// @access  Private
router.patch('/adhd', protect, async (req, res) => {
  // EPIC 1.5.1 / 1.5.2: Persist ADHD pacing and break-reminder preferences
  const { learningPace, sessionDuration, breakReminders } = req.body;

  try {
    const preferences = await Preferences.findOneAndUpdate(
      { user: req.user.id },
      {
        ...(learningPace && { learningPace }),
        ...(sessionDuration && { sessionDuration }),
        ...(breakReminders !== undefined && { breakReminders }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: 'ADHD settings updated',
      preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating ADHD settings',
      error: error.message,
    });
  }
});

// @route   PATCH /api/preferences/autism
// @desc    Update autism-specific settings (1.6)
// @access  Private
router.patch('/autism', protect, async (req, res) => {
  // EPIC 1.6.1: Persist focus environment settings (distraction-free, reduce motion)
  const {
    distractionFreeMode,
    reduceAnimations,
    simplifiedLayout,
    soundEffects,
  } = req.body;

  try {
    const preferences = await Preferences.findOneAndUpdate(
      { user: req.user.id },
      {
        ...(distractionFreeMode !== undefined && { distractionFreeMode }),
        ...(reduceAnimations !== undefined && { reduceAnimations }),
        ...(simplifiedLayout !== undefined && { simplifiedLayout }),
        ...(soundEffects !== undefined && { soundEffects }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: 'Autism settings updated',
      preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating autism settings',
      error: error.message,
    });
  }
});

// @route   DELETE /api/preferences/reset
// @desc    Reset preferences to defaults based on learning condition
// @access  Private
router.delete('/reset', protect, async (req, res) => {
  // EPIC 1.3.3 / 1.7: Restore condition-specific defaults from the backend
  try {
    const user = await User.findById(req.user.id);

    // Default preferences based on condition
    const defaults = {
      user: user._id,
      ...(user.learningCondition === 'dyslexia' && {
        fontFamily: 'opendyslexic',
        letterSpacing: 'wide',
        lineHeight: 'relaxed',
      }),
      ...(user.learningCondition === 'adhd' && {
        distractionFreeMode: true,
        learningPace: 'normal',
        breakReminders: true,
      }),
      ...(user.learningCondition === 'autism' && {
        distractionFreeMode: true,
        simplifiedLayout: true,
        reduceAnimations: true,
      }),
    };

    const preferences = await Preferences.findOneAndUpdate(
      { user: req.user.id },
      defaults,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: 'Preferences reset to defaults',
      preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting preferences',
      error: error.message,
    });
  }
});

module.exports = router;
