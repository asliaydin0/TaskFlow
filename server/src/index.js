import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

async function startServer() {
  try {
    if (!env.jwtSecret) {
      throw new Error('JWT_SECRET is not defined in .env');
    }

    await prisma.$connect();
    console.log('Database connection established.');

    app.listen(env.port, () => {
      console.log(`TaskFlow server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
