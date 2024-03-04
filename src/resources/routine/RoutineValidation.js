import expressValidator from 'express-validator';

const { body } = expressValidator;

const postRoutineValidationRules = () => {
  return [
    body('name').not().isEmpty().withMessage('Name cannot be null.').bail(),
    body('exercises')
      .notEmpty()
      .withMessage('Exercises cannot be null.')
      .bail()
      .bail()
      .custom(async (exercises) => {
        const [exercise] = exercises;
        const [reps] = exercise.sets;
        if (!reps) {
          throw new Error('Exercise reps cannot be null');
        }
      })
      .bail()
  ];
};

export { postRoutineValidationRules };
