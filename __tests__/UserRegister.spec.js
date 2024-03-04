import request from 'supertest';
import app from '../src/app';
import User from '../src/resources/user/User.js';
import { SMTPServer } from 'smtp-server';

const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'pass@word'
};

const postUser = (user = validUser) => {
  return request(app).post('/api/1.0/users').send(user);
};

let lastMail;
let server;
let simulateSmtpFailure = false;

beforeAll(async () => {
  server = new SMTPServer({
    authOptional: true,
    onData(stream, session, callback) {
      let mailBody;
      stream.on('data', (data) => {
        mailBody += data.toString();
      });
      stream.on('end', () => {
        if (simulateSmtpFailure) {
          const error = new Error('Invalid mailbox');
          error.responseCode = 553;
          return callback(error);
        }
        lastMail = mailBody;
        callback();
      });
    }
  });

  await server.listen(8587, '127.0.0.1');
});

beforeEach(async () => {
  simulateSmtpFailure = false;
  await User.deleteMany();
});

afterAll(async () => {
  await server.close();
  await User.deleteMany();
});

describe('User Registration', () => {
  it('returns 200 OK when signup request is valid', async () => {
    const response = await postUser();
    expect(response.status).toBe(200);
  });

  it('saves user to database', async () => {
    await postUser();
    const savedUser = await User.findOne({ username: validUser.username });
    expect(savedUser.username).toBe(validUser.username);
    expect(savedUser.email).toBe(validUser.email);
  });

  it('hashes the password in database', async () => {
    await postUser();
    const savedUser = await User.findOne({ username: validUser.username });
    expect(savedUser.password).not.toBe('pass@word');
  });

  it('returns 400 when username is null', async () => {
    const newUser = Object.assign({}, validUser);
    delete newUser.username;
    const response = await postUser(newUser);
    expect(response.status).toBe(400);
  });

  it('returns validationErrors field in response body when validation error occurs', async () => {
    const newUser = Object.assign({}, validUser);
    delete newUser.username;
    const response = await postUser(newUser);
    const body = response.body;
    expect(body.validationErrors).not.toBeUndefined();
  });

  it('returns errors for both when username and email is null', async () => {
    const newUser = Object.assign({}, validUser);
    delete newUser.username;
    delete newUser.email;
    const response = await postUser(newUser);
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });

  it('creates user in inactive mode', async () => {
    await postUser();
    const savedUser = await User.findOne({ username: validUser.username });
    expect(savedUser.inactive).toBe(true);
  });

  it('creates user in active mode even when the request body contains inactive as false', async () => {
    const newUser = Object.assign({}, validUser);
    newUser.inactive = false;
    await postUser(newUser);
    const savedUser = await User.findOne({ username: newUser.username });
    expect(savedUser.inactive).toBe(true);
  });

  it('creates an activationToken for user', async () => {
    await postUser();
    const savedUser = await User.findOne({ username: validUser.username });
    expect(savedUser.activationToken).toBeTruthy();
  });

  it('send an account activation email with activationToken', async () => {
    await postUser();

    const savedUser = await User.findOne({ email: validUser.email });

    expect(lastMail).toContain(validUser.email);
    expect(lastMail).toContain(savedUser.activationToken);
  });

  it('returns 502 Bad Gateway when sending email fails', async () => {
    simulateSmtpFailure = true;
    const response = await postUser();
    expect(response.status).toBe(502);
  });

  it('does not save user to database if activation email fails', async () => {
    simulateSmtpFailure = true;
    await postUser();
    const users = await User.find();
    expect(users.length).toBe(0);
  });

  it.each`
    field         | value             | expectedMessage
    ${'username'} | ${null}           | ${'Username cannot be null.'}
    ${'username'} | ${'usr'}          | ${'Username must have min 4 and max 32 characters.'}
    ${'username'} | ${'a'.repeat(33)} | ${'Username must have min 4 and max 32 characters.'}
    ${'email'}    | ${null}           | ${'Email cannot be null.'}
    ${'email'}    | ${'@mail.com'}    | ${'Email is invalid.'}
    ${'password'} | ${null}           | ${'Password cannot be null.'}
    ${'password'} | ${'eight'}        | ${'Password must be at least 8 characters.'}
  `('returns "$expectedMessage" when $field is $value', async ({ field, expectedMessage, value }) => {
    const response = await postUser({
      ...validUser,
      [field]: value
    });

    const body = response.body;

    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  it('returns "Email already in use." when same email is being used', async () => {
    await User.create(validUser);
    const response = await postUser(validUser);
    const body = response.body;
    expect(body.validationErrors['email']).toBe('Email is already in use.');
  });

  it('returns "Username already in use." when same username is being used', async () => {
    const user = new User(validUser);
    await user.save();
    const response = await postUser({
      ...validUser,
      email: 'diff@mail.com'
    });

    const body = response.body;

    expect(body.validationErrors['username']).toBe('Username is already in use.');
  });

  it('returns errors for both username is null and email is in use', async () => {
    await User.create(validUser);
    const response = await postUser({
      ...validUser,
      username: null
    });

    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });
});
