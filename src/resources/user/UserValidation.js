import expressValidator from 'express-validator';
import User from './User.js';

const { body, validationResult } = expressValidator;

const postUserValidationRules = () => {
  return [
    body('username')
      .not()
      .isEmpty()
      .withMessage('Username cannot be null.')
      .bail()
      .isLength({ min: 4, max: 32 })
      .withMessage('Username must have min 4 and max 32 characters.')
      .bail()
      .custom(async (username) => {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          throw new Error('Username is already in use.');
        }
      }),
    body('email')
      .notEmpty()
      .withMessage('Email cannot be null.')
      .bail()
      .isEmail()
      .withMessage('Email is invalid.')
      .bail()
      .custom(async (email) => {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error('Email is already in use.');
        }
      })
      .bail(),
    body('password')
      .notEmpty()
      .withMessage('Password cannot be null.')
      .bail()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.')
      .bail()
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

export { postUserValidationRules, validate };
