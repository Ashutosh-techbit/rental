import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let client = null;
let db = null;

export const connectDB = async () => {
  if (db) return db;
  
  try {
    const uri = process.env.DATABASE_URL;
    if (!uri) {
      throw new Error('DATABASE_URL not set in .env file');
    }
    
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('rental');
    
    console.log('MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

export const closeDB = async () => {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('MongoDB disconnected');
  }
};

export { ObjectId };
