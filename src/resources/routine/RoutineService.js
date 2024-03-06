import Routine from './Routine.js';

const getRoutines = async (pagination, filter, query, userPointer) => {
  // TODO: actually implement pagination
  // const { page, limit } = pagination;
  // const skip = (page - 1) * limit;

  const routines = await Routine.find({ userPointer });
  return routines;
};

const saveRoutine = async (body) => {
  const routine = new Routine(body);
  await routine.save();
};

export default {
  getRoutines,
  saveRoutine
};
