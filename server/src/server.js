import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.info('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      process.exitCode = 1;
      return;
    }
  } else {
    console.warn('MONGODB_URI is not set; starting API without a database connection.');
  }

  app.listen(port, () => console.info(`API listening on http://localhost:${port}`));
}

startServer();
