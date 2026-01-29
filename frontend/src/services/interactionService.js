import api from '../utils/api';

export const submitInteraction = async ({ lessonId, interactionId, selectedAnswer }) => {
  const response = await api.post('/interactions/submit', {
    lessonId,
    interactionId,
    selectedAnswer,
  });
  return response.data;
};
