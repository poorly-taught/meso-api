import express from 'express';
import cors from 'cors';
import initializeDb from './config/database.js';
import userRouter from './resources/user/UserRouter.js';
import authenticationRouter from './resources/authentication/AuthenticationRouter.js';
import exerciseRouter from './resources/exercise/ExerciseRouter.js';
import routineRouter from './resources/routine/RoutineRouter.js';
import ErrorHandler from './middleware/ErrorHandler.js';

initializeDb();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  })
);

app.use((request, response, next) => {
  console.log(request.method, request.path);
  next();
});

app.use(userRouter);
app.use(authenticationRouter);
app.use(exerciseRouter);
app.use(routineRouter);

app.use(ErrorHandler);

export default app;
