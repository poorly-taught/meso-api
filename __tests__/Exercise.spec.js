import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/app';
import User from '../src/resources/user/User';
import Token from '../src/services/token/Token';

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

const getExercises = async (page = 1, limit = 10, filter = null, query = null) => {
  const agent = request(app).get(
    `/api/1.0/exercises${page ? `?page=` + page : ''}${limit ? '&limit=' + limit : ''}${filter ? '&filter=' + filter : ''}${query ? '&query=' + query : ''}`
  );
  agent.set('Authorization', `Bearer ${token}`);
  return agent.send();
};

// let user;
let token;

beforeAll(async () => {
  await addUser();
  const login = await postLogin();
  token = login.body.token;
});

afterAll(async () => {
  await User.deleteMany();
  await Token.deleteMany();
});

describe('Exercises', () => {
  it(`returns 200 OK when valid request is sent`, async () => {
    const response = await getExercises();
    expect(response.status).toBe(200);
  });

  it('returns items and pagination object when valid request is sent without query', async () => {
    const response = await getExercises();
    const body = response.body;
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.pagination).not.toBe(null);
  });

  it.each`
    filter         | query             | page   | limit
    ${'name'}      | ${'bench press'}  | ${'1'} | ${'10'}
    ${'name'}      | ${'arm'}          | ${'2'} | ${'10'}
    ${'type'}      | ${'Strength'}     | ${'1'} | ${'10'}
    ${'type'}      | ${'Plyometrics'}  | ${'2'} | ${'10'}
    ${'bodyPart'}  | ${'Chest'}        | ${'1'} | ${'10'}
    ${'bodyPart'}  | ${'Biceps'}       | ${'2'} | ${'10'}
    ${'equipment'} | ${'E-Z Curl Bar'} | ${'1'} | ${'10'}
    ${'equipment'} | ${'Dumbbell'}     | ${'2'} | ${'10'}
  `(
    'filtering on "$filter" for "$query" should return items and correct pagination object',
    async ({ filter, query, page, limit }) => {
      const response = await getExercises(page, limit, filter, query);
      const body = response.body;
      expect(body.items.length).not.toBe(0);
      expect(body.items[0][filter]).toContain(query);
      expect(body.pagination.current).toBe(page);
      expect(body.pagination.itemsPerPage).toBe(limit);
    }
  );
});
