import { io } from "socket.io-client";
const socket = io.connect("http://54.161.154.243");
export default socket;