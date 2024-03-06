import express from 'express';
import UserService from './UserService.js';
import { postUserValidationRules } from './UserValidation.js';
import validate from '../../shared/validate.js';
import TokenAuthentication from '../../middleware/TokenAuthentication.js';

const router = express.Router();

router.post('/api/1.0/users', postUserValidationRules(), validate(), async (validation, request, response, next) => {
  try {
    if (validation.extractedErrors) throw { validation: validation.extractedErrors };
    await UserService.save(request.body);
    return response.send();
  } catch (error) {
    return next(error);
  }
});

router.put('/api/1.0/users/:userPointer', TokenAuthentication, async (request, response, next) => {
  try {
    return response.send();
  } catch (error) {
    return next(error);
  }
});

router.post('/api/1.0/users/token/:token', async (request, response, next) => {
  const token = request.params.token;
  try {
    await UserService.activate(token);
    return response.send();
  } catch (error) {
    return next(error);
  }
});

export default router;
