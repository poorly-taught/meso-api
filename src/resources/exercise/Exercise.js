import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ExerciseSchema = new Schema({
  _id: String,
  name: String,
  description: String,
  type: String,
  bodyPart: String,
  equipment: String,
  level: String,
  rating: Number
});

const Exercise = mongoose.model('Exercise', ExerciseSchema);

export default Exercise;
