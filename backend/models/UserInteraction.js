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
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAnswer: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserInteractionSchema.index({ userId: 1, lessonId: 1, interactionId: 1 });

module.exports = mongoose.model('UserInteraction', UserInteractionSchema);
