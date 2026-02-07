import api from '../utils/api';

export const getProgress = async (lessonId) => {
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
  const response = await api.get('/progress/summary');
  return response.data;
};
