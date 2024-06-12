import "dotenv/config";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";
import connectDB from "./db";
import {Chat} from "./chat";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

connectDB();

const chat = new Chat(io);

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
