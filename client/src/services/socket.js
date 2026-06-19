

import { io } from "socket.io-client";

const socket = io(
  "https://video-call-app1009192.onrender.com"
);

export default socket;

