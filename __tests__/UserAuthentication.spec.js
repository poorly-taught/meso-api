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

const validCredentials = {
  username: 'user2',
  password: 'pass@word'
};

const postLogin = (credentials = validCredentials) => {
  return request(app).post('/api/1.0/auth').send(credentials);
};

const postLogout = (token) => {
  const agent = request(app).post('/api/1.0/logout');
  agent.set('Authorization', `Bearer ${token}`);
  return agent.send();
};

beforeEach(async () => {
  await User.deleteMany();
});

afterEach(async () => {
  await User.deleteMany();
  await Token.deleteMany();
});

describe('User Authentication', () => {
  it('returns 200 OK when login request is valid', async () => {
    await addUser();
    const response = await postLogin();
    expect(response.status).toBe(200);
  });

  it('returns token when login request is valid', async () => {
    await addUser();
    const response = await postLogin();
    const body = response.body;
    expect(body.token).not.toBeUndefined();
  });

  it('returns 401 Unauthorized when password is incorrect', async () => {
    const response = await postLogin({
      ...validCredentials,
      password: 'incorrect'
    });

    expect(response.status).toBe(401);
  });

  it('returns 401 Unauthorized when user does not exist', async () => {
    const response = await postLogin({
      ...validCredentials,
      username: 'doesNotExist'
    });
    expect(response.status).toBe(401);
  });

  it.each`
    field         | value   | expectedMessage
    ${'username'} | ${null} | ${'Username cannot be null.'}
    ${'password'} | ${null} | ${'Password cannot be null.'}
  `('returns "$expectedMessage" when $field is $value', async ({ field, expectedMessage, value }) => {
    const response = await postLogin({
      ...validCredentials,
      [field]: value
    });

    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  it('adds token to table when login is successful', async () => {
    await addUser();
    const login = await postLogin();
    const token = login.body.token;
    const tokenInDb = await Token.findOne({ token });
    expect(tokenInDb).not.toBe(null);
  });

  it('returns 200 OK when logout request is successful', async () => {
    await addUser();
    const login = await postLogin();
    const token = login.body.token;
    const logout = await postLogout(token);
    expect(logout.status).toBe(200);
  });

  it('removes tokens from table when logout is successful', async () => {
    await addUser();
    const login = await postLogin();
    const token = login.body.token;
    await postLogout(token);
    const tokenInDb = await Token.findOne({ token });
    expect(tokenInDb).toBe(null);
  });
});
