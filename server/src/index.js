import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { jsonBodyGuard, requireRole } from './middleware/auth.js';
import chatRouter from './routes/chat.js';
import casesRouter from './routes/cases.js';
import authRouter from './routes/auth.js';
import flightsRouter from './routes/flights.js';
import bookingsRouter from './routes/bookings.js';
import { connect as connectDb, getCollection } from './services/db.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(jsonBodyGuard);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/flights', flightsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/cases', casesRouter);

// Staff bookings endpoint: GET /api/staff/bookings (agent only, read-only)
app.get('/api/staff/bookings', requireRole('agent'), async (req, res) => {
  try {
    const bookingsCol = getCollection('bookings');
    const bookings = await bookingsCol.find({}).sort({ createdAt: -1 }).toArray();
    return res.json({ bookings });
  } catch (err) {
    console.error('Staff bookings fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch staff bookings' });
  }
});

const PORT = config.PORT || 3001;

// Only start listening if run directly
if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  connectDb()
    .then(() => {
      console.log('MongoDB connected and indexes verified');
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1);
    });
}

export default app;
