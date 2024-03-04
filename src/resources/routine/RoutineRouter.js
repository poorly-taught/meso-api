import express from 'express';
import TokenAuthentication from '../../middleware/TokenAuthentication';
import RoutineService from './RoutineService';
import { postRoutineValidationRules, validate } from './RoutineValidation';

const router = express.Router();
router.use(TokenAuthentication);

router.get('/api/1.0/routines', async (request, response, next) => {
  try {
    const { page, limit, filter, query } = request.query;
    const items = await RoutineService.getRoutines({ page, limit }, filter, query, request.userPointer);
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

router.post(
  '/api/1.0/routines',
  postRoutineValidationRules(),
  validate(),
  async (validation, request, response, next) => {
    try {
      if (validation.extractedErrors) throw { validation: validation.extractedErrors };
      await RoutineService.saveRoutine(request.body);
      response.send();
    } catch (error) {
      next(error);
    }
  }
);
export default router;
