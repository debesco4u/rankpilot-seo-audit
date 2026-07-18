import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDB } from './db';
import authRouter from './auth';
import auditRouter from './audit';
import subscriptionRouter from './subscription';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', authRouter);
app.use('/api/audit', auditRouter);
app.use('/api/subscription', subscriptionRouter);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.get('*', (_, res) => res.sendFile(path.join(publicPath, 'index.html')));

initDB();
app.listen(PORT, '0.0.0.0', () => console.log(`[SERVER] Running on port ${PORT}`));
