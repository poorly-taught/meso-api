import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  pointer: {
    type: String,
    default: () => nanoid(10)
  },
  username: String,
  email: { type: String, unique: true },
  password: String,
  inactive: { type: Boolean, default: true },
  activationToken: String
});

const User = mongoose.model('User', userSchema);

export default User;
