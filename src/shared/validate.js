import expressValidator from 'express-validator';

const { validationResult } = expressValidator;

export default (request, response, next) => {
    const errors = validationResult(request);
    if (errors.isEmpty()) {
      return next({});
    }
  
    const extractedErrors = {};
    errors.array().map((error) => (extractedErrors[error.path] = error.msg));
  
    return next({ extractedErrors });
}