import { io } from "socket.io-client";
const socket = io.connect("http://10.0.0.8:3001");
export default socket;