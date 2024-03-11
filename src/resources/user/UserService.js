import User from './User.js';
import bcrypt from 'bcrypt';
import generator from '../../shared/generator.js';
// import EmailService from '../../services/email/EmailService.js';
// import EmailException from '../../exceptions/EmailException.js';
import UserException from '../../exceptions/UserException.js';
import InvalidTokenException from '../../exceptions/InvalidTokenException.js';

const save = async (body) => {
  delete body.inactive;

  const activationToken = generator.randomString(16);

  let user;

  try {
    const password = await bcrypt.hash(body.password, 10);
    user = new User({
      ...body,
      password,
      activationToken
    });
  } catch (error) {
    throw new UserException();
  }

  // try {
  //   await EmailService.sendAccountActivation(body.email, activationToken);
  // } catch (error) {
  //   throw new EmailException();
  // }

  try {
    await user.save();
  } catch (error) {
    throw new UserException();
  }
};

const activate = async (token) => {
  try {
    const user = await User.findOne({ activationToken: token });
    user.inactive = false;
    user.activationToken = null;
    await user.save();
  } catch (error) {
    throw new InvalidTokenException();
  }
};

export default { save, activate };
