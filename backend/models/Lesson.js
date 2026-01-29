const mongoose = require('mongoose');

const LessonVisualSchema = new mongoose.Schema(
  {
    iconUrl: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { _id: false }
);

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    textContent: {
      type: String,
      required: true,
      trim: true,
    },
    audioUrl: {
      type: String,
      trim: true,
      default: '',
    },
    visuals: {
      type: [LessonVisualSchema],
      default: [],
    },
    embeddingId: {
      type: String,
      trim: true,
      default: '',
    },
    interactions: {
      type: [
        new mongoose.Schema(
          {
            id: {
              type: String,
              required: true,
              trim: true,
            },
            type: {
              type: String,
              required: true,
              enum: ['multiple_choice', 'true_false', 'click'],
            },
            question: {
              type: String,
              required: true,
              trim: true,
            },
            options: {
              type: [String],
              default: undefined,
            },
            correctAnswer: {
              type: mongoose.Schema.Types.Mixed,
              required: true,
            },
            feedback: {
              correct: {
                type: String,
                required: true,
                trim: true,
              },
              incorrect: {
                type: String,
                required: true,
                trim: true,
              },
            },
            position: {
              type: Number,
              required: true,
              min: 0,
            },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

LessonSchema.index({ title: 'text', textContent: 'text' });

module.exports = mongoose.model('Lesson', LessonSchema);
