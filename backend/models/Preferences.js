const mongoose = require('mongoose');

const PreferencesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    
    // General Accessibility Settings (1.3)
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'extra-large'],
      default: 'medium',
    },
    fontFamily: {
      type: String,
      enum: ['default', 'opendyslexic', 'arial', 'comic-sans'],
      default: 'default',
    },
    contrastTheme: {
      type: String,
      enum: ['default', 'high-contrast', 'dark', 'light', 'yellow-black'],
      default: 'default',
    },
    
    // Dyslexia Support (1.4)
    letterSpacing: {
      type: String,
      enum: ['normal', 'wide', 'extra-wide'],
      default: 'normal',
    },
    wordSpacing: {
      type: String,
      enum: ['normal', 'wide', 'extra-wide'],
      default: 'normal',
    },
    lineHeight: {
      type: String,
      enum: ['normal', 'relaxed', 'loose'],
      default: 'normal',
    },
    colorOverlay: {
      type: String,
      enum: ['none', 'blue', 'green', 'yellow', 'pink'],
      default: 'none',
    },
    
    // ADHD Support (1.5)
    learningPace: {
      type: String,
      enum: ['slow', 'normal', 'fast'],
      default: 'normal',
    },
    sessionDuration: {
      type: Number, // in minutes
      default: 20,
      min: 5,
      max: 60,
    },
    breakReminders: {
      type: Boolean,
      default: true,
    },
    
    // Autism Support (1.6)
    distractionFreeMode: {
      type: Boolean,
      default: false,
    },
    reduceAnimations: {
      type: Boolean,
      default: false,
    },
    simplifiedLayout: {
      type: Boolean,
      default: false,
    },
    soundEffects: {
      type: Boolean,
      default: true,
    },
    
    // Text-to-Speech & Speech-to-Text
    enableTextToSpeech: {
      type: Boolean,
      default: false,
    },
    speechRate: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.0,
    },
    speechPitch: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.0,
    },
    enableSpeechToText: {
      type: Boolean,
      default: false,
    },
    
    // Language Settings
    preferredLanguage: {
      type: String,
      enum: ['english', 'hindi', 'tamil', 'malayalam', 'telugu', 'kannada'],
      default: 'english',
    },
    
    // Gamification preferences
    showProgressBar: {
      type: Boolean,
      default: true,
    },
    enableRewards: {
      type: Boolean,
      default: true,
    },
    
    // Last updated
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update lastModified on save
PreferencesSchema.pre('save', function (next) {
  this.lastModified = Date.now();
  next();
});

module.exports = mongoose.model('Preferences', PreferencesSchema);
