# Database Schema

This project uses MongoDB with Mongoose models defined in `backend/models/`.

## Relationships (high level)

- User (1) -> Preferences (1)
  - `User.preferences` references `Preferences`
  - `Preferences.user` references `User` and is unique (one doc per user)

- User (1) -> UserProgress (many)
  - `UserProgress.userId` references `User`

- Lesson (1) -> LessonSection (many)
  - `LessonSection.lessonId` references `Lesson`

- User (1) + Lesson (1) -> UserInteraction (many)
  - `UserInteraction.userId` + `lessonId` + `interactionId` identifies an interaction state

## User

Model: `User` (`backend/models/User.js`)

| Field | Type | Notes |
| --- | --- | --- |
| name | String | required |
| email | String | required, unique, lowercased |
| password | String | required, stored as bcrypt hash, not selected by default |
| role | String | enum: learner, parent, admin |
| parentEmail | String | optional |
| requiresParentalApproval | Boolean | optional gate for minor accounts |
| isMinor | Boolean | derived from age or explicit flag during registration |
| age | Number | optional |
| learningCondition | String | enum: dyslexia, adhd, autism, none |
| preferences | ObjectId | ref: Preferences |
| lastLogin | Date | optional |
| isActive | Boolean | soft active flag |
| completedLessons | [String] | list of completed lesson keys or ids |
| completedLessonsMeta | [{ key, completedAt }] | timestamp metadata for lesson keys |
| createdAt, updatedAt | Date | Mongoose timestamps |

Indexes:

- `email` is unique.

## Preferences

Model: `Preferences` (`backend/models/Preferences.js`)

| Field | Type | Notes |
| --- | --- | --- |
| user | ObjectId | ref: User, unique |
| fontSize | String | enum: small, medium, large, extra-large |
| fontFamily | String | enum: default, opendyslexic, arial, comic-sans |
| contrastTheme | String | enum: default, high-contrast, dark, light, yellow-black |
| letterSpacing | String | enum: normal, wide, extra-wide |
| wordSpacing | String | enum: normal, wide, extra-wide |
| lineHeight | String | enum: normal, relaxed, loose |
| colorOverlay | String | enum: none, blue, green, yellow, pink |
| learningPace | String | enum: slow, normal, fast |
| sessionDuration | Number | minutes (5 to 60) |
| breakReminders | Boolean | optional |
| distractionFreeMode | Boolean | optional |
| reduceAnimations | Boolean | optional |
| simplifiedLayout | Boolean | optional |
| soundEffects | Boolean | optional |
| enableTextToSpeech | Boolean | currently not required for core features |
| speechRate | Number | 0.5 to 2.0 |
| speechPitch | Number | 0.5 to 2.0 |
| enableSpeechToText | Boolean | currently not required for core features |
| preferredLanguage | String | enum includes english, hindi, tamil, malayalam, telugu, kannada |
| showProgressBar | Boolean | optional |
| enableRewards | Boolean | optional |
| lastModified | Date | updated via pre-save hook |
| createdAt, updatedAt | Date | Mongoose timestamps |

Indexes:

- `user` is unique (one preferences doc per user).

## Lesson

Model: `Lesson` (`backend/models/Lesson.js`)

| Field | Type | Notes |
| --- | --- | --- |
| title | String | required |
| textContent | String | required |
| audioUrl | String | optional |
| visuals | [{ iconUrl, description }] | optional |
| embeddingId | String | optional; used by vector search |
| highlights | [{ id, phrase, emphasisType, color, position }] | optional; emphasisType enum |
| visualAids | [{ id, imageUrl, altText, relatedPhrase, placement }] | optional |
| interactions | [{ id, type, question, options, correctAnswer, hint, explanation, maxAttempts, feedback, position }] | embedded list |
| createdAt, updatedAt | Date | Mongoose timestamps |

Indexes:

- Text index on `title` and `textContent`.

## LessonSection

Model: `LessonSection` (`backend/models/LessonSection.js`)

| Field | Type | Notes |
| --- | --- | --- |
| lessonId | ObjectId | ref: Lesson, required |
| title | String | required |
| textContent | String | required |
| audioUrl | String | optional |
| visuals | [object] | optional visuals and image content |
| visualAids | [object] | optional |
| interactions | [object] | optional per-section interactions |
| order | Number | required; ordering within the lesson |
| createdAt, updatedAt | Date | Mongoose timestamps |

Indexes:

- Compound index on `lessonId` + `order`.

## UserProgress

Model: `UserProgress` (`backend/models/UserProgress.js`)

| Field | Type | Notes |
| --- | --- | --- |
| userId | ObjectId | ref: User, required |
| lessonId | ObjectId | ref: Lesson, required |
| currentSectionId | String | section id stored as string |
| completedSections | [String] | section ids |
| interactionStates | Mixed | arbitrary state stored as JSON |
| completed | Boolean | true when lesson is completed |
| completedAt | Date | timestamp if completed |
| lastAccessedAt | Date | updated as learner progresses |
| createdAt, updatedAt | Date | Mongoose timestamps |

Indexes:

- Unique compound index on `userId` + `lessonId`.

## UserInteraction

Model: `UserInteraction` (`backend/models/UserInteraction.js`)

| Field | Type | Notes |
| --- | --- | --- |
| userId | ObjectId | ref: User, required |
| lessonId | ObjectId | ref: Lesson, required |
| interactionId | String | required |
| attempts | Number | capped by the interaction maxAttempts |
| lastAnswer | Mixed | last submitted answer |
| isCorrect | Boolean | last correctness state |
| createdAt, updatedAt | Date | Mongoose timestamps |

Indexes:

- Index on `userId` + `lessonId` + `interactionId`.
