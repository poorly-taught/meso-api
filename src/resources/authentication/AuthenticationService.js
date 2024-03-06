import User from '../../resources/user/User.js';
import bcrypt from 'bcrypt';
import TokenService from '../../services/token/TokenService.js';
import AuthenticationException from '../../exceptions/AuthenticationException.js';

const login = async (body) => {
  try {
    const { username, password } = body;
    const user = await User.findOne({ username });
    const hash = user.password;
    const match = await bcrypt.compare(password, hash);
    if (match) {
      const token = await TokenService.createToken(user.pointer);
      return { token };
    }
  } catch (error) {
    throw new AuthenticationException();
  }
};

const logout = async (userPointer) => {
  try {
    await TokenService.removeToken(userPointer);
  } catch (error) {
    throw new AuthenticationException();
  }
};

export default {
  login,
  logout
};
