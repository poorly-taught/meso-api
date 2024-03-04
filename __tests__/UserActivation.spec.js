import request from 'supertest';
import { SMTPServer } from 'smtp-server';
import app from '../src/app';
import User from '../src/resources/user/User.js';

const validUser = {
  username: 'user2',
  email: 'user2@mail.com',
  password: 'pass@word'
};

const postUser = (user = validUser) => {
  return request(app).post('/api/1.0/users').send(user);
};

const postActivation = (token) => {
  return request(app).post(`/api/1.0/users/token/${token}`);
};

let server;

beforeAll(async () => {
  server = new SMTPServer({ authOptional: true });
  await server.listen(8587, '127.0.0.1');
});

afterAll(async () => {
  await server.close();
  await User.deleteMany();
});

describe('User Activation', () => {
  it('activates the account when correct token is sent', async () => {
    await postUser();
    let user = await User.findOne({ email: validUser.email });
    const token = user.activationToken;
    await postActivation(token);
    user = await User.findOne({ email: validUser.email });
    expect(user.inactive).toBe(false);
  });

  it('removes token from user table after successful activation', async () => {
    const user = await User.findOne({ email: validUser.email });
    expect(user.activationToken).toBe(null);
  });

  it('does not activate the account when incorrect token is sent', async () => {
    await postUser({ ...validUser, username: 'user3', email: 'real@mail.com' });
    const token = 'not-real-token';
    await postActivation(token);
    const user = await User.findOne({ email: 'real@mail.com' });
    expect(user.inactive).toBe(true);
  });

  it('returns 400 Unauthorized when token is incorrect', async () => {
    const token = 'not-real-token';
    const response = await postActivation(token);
    expect(response.status).toBe(400);
  });
});
