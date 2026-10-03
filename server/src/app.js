import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }));

app.get('/api/health', (_request, response) => {
  response.json({ success: true, message: 'API is running' });
});

app.use((_request, response) => {
  response.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(error.status ?? 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
  });
});

export default app;
