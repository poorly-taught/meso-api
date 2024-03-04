import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/app';
import User from '../src/resources/user/User';
import Token from '../src/services/token/Token';
import Routine from '../src/resources/routine/Routine';

const validUser = {
  username: 'user2',
  email: 'user2@mail.com',
  password: 'pass@word'
};

const addUser = async (user = validUser) => {
  const newUser = new User(user);
  const hash = await bcrypt.hash(newUser.password, 10);
  newUser.password = hash;
  const ret = await newUser.save();
  return ret;
};

const postLogin = () => {
  const { username, password } = validUser;
  return request(app).post('/api/1.0/auth').send({
    username,
    password
  });
};

const getRoutines = async (page = 1, limit = 10, filter = null, query = null) => {
  const agent = request(app).get(
    `/api/1.0/routines${page ? `?page=` + page : ''}${limit ? '&limit=' + limit : ''}${filter ? '&filter=' + filter : ''}${query ? '&query=' + query : ''}`
  );
  agent.set('Authorization', `Bearer ${token}`);
  return agent.send();
};

const postRoutines = async (routine) => {
  const agent = request(app).post(`/api/1.0/routines`);
  agent.set('Authorization', `Bearer ${token}`);
  return agent.send(routine);
};

const getExercises = async (page = 1, limit = 10, filter = null, query = null) => {
  const agent = request(app).get(
    `/api/1.0/exercises${page ? `?page=` + page : ''}${limit ? '&limit=' + limit : ''}${filter ? '&filter=' + filter : ''}${query ? '&query=' + query : ''}`
  );
  agent.set('Authorization', `Bearer ${token}`);
  return agent.send();
};

// let user;
let token;
let userPointer;
let routine;

beforeAll(async () => {
  await addUser();
  const login = await postLogin();
  token = login.body.token;

  const exercisesResponse = await getExercises();
  const exercisesIds = exercisesResponse.body.items.map((e) => e._id);
  const userToken = await Token.findOne({ token });
  userPointer = userToken.userPointer;
  routine = {
    userPointer,
    name: 'test',
    description: 'test',
    exercises: exercisesIds.map((eid) => {
      return {
        exercisesId: eid,
        sets: [{ reps: 10 }]
      };
    }),
    tags: 'test'
  };
});

afterAll(async () => {
  await User.deleteMany();
  await Token.deleteMany();
});

describe('Routine', () => {
  it(`returns 200 OK when a valid get request is sent`, async () => {
    const response = await getRoutines();
    expect(response.status).toBe(200);
  });

  it('returns items and pagination object when valid request is sent without query', async () => {
    const response = await getRoutines();
    const body = response.body;
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.pagination).not.toBe(null);
  });

  it('returns items and pagination object when valid request is sent without query', async () => {
    const response = await getRoutines();
    const body = response.body;
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.pagination).not.toBe(null);
  });

  it.each`
    filter           | query            | page   | limit
    ${'name'}        | ${'bench press'} | ${'1'} | ${'10'}
    ${'name'}        | ${'arm'}         | ${'2'} | ${'10'}
    ${'description'} | ${'Strength'}    | ${'1'} | ${'10'}
    ${'createdAt'}   | ${'Plyometrics'} | ${'2'} | ${'10'}
  `(
    'filtering on "$filter" for "$query" should return items array and correct pagination object.',
    async ({ filter, query, page, limit }) => {
      const response = await getRoutines(page, limit, filter, query);
      const body = response.body;
      expect(body.items.length).not.toBeUndefined();
      expect(body.pagination.current).toBe(page);
      expect(body.pagination.itemsPerPage).toBe(limit);
    }
  );

  it('post returns 200 when valid request is sent', async () => {
    const response = await postRoutines(routine);
    console.log(response.body);
    expect(response.status).toBe(200);
  });

  it('creates routine for user when valid request is sent', async () => {
    await postRoutines(routine);
    const [userRoutine] = await Routine.find({ userPointer });
    expect(userRoutine.exercises).not.toBeUndefined();
  });

  it('returns 400 when invalid request is sent', async () => {
    const invalidRoutine = { ...routine };
    invalidRoutine.exercises = [];
    const response = await postRoutines(invalidRoutine);
    expect(response.status).toBe(400);
  });
});
