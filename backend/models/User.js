const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['learner', 'parent', 'admin'],
      default: 'learner',
    },
    // Parental control fields
    parentEmail: {
      type: String,
      lowercase: true,
    },
    requiresParentalApproval: {
      type: Boolean,
      default: false,
    },
    isMinor: {
      type: Boolean,
      default: false,
    },
    age: {
      type: Number,
      min: 3,
      max: 100,
    },
    // Learning condition
    learningCondition: {
      type: String,
      enum: ['dyslexia', 'adhd', 'autism', 'none'],
      required: true,
    },
    // Reference to preferences
    preferences: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Preferences',
    },
    // Progress tracking
    lastLogin: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
