import express from 'express';
import AuthenticationService from './AuthenticationService.js';
import { postAuthValidationRules } from './AuthenticationValidation.js';
import validate from '../../shared/validate.js';
import TokenAuthentication from '../../middleware/TokenAuthentication.js';

const router = express.Router();

router.post('/api/1.0/auth', postAuthValidationRules(), validate(), async (validation, request, response, next) => {
  try {
    if (validation.extractedErrors) throw { validation: validation.extractedErrors };
    const ret = await AuthenticationService.login(request.body);
    return response.send(ret);
  } catch (error) {
    return next(error);
  }
});

router.post('/api/1.0/logout', TokenAuthentication, async (request, response, next) => {
  try {
    await AuthenticationService.logout(request.userPointer);
    return response.send();
  } catch (error) {
    return next(error);
  }
});

export default router;
