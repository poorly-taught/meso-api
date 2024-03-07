import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const DB_URL = process.env.DB_URL || '';
const DB_USERNAME = process.env.DB_USERNAME || '';
const DB_PW = process.env.DB_PW || '';

const initializeDb = async () => {
  try {
    await mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_PW}@${DB_URL}`);
    console.log(`Successfully connected to ${DB_URL}`);
  } catch (error) {
    console.log(`Unable to connect to ${DB_URL}`);
    console.error(error);
  }
};

export default initializeDb;
