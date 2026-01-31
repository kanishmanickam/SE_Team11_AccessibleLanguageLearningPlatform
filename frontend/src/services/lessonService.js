import api from '../utils/api';

export const getLessonById = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}`);
  return response.data.lesson;
};

export const searchLessons = async (query) => {
  const response = await api.get('/lessons/search', {
    params: { q: query },
  });
  return response.data.lessons || [];
};
