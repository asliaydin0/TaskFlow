import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to TaskFlow API',
  });
});

app.use('/api/health', healthRouter);

app.use(errorHandler);

export default app;
