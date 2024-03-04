import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const Schema = mongoose.Schema;

const routineSchema = new Schema({
  pointer: {
    type: String,
    default: () => nanoid(10)
  },
  userPointer: String,
  name: String,
  description: String,
  exercises: [
    {
      exerciseId: Schema.ObjectId,
      sets: [{ reps: Number }]
    }
  ],
  tags: [String],
  createdAt: {
    type: Date,
    default: () => new Date()
  },
  updatedAt: Date
});

const Routine = mongoose.model('Routine', routineSchema);

export default Routine;
