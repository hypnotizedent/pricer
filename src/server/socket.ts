import { Server } from "socket.io";
import { NextApiResponse } from "next";
import pricingRouter from "./routers/pricingRouter";

let io: Server;
export default function handler(req: any, res: NextApiResponse) {
  if (!res.socket.server.io) {
    io = new Server(res.socket.server);
    res.socket.server.io = io;
    io.on("connection", (socket) => {
      socket.on("calculate", (data) => {
        pricingRouter.createCaller({})(data).then((result: any) => {
          socket.emit("priceUpdate", result);
        });
      });
    });
  }
  res.end();
}
