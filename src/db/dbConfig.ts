import mongoose from 'mongoose';

let isConnected = false; 

export async function connect() {
  if (isConnected) {
    // Already connected, skip reconnection
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    isConnected = true;

    const connection = mongoose.connection;

    connection.on('connected', () => {
      console.log("MongoDB connected successfully");
    });

    connection.on('error', (err) => {
      console.error("MongoDB connection error:", err);
      process.exit();
    });
  } catch (error) {
    console.error("Error connecting to MongoDB");
    console.error(error);
  }
}
