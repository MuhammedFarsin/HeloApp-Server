import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from "http";
import cors from "cors";
import userRoute from "./Routes/userRoute";
import adminRoute from "./Routes/adminRoute";
import { createSocketServer } from "./socket"
import { attachSocket } from "./Middleware/AttachSocket"

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = createSocketServer(server)
// Create Socket.IO server

const port = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URL as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: unknown) => console.error('Failed to connect to MongoDB', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(attachSocket(io))
app.use('/', userRoute);
app.use('/admin', adminRoute);

server.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});