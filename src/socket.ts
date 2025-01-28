import { Server as SocketServer } from "socket.io";
import http from "http";

export const createSocketServer = (server: http.Server) => {
  const io = new SocketServer(server, {
    cors: {
      origin: "http://localhost:5173", 
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // console.log("New client connected");
    socket.on("disconnect", () => {
    //   console.log("Client disconnected");
    });
  });

  return io;
};
