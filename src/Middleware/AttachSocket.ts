import { Request, Response, NextFunction } from "express";
import { Server as SocketServer } from "socket.io";

export const attachSocket = (io: SocketServer) => {
  return (req: Request & { io?: SocketServer }, res: Response, next: NextFunction) => {
    req.io = io;
    next();
  };
};
