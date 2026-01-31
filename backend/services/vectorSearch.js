/**
 * Placeholder vector search integration.
 * Replace with your vector DB client (Pinecone, Weaviate, Qdrant, etc.).
 */
const searchLessonIdsByEmbedding = async (query) => {
  if (!process.env.VECTOR_DB_ENDPOINT) {
    return null;
  }

  // TODO: Implement vector search.
  // Expected return: array of lesson embedding IDs ordered by similarity.
  return null;
};

module.exports = { searchLessonIdsByEmbedding };
