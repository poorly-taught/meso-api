import expressValidator from 'express-validator';

const { body } = expressValidator;

const postAuthValidationRules = () => {
  return [
    body('username').not().isEmpty().withMessage('Username cannot be null.'),
    body('password').notEmpty().withMessage('Password cannot be null.').bail()
  ];
};

export { postAuthValidationRules };
