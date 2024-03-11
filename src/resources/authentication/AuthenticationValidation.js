import expressValidator from 'express-validator';

const { body } = expressValidator;

const postAuthValidationRules = () => {
  return [
    body('username').isEmpty().withMessage('Username cannot be null.'),
    body('password').isEmpty().withMessage('Password cannot be null.').bail()
  ];
};

export { postAuthValidationRules };
