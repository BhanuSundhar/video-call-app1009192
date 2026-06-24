

import { io } from "socket.io-client";

const socket = io(
  import.meta.env.VITE_SOCKET_URL ||
    "https://video-call-app1009192.onrender.com",
  {
    transports: ["websocket"],
  }
);

export default socket;

