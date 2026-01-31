import api from '../utils/api';

export const getLessonSections = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}/sections`);
  return response.data.sections || [];
};
