const Lesson = require('../models/Lesson');
const UserInteraction = require('../models/UserInteraction');

const normalizeAnswer = (value) => {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return value.toString();
  return String(value ?? '').trim().toLowerCase();
};

// @route   POST /api/interactions/submit
// @desc    Submit a lesson interaction response
// @access  Private
exports.submitInteraction = async (req, res) => {
  const { lessonId, interactionId, selectedAnswer } = req.body;

  try {
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    const interaction = lesson.interactions.find(
      (item) => item.id === interactionId
    );

    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found in lesson',
      });
    }

    const isCorrect =
      normalizeAnswer(selectedAnswer) ===
      normalizeAnswer(interaction.correctAnswer);
    const feedback = isCorrect
      ? interaction.feedback.correct
      : interaction.feedback.incorrect;

    await UserInteraction.create({
      userId: req.user.id,
      lessonId,
      interactionId,
      selectedAnswer,
      isCorrect,
      answeredAt: new Date(),
    });

    return res.status(200).json({
      isCorrect,
      feedback,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error submitting interaction',
      error: error.message,
    });
  }
};
