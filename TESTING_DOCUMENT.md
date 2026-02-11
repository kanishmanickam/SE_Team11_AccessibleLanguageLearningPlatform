# Testing Document: Accessible Language Learning Platform

## Testing Strategy by Component

This section details how each major component of the project will be tested, including the types of tests, properties to be validated, and the tools, platforms, libraries, and frameworks used.

### 1. Frontend (React Application)
- **Components:** Lesson pages, accessibility UI, progress dashboard, learning history, lesson completion, error handling.
- **Test Types:**
	- Unit tests: Validate individual React components and utility functions.
	- Integration tests: Test interactions between components and API services.
	- Accessibility tests: Ensure UI meets accessibility standards (font, contrast, spacing, ARIA roles).
	- Edge case tests: Null/undefined props, error boundaries, loading states.
- **Properties Tested:**
	- Rendering correctness
	- Accessibility compliance
	- State management and persistence
	- User interaction flows
	- Error handling and fallback UI
- **Tools/Libraries/Frameworks:**
	- Jest (test runner)
	- React Testing Library (component testing)
	- Cypress (recommended for end-to-end and accessibility testing)
	- axe-core (for accessibility checks, via Cypress or React Testing Library)

### 2. Backend (Node.js/Express API)
- **Components:** Auth, preferences, lessons, progress, interactions, TTS, AI endpoints.
- **Test Types:**
	- Unit tests: Validate route handlers, controllers, and utility functions.
	- Integration tests: Test API endpoints with mock data and in-memory database.
	- Error handling tests: Simulate invalid input, missing data, and authentication failures.
	- Reliability tests: Ensure proper status codes, no crashes, and robust flows.
- **Properties Tested:**
	- API response correctness
	- Data validation and persistence
	- Authentication and authorization
	- Error handling and reliability
- **Tools/Libraries/Frameworks:**
	- Jest (test runner)
	- Supertest (API endpoint testing)
	- MongoMemoryServer (in-memory MongoDB for isolated tests)
	- sinon (optional for mocking/stubbing)

### 3. Database (MongoDB/Mongoose Models)
- **Components:** User, Preferences, Lesson, LessonSection, UserProgress, UserInteraction.
- **Test Types:**
	- Model unit tests: Validate schema, field constraints, and relationships.
	- Integration tests: Test CRUD operations and data integrity.
- **Properties Tested:**
	- Schema validation
	- Relationship mapping
	- Indexes and uniqueness
	- Data persistence and retrieval
- **Tools/Libraries/Frameworks:**
	- Jest
	- MongoMemoryServer
	- Mongoose (model validation)

### 4. Python Services (Text-to-Speech)
- **Components:** Python TTS generator invoked by backend.
- **Test Types:**
	- Unit tests: Validate TTS script output for given text inputs.
	- Integration tests: Test backend-Python communication and audio streaming.
- **Properties Tested:**
	- Audio output correctness
	- Error handling for missing dependencies
	- API integration
- **Tools/Libraries/Frameworks:**
	- pytest (recommended for Python unit tests)
	- Jest/Supertest (for backend integration)

### 5. End-to-End Testing
- **Components:** Full user flows (login, lesson navigation, progress tracking, accessibility settings).
- **Test Types:**
	- E2E tests: Simulate real user actions across frontend and backend.
- **Properties Tested:**
	- Workflow correctness
	- Accessibility compliance
	- Data persistence across sessions
	- Error handling and recovery
- **Tools/Libraries/Frameworks:**
	- Cypress (recommended for E2E and accessibility)

### 6. Accessibility Testing
- **Components:** All UI elements and flows.
- **Test Types:**
	- Automated accessibility checks
	- Manual accessibility review
- **Properties Tested:**
	- ARIA roles and attributes
	- Keyboard navigation
	- Color contrast and font size
- **Tools/Libraries/Frameworks:**
	- axe-core (integrated with Cypress or React Testing Library)
	- Cypress

### 7. Performance Testing (Basic)
- **Components:** Progress dashboard, lesson loading, API endpoints.
- **Test Types:**
	- Basic performance insight tests
- **Properties Tested:**
	- Response time
	- UI rendering speed
- **Tools/Libraries/Frameworks:**
	- Jest (timing assertions)
	- Cypress (performance checks)

---

## Overview
This document details the testing strategy, tools, and test cases for the Accessible Language Learning Platform. The project uses a comprehensive suite of unit tests for both frontend and backend, focusing on accessibility, lesson delivery, progress tracking, and reliability.


## Testing Tools, Platforms, Libraries, and Frameworks
- **Jest**: Main test runner for JS/TS code (frontend/backend).
- **React Testing Library**: For React component/unit/integration tests.
- **Supertest**: For backend API endpoint testing.
- **MongoMemoryServer**: In-memory MongoDB for backend tests.
- **Cypress**: Recommended for end-to-end and accessibility testing.
- **axe-core**: Automated accessibility checks.
- **pytest**: For Python unit tests (TTS service).
- **sinon**: Optional for mocking/stubbing backend logic.
- **Mongoose**: Model validation and schema testing.

## Test Structure
- **Frontend tests**: Located in `/testing` and `/tests/frontend`. Cover UI components, accessibility features, lesson flows, progress tracking, and error handling.
- **Backend tests**: Located in `/tests/backend`. Cover API endpoints, progress tracking, error handling, and system reliability.

## Example Test Cases

### 1. Dyslexia-Friendly Reading Support
| Test Case ID | Feature | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-DYS-001 | Dyslexia font | Verify `.dyslexia-view` container renders | Render `<DyslexiaView />` | Root element has class `dyslexia-view` |
| TC-DYS-002 | Text size | Heading renders with syllable mode | Render `<DyslexiaView />` (syllable mode ON) | Heading shows syllable text |
| TC-DYS-003 | Line spacing | Subtitle element exists | Render `<DyslexiaView />` | `.subtitle` element is present |

### 2. Lesson Completion & Progress
| Test Case ID | Feature | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-LP-001 | Lesson completion | Calls progress API automatically | Complete lesson | Success message shown |
| TC-LP-002 | Progress summary | Shows completed/total lessons | Render dashboard | '7 / 10 lessons completed' text |
| TC-LP-003 | Learning history | Displays completed lessons | Render progress page | List of completed lessons |

### 3. Backend Progress API
| Test Case ID | Feature | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-BE-001 | Save progress | Saves lesson progress | POST `/api/progress/complete` | 200 status, success true |
| TC-BE-002 | Error handling | Handles backend errors | Close DB, GET `/api/progress/summary` | 500/401 status |
| TC-BE-003 | Invalid data | Prevents crashes | POST `/api/progress/update` with invalid data | Error status, no crash |

### 4. Reliable Lesson Loading
| Test Case ID | Feature | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-FE-001 | Lesson load | Loads lesson content | Render `<LessonPage lessonId="lesson1" />` | Lesson title shown |
| TC-FE-002 | Loading state | Shows loading indicator | Render lesson page | 'Loading...' text |
| TC-FE-003 | Error state | Shows error message | Mock lesson fetch failure | 'Unable to load' message |
| TC-FE-004 | Retry | Provides retry button | Click retry | Loading indicator shown |

## Edge Cases
- Null/undefined user handled gracefully.
- Empty string input for decorators.
- Double-decoration prevention for text utilities.
- Backend errors and invalid data do not crash the app.

## Test Coverage Summary
- **Frontend**: Progress dashboard, lesson completion, learning history, automatic progress saving, reliable lesson loading, performance insight.
- **Backend**: Progress APIs, completion, summary, error handling, reliability.

## Suggested Testing Tool
**Jest** is recommended for all unit and integration tests. For end-to-end testing, consider **Cypress** for simulating real user flows and accessibility checks.

---

## Additional Test Cases

### Accessibility Preferences
| Test Case ID | Feature | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-ACC-001 | Font size | Updates font size preference | PATCH `/api/preferences/accessibility` | Preference updated |
| TC-ACC-002 | Contrast theme | Updates contrast theme | PATCH `/api/preferences/accessibility` | Theme applied |

### Progress API Edge Cases
| Test Case ID | Feature | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-BE-004 | Invalid JWT | Access progress API with invalid token | GET `/api/progress/summary` | 401 Unauthorized |
| TC-BE-005 | Missing lessonId | Update progress with missing lessonId | POST `/api/progress/update` | 400 Bad Request |

---

## How to Run Tests
- **Frontend**: `cd frontend && npm test`
- **Backend**: `cd backend && npm test`

## References
- See `testCases.md` and `testSummary.md` for detailed test lists.
- See `/tests` and `/testing` folders for actual test implementations.

---


