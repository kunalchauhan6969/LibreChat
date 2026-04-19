import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/api', chatRouter);
app.get('/health', (_, res) => res.json({ status: 'ok', app: 'Yahavi.AI' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Yahavi.AI server running on http://localhost:${PORT}\n`);
});
