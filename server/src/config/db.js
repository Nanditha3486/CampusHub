import mongoose from 'mongoose';
import { memoryStore } from '../services/memoryStore.js';

let isMongoConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campushub';
  try {
    mongoose.set('strictQuery', true);
    // Short timeout so startup doesn't hang if MongoDB isn't running locally
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500,
    });
    isMongoConnected = true;
    console.log(`[Database] Successfully connected to MongoDB at: ${mongoURI}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB connection bypassed (${error.message}).`);
    console.warn(`[Database] Operating in In-Memory / Demo Store Mode. All features will work with mock seed data!`);
    await memoryStore.initialize();
  }
};

export const getDBStatus = () => ({
  isMongoConnected,
  mode: isMongoConnected ? 'MongoDB' : 'In-Memory Demo Mode',
});
