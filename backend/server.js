import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import app from './app.js';
import { initSocket } from './socket/socketHandler.js';

dotenv.config();
connectDB();

const httpServer = createServer(app);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

export const io = new Server(httpServer, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);
initSocket(io);

const PORT = process.env.PORT || 5000;
httpServer.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other server or set a different PORT in .env.`);
    console.error(`On Windows, check it with: netstat -ano | findstr :${PORT}`);
    process.exit(1);
  }

  throw error;
});

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
