import generator from '../../shared/generator.js';
import Token from './Token.js';

const getToken = async (userPointer) => {
  const tokens = await Token.find({ userPointer });
  if (tokens.length === 0) {
    const token = generator.randomString(32);
    await Token.create({
      token,
      userPointer
    });

    return { token };
  }

  return {
    token: tokens[0].token
  };
};

const verifyToken = async (token) => {
  try {
    const tokenInDb = await Token.findOne({ token });
    if (!tokenInDb) throw new Error();
    const userPointer = tokenInDb.userPointer ? tokenInDb.userPointer : null;
    return { userPointer };
  } catch (error) {
    throw new Error();
  }
};

const removeToken = async (userPointer) => {
  try {
    await Token.deleteOne({ userPointer });
  } catch (error) {
    throw new Error();
  }
};

export default {
  getToken,
  verifyToken,
  removeToken
};
