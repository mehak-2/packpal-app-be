import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import destinationRoutes from "./routes/destinationRoutes.js";
import cityRoutes from "./routes/cityRoutes.js";
import countryRoutes from "./routes/countryRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";
import serverConfig from "./config/serverConfig.js";


const app = express();

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = serverConfig.corsOrigin.split(',').map(origin => origin.trim());
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: serverConfig.nodeEnv,
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.get("/test", (req, res) => {
  res.json({ 
    message: "Server is running!",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/invitations", invitationRoutes);

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(serverConfig.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true,
        w: "majority"
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        console.error("All MongoDB connection attempts failed. Exiting...");
        process.exit(1);
      }
      console.log(`Retrying in ${(i + 1) * 2} seconds...`);
      await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000));
    }
  }
};

const startServer = async () => {
  try {
    await connectDB();
    const PORT = serverConfig.port;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${serverConfig.nodeEnv}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
