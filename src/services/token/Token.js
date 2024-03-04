import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  pointer: {
    type: String,
    default: () => nanoid(10)
  },
  token: String,
  userPointer: String
});

const Token = mongoose.model('Token', tokenSchema);

export default Token;
