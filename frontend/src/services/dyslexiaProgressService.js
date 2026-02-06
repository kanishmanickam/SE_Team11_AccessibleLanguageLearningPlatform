const STORAGE_KEY = 'dyslexiaLessonProgress';

const readStore = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
};

const writeStore = (data) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // Ignore storage failures silently
  }
};

const normalizeUserKey = (userKey) => {
  if (!userKey) return 'anonymous';
  return String(userKey);
};

export const getAllLessonProgress = (userKey) => {
  const store = readStore();
  const key = normalizeUserKey(userKey);
  return store[key] || {};
};

export const getLessonProgress = (userKey, lessonId) => {
  const all = getAllLessonProgress(userKey);
  if (!lessonId) return null;
  return (
    all[lessonId] || {
      status: 'Not Started',
      correctCount: 0,
      correctIds: [],
      updatedAt: null,
    }
  );
};

export const saveLessonProgress = (userKey, lessonId, payload) => {
  if (!lessonId) return null;
  const store = readStore();
  const key = normalizeUserKey(userKey);
  const userProgress = store[key] || {};
  const next = {
    ...userProgress[lessonId],
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  store[key] = {
    ...userProgress,
    [lessonId]: next,
  };

  writeStore(store);
  return next;
};

export const resetLessonProgress = (userKey, lessonId) => {
  if (!lessonId) return null;
  const store = readStore();
  const key = normalizeUserKey(userKey);
  const userProgress = store[key] || {};
  delete userProgress[lessonId];
  store[key] = { ...userProgress };
  writeStore(store);
  return true;
};

export const normalizeUserId = (user) => {
  if (!user) return 'anonymous';
  return user.id || user._id || user.email || user.username || 'anonymous';
};
