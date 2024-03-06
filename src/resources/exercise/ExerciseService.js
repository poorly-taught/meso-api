import Exercise from './Exercise.js';

const getExercises = async (pagination, filter, query) => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  if (filter && query) {
    const exercises = await Exercise.find({ [filter]: { $regex: '.*' + query + '.*' } })
      .skip(skip)
      .limit(limit);
    return exercises;
  }

  if (!filter && !query) {
    const exercises = await Exercise.find({}).skip(skip).limit(limit);
    return exercises;
  }
};

export default {
  getExercises
};
