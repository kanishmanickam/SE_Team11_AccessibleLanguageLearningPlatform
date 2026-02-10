# EPIC-6 Unit Testing Explanation

This file explains the unit testing approach for EPIC-6 (Progress Tracking & System Reliability) in the SE_Team11_AccessibleLanguageLearningPlatform project.

## Test Structure

All tests are stored in the `/tests` folder, outside production code:

```
/tests
  /backend
    progress.test.js
    stableSystemBasics.test.js
  /frontend
    ProgressDashboard.test.js
    LessonCompletion.test.js
    LearningHistory.test.js
    AutomaticProgressSaving.test.js
    ReliableLessonLoading.test.js
    BasicPerformanceInsight.test.js
```

## Backend Testing
- **Tools:** Jest, Supertest, MongoMemoryServer (in-memory MongoDB), mock JWT
- **Coverage:**
  - Progress APIs: completion, summary, error handling
  - System reliability: status codes, invalid data, fast responses, basic flows

## Frontend Testing
- **Tools:** Jest, React Testing Library
- **Coverage:**
  - Progress display, feedback, learning history, automatic saving, lesson loading, performance insight
  - Mocked API services and responses

## Testing Principles
- Only EPIC-6 features are tested
- No changes to production code
- Tests are readable, maintainable, and additive
- All tests pass with `npm test`

## How to Run
1. Install dependencies: `npm install`
2. Run tests: `npm test`

## Ready for PR Submission
- All tests are isolated and follow project guidelines
- No unrelated features are tested or modified

---
For questions or improvements, contact SE Team 11.
