import { io } from 'socket.io-client';

const socket = io(`${import.meta.env.VITE_API_URL}`, {
  reconnection: true,
  reconnectionDelay: 1000,
});

export default socket;
