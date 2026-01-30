# Accessible Language Learning Platform - EPIC 1

An accessible, inclusive language learning platform designed specifically for learners with dyslexia, ADHD, and autism spectrum conditions.

## 🎯 Project Overview

This MERN stack application provides a personalized learning experience with:
- **Dyslexia Support**: OpenDyslexic fonts, adjustable spacing, color overlays
- **ADHD Support**: Distraction-free mode, session timers, break reminders
- **Autism Support**: Predictable layouts, reduced animations, visual schedules

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- JWT authentication with parental controls
- User profiles with accessibility preferences
- RESTful API for preferences management
- Secure password hashing with bcrypt

### Frontend (React)
- Responsive, accessible UI components
- Context-based state management
- Condition-specific learning interfaces
- Real-time preference application

## 📁 Project Structure

```
SE_Team11_AccessibleLanguageLearningPlatform/
├── backend/
│   ├── models/
│   │   ├── User.js              # User schema with learning conditions
│   │   └── Preferences.js        # Accessibility preferences schema
│   ├── routes/
│   │   ├── auth.js              # Registration, login, JWT
│   │   ├── preferences.js        # Accessibility settings endpoints
│   │   └── users.js             # User profile management
│   ├── middleware/
│   │   └── auth.js              # JWT verification & parental controls
│   ├── server.js                # Express server setup
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.js         # Login form (1.2)
    │   │   ├── Register.js      # Registration form (1.1)
    │   │   ├── AccessibilitySetup.js  # Preference wizard (1.3-1.6)
    │   │   ├── Dashboard.js     # Main dashboard
    │   │   ├── ProtectedRoute.js
    │   │   └── learning/
    │   │       ├── DyslexiaView.js   # Dyslexia-optimized UI (1.4)
    │   │       ├── ADHDView.js       # ADHD-optimized UI (1.5)
    │   │       └── AutismView.js     # Autism-optimized UI (1.6)
    │   ├── context/
    │   │   ├── AuthContext.js   # Authentication state
    │   │   └── PreferencesContext.js  # Preferences state (1.7)
    │   ├── utils/
    │   │   └── api.js           # Axios configuration
    │   ├── App.js               # Routing
    │   └── index.css            # Accessibility CSS
    └── package.json
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
touch .env
```

4. Update `.env` with your values:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/accessible-learning
JWT_SECRET=your_secure_secret_key
JWT_EXPIRE=7d
NODE_ENV=development

# Optional: enable Gemini AI endpoints (/api/ai/*)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: pin the Gemini model used by backend/routes/ai.js
# If unset or invalid, the backend auto-selects an available model (prefers Flash).
GEMINI_MODEL=gemini-2.5-flash

# Optional: use a specific Python interpreter for TTS (/api/tts/speak)
# PYTHON_EXECUTABLE=../.venv/bin/python
```

### Optional: Enable Python TTS (gTTS)

The `/api/tts/speak` endpoint runs a Python script in `backend/python_services/tts_gen.py`.

If you see `ModuleNotFoundError: No module named 'gtts'`, install the Python dependency:

```bash
python3 -m pip install -r backend/python_services/requirements.txt
```

5. Start MongoDB (if running locally):
```bash
mongod
```

6. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5002`

### Frontend Setup

1. Open a new terminal and navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React app:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 📋 EPIC 1 Features Implemented

### ✅ 1.1 User Registration
- Registration form with validation
- Secure password hashing
- Learning condition selection
- Parental control support for minors

### ✅ 1.2 User Login
- JWT-based authentication
- Token verification middleware
- Session persistence
- Parental approval system

### ✅ 1.3 Accessibility Preference Setup
- 3-step setup wizard
- Font size, contrast, pace settings
- Condition-specific defaults
- Skip option available

### ✅ 1.4 Dyslexia-Friendly Reading Support
- OpenDyslexic font option
- Adjustable letter/word spacing
- Line height control
- Color overlay options
- High-contrast themes

### ✅ 1.5 Adjustable Learning Pace
- Slow, normal, fast pace options
- Session duration slider (5-60 min)
- Break reminder system
- Real-time timer display

### ✅ 1.6 Distraction-Free Mode
- Minimal UI for ADHD learners
- Reduced animations for autism
- Simplified layout option
- Focus mode toggle

### ✅ 1.7 Preference Memory Across Sessions
- Automatic preference loading
- LocalStorage + Database sync
- Real-time CSS application
- Consistent experience across logins

## 🎨 Design Features

### Dyslexia View
- Clear, spacious layout
- Large readable text
- Visual progress indicators
- Color-coded elements

### ADHD View
- Single-focus lesson display
- Session timer
- Minimal distractions
- Quick navigation

### Autism View
- Predictable sidebar routine
- Step-by-step visual schedule
- Consistent layout patterns
- Clear task indicators

## 🔒 Security Features
- JWT authentication
- Password hashing (bcrypt)
- Protected API routes
- Input validation
- XSS protection

## 🧪 Testing

To test the complete flow:

1. **Register**: Create account at `/register` with learning condition
2. **Setup**: Complete accessibility wizard at `/accessibility-setup`
3. **Learn**: View condition-specific dashboard at `/dashboard`
4. **Preferences**: Settings persist across sessions (1.7)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update all preferences
- `PATCH /api/preferences/accessibility` - Update accessibility settings
- `PATCH /api/preferences/dyslexia` - Update dyslexia settings
- `PATCH /api/preferences/adhd` - Update ADHD settings
- `PATCH /api/preferences/autism` - Update autism settings
- `DELETE /api/preferences/reset` - Reset to defaults

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🌐 Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📝 Future Enhancements (Other Epics)
- Lesson content management
- Speech recognition
- Progress tracking
- NLP-based assessment
- Indian language support
- Collaborative features

## 👥 Team
SE Team 11 - Amrita Vishwa Vidyapeetham

## 📄 License
MIT License

---

**Note**: This is EPIC 1 implementation. The platform currently includes user management and accessibility features. Actual lesson content and advanced features will be added in subsequent epics.
