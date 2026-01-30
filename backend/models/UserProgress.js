const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema(
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
    currentSectionId: {
      type: String,
      default: '',
    },
    completedSections: {
      type: [String],
      default: [],
    },
    interactionStates: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

UserProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', UserProgressSchema);
