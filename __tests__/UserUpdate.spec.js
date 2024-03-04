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

const putUser = async (pointer, body = null, options = {}) => {
  let agent = request(app);

  let token;
  if (options.auth) {
    const response = await agent.post('/api/1.0/auth').send(options.auth);
    token = response.body.token;
  }

  if (options.token) {
    token = options.token;
  }

  agent = request(app).put(`/api/1.0/users/${pointer}`);
  if (token) {
    agent.set('Authorization', `Bearer ${token}`);
  }

  return agent.send(body);
};

beforeEach(async () => {
  await User.deleteMany();
  await Token.deleteMany();
});

afterAll(async () => {
  await User.deleteMany();
  await Token.deleteMany();
});

describe('User Update', () => {
  it('returns 401 Unauthorized when request is sent without token', async () => {
    const user = await addUser();
    const response = await putUser(user.pointer);
    expect(response.status).toBe(401);
  });

  it('returns 401 Unauthorized when request is sent with an invalid token', async () => {
    const user = await addUser();
    const response = await putUser(user.pointer, null, { token: '123' });
    expect(response.status).toBe(401);
  });

  it('returns 200 OK when request is sent with a valid token', async () => {
    const user = await addUser();
    const login = await postLogin();
    const token = login.body.token;
    const response = await putUser(user.pointer, null, {
      token
    });
    expect(response.status).toBe(200);
  });
});
