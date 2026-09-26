import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import fieldsRouter from './routes/fields.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const app: Express = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow client during hackathon development
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'FarmMitra AI API Server',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/fields', fieldsRouter);
app.use('/api/ai', aiRouter);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

export default app;
