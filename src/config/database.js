import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const DB_URL = process.env.DB_URL || '';
const DB_NAME = process.env.DB_NAME || '';

const initializeDb = async () => {
  try {
    await mongoose.connect(`${DB_URL}/${DB_NAME}`);
    console.log(`Successfully connected to ${DB_URL}/${DB_NAME}`);
  } catch (error) {
    console.log(`Unable to connect to ${DB_URL}/${DB_NAME}`);
    console.error(error);
  }
};

export default initializeDb;
