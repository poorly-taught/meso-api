import express from 'express';
import TokenAuthentication from '../../middleware/TokenAuthentication.js';
import ExerciseService from './ExerciseService.js';

const router = express.Router();

router.get('/api/1.0/exercises', TokenAuthentication, async (request, response, next) => {
  try {
    const { page, limit, filter, query } = request.query;
    const items = await ExerciseService.getExercises({ page, limit }, filter, query);
    // TODO: totalPages calculation and make part of ExerciseService
    response.send({
      items,
      pagination: {
        current: page,
        totalPages: '',
        totalItems: items.length,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
