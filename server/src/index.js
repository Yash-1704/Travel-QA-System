import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import chatRouter from './routes/chat.js';
import casesRouter from './routes/cases.js';
import { connect as connectDb } from './services/db.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Mount routes
app.use('/api/chat', chatRouter);
app.use('/api/cases', casesRouter);

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
