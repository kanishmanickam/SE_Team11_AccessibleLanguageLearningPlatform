const mongoose = require('mongoose');

const UserInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    interactionId: {
      type: String,
      required: true,
      trim: true,
    },
    selectedAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    answeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

UserInteractionSchema.index({ userId: 1, lessonId: 1, interactionId: 1 });

module.exports = mongoose.model('UserInteraction', UserInteractionSchema);
