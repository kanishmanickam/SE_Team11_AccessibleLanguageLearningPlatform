# Coding Standards

This document captures the conventions used in this repository so contributions remain consistent.

## Languages and module systems

- Backend: Node.js, CommonJS (`require`, `module.exports`)
- Frontend: React, ES modules (`import`, `export`)

## Formatting

Follow existing style in the repo:

- Indentation: 2 spaces
- Semicolons: used
- Quotes: single quotes in JavaScript where practical
- JSX: prefer readable multi-line props for complex components

If you use an auto-formatter, configure it to preserve the current style and avoid large reformat-only diffs.

## Naming

- Files and folders:
  - Frontend components: `PascalCase.js` for React components
  - Backend modules: `camelCase.js` for controllers/services, `lowercase.js` for routes
- Variables and functions:
  - `camelCase`
  - Prefer descriptive names over abbreviations

## API conventions

- API namespace: `/api/...`
- Use HTTP status codes consistently:
  - 200 for success
  - 201 for created
  - 400 for validation failures
  - 401 for unauthenticated
  - 403 for unauthorized
  - 404 for not found
  - 500 for server errors
- Response structure:
  - Many endpoints return `{ success: true, ... }` or `{ success: false, message, ... }`
  - When validation fails, return an `errors` array when available (express-validator)

## Error handling

- Validate inputs early (for example, `lessonId` must be a valid Mongo ObjectId when required).
- Do not log sensitive data (passwords, JWTs).
- Prefer clear user-facing messages and avoid leaking internal stack traces in production.

## Authentication and authorization

- Protected endpoints use JWT and the `protect` middleware (`backend/middleware/auth.js`).
- Keep authorization checks close to the route handler when behavior differs by role.

## Frontend API access

- Use the shared Axios instance (`frontend/src/utils/api.js`) so tokens and 401 handling are consistent.
- Prefer central API wrappers in `frontend/src/services/` rather than ad-hoc fetch calls in components.

## React state and contexts

- Auth state lives in `frontend/src/context/AuthContext.js`.
- Preferences state lives in `frontend/src/context/PreferencesContext.js`.
- When adding new cross-cutting state, prefer a context provider rather than prop drilling.

## Data modeling practices

- Keep Mongoose schemas explicit with enums for constrained values.
- Add indexes when a query pattern is repeated or needs to be unique.
- Prefer `lean()` when returning large lists and you do not need Mongoose document methods.

## Comments and traceability

This codebase uses inline EPIC task identifiers (example: `EPIC 6.4.1`).

Guidelines:

- Keep EPIC comments short and near the relevant code.
- Do not change EPIC identifiers unless requirements change.
- Avoid large blocks of commented-out code.

## Git and contributions

- Keep commits small and focused.
- Avoid mixing formatting changes with functional changes.
- Update developer docs when you add or change endpoints, schema fields, or setup steps.
