import mongoose from 'mongoose';
import config from 'config';

const database = config.get('database');
const { url, dbName } = database;

const initializeDb = async () => {
  try {
    await mongoose.connect(`${url}/${dbName}`);
    // console.log(`Successfully connected to ${url}/${dbName}`);
  } catch (error) {
    console.error(error);
  }
};

export default initializeDb;
