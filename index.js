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
import invitationRoutes from "./routes/invitationRoutes.js";
import serverConfig from "./config/serverConfig.js";

const app = express();

app.use(cors({
  origin: serverConfig.corsOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/invitations", invitationRoutes);

mongoose.connect(serverConfig.mongoUri)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(serverConfig.port, () => {
            console.log(`Server running on port ${serverConfig.port}`);
        });
    })
    .catch(err => console.log(err));
