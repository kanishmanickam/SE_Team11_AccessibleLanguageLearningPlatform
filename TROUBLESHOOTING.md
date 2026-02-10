# Troubleshooting

This page lists common local-development and deployment issues for this repository.

## Backend will not start

Symptoms:

- Process exits immediately
- Console shows missing environment variables

Checks:

- Ensure `backend/.env` exists and includes `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`.
- Ensure MongoDB is reachable (local `mongod` running, or Atlas reachable).

## MongoDB connection errors

Symptoms:

- `MongoDB Connection Error` logged in the backend

Fixes:

- Verify `MONGODB_URI` value.
- If using Atlas, ensure the IP allowlist includes your current IP or the host.
- If using local MongoDB, ensure the service is running and the port is correct.

## Frontend cannot call the backend (404 or network errors)

Symptoms:

- Requests to `/api/...` return 404 in the browser
- `ERR_CONNECTION_REFUSED` in console

Fixes:

- Confirm backend is running on the port used by the frontend proxy.
  - Default proxy is `http://localhost:5002` in `frontend/package.json`.
- If you change backend `PORT`, update the frontend proxy or set `REACT_APP_API_URL`.

## 401 Unauthorized

Symptoms:

- API calls return 401
- UI redirects to `/login`

Fixes:

- Ensure the frontend stored a valid token in localStorage.
- Log in again to refresh the token.
- Confirm requests include `Authorization: Bearer <token>`.

## 403 Forbidden

Symptoms:

- Backend returns 403

Fixes:

- Check role-based authorization (if an endpoint uses `authorize`).
- For minor accounts, some flows may require parental approval headers depending on the feature.

## TTS endpoint fails

Endpoint: `POST /api/tts/speak`

Symptoms:

- 500 response
- Backend logs show Python spawn errors
- Backend logs show `ModuleNotFoundError: No module named 'gtts'`

Fixes:

- Install Python requirements:

```bash
python3 -m pip install -r backend/python_services/requirements.txt
```

- Ensure Python is available on PATH (`python3`).
- If using a virtual environment, set `PYTHON_EXECUTABLE` in `backend/.env`.

## Audio plays on some devices but not others

Symptoms:

- No sound until user interaction
- Autoplay blocked

Fixes:

- Ensure playback is triggered by a user gesture (click/tap).
- Use the UI audio controls (Play, Replay) rather than auto-playing.

## AI endpoints return mock data

Endpoints:

- `POST /api/ai/generate-questions`
- `POST /api/ai/story-quiz`

Symptoms:

- Questions look generic

Fixes:

- Configure `GEMINI_API_KEY` in `backend/.env`.
- Optionally set `GEMINI_MODEL` to a model your key can access.
- Check backend logs for quota or permission errors.

## Build errors (frontend)

Symptoms:

- `npm run build` fails

Fixes:

- Delete and reinstall dependencies:

```bash
rm -rf frontend/node_modules
cd frontend
npm install
```

- Ensure Node.js version is compatible with CRA 5.

## Port already in use

Symptoms:

- Backend: `EADDRINUSE`
- Frontend prompts to use another port

Fixes:

- Stop the process using the port.
- Change `PORT` in `backend/.env` and update the frontend proxy accordingly.

## Progress not updating

Symptoms:

- Progress page shows stale values

Fixes:

- Confirm `GET /api/progress/summary` returns updated counts.
- Check that the frontend is calling `POST /api/progress/update` while advancing.
- Ensure the user has a valid token and the backend can write to MongoDB.
