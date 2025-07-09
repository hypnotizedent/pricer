import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;
export function useSocket(onPrice: (data: any) => void) {
  useEffect(() => {
    socket = io();
    socket.on("priceUpdate", onPrice);
    return () => {
      socket.disconnect();
    };
  }, []);
  return (inputs: any) => socket.emit("calculate", inputs);
}
