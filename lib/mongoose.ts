import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URI) {
    console.log('MongoDB URI not found');
  }

  if (isConnected) {
    return console.log('=> using existing database connection');
  }

  try {
    await mongoose.connect(String(process.env.MONGODB_URI));
    isConnected = true;
    console.log('=> new database connection');
  } catch (error) {
    console.log('=> error connecting to database:', error);
  }

}