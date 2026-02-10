import api from '../utils/api';

export const getProgress = async (lessonId) => {
  // EPIC 6.4.2: Restore lesson state by fetching saved progress for the current user.
  const response = await api.get(`/progress/${lessonId}`);
  return response.data.progress;
};

export const updateProgress = async ({
  lessonId,
  currentSectionId,
  completedSections,
  interactionStates,
  isReplay,
}) => {
  // EPIC 6.4.1: Auto-save progress as the learner moves forward and completes steps.
  const response = await api.post('/progress/update', {
    lessonId,
    currentSectionId,
    completedSections,
    interactionStates,
    isReplay,
  });
  return response.data.progress;
};

export const getSummary = async () => {
  // EPIC 6.1.2, 6.6.1-6.6.2: Fetch summary totals used for progress percentage and remaining count.
  const response = await api.get('/progress/summary');
  return response.data;
};
