import expressValidator from 'express-validator';

const { body, validationResult } = expressValidator;

const postAuthValidationRules = () => {
  return [
    body('username').not().isEmpty().withMessage('Username cannot be null.'),
    body('password').notEmpty().withMessage('Password cannot be null.').bail()
  ];
};

const validate = () => (request, response, next) => {
  const errors = validationResult(request);
  if (errors.isEmpty()) {
    return next({});
  }

  const extractedErrors = {};
  errors.array().map((error) => (extractedErrors[error.path] = error.msg));

  return next({ extractedErrors });
};

export { postAuthValidationRules, validate };
