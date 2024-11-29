const mongoose = require('mongoose');
const uri = process.env.DATABASE_URL;

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

export default async function connectMongoDB() {
  if (mongoose.connection.readyState === 1) {
    console.log("Already connected to MongoDB.");
    return;
  }

  try {
    await mongoose.connect(uri!, clientOptions);
    console.log("Connected to MongoDB.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error("Database connection failed.");
  }
}
