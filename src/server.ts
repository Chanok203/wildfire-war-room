import path from 'path';
import express from 'express';
import nunjucks from 'nunjucks';
import cors from 'cors';
import morgan from 'morgan';

import { config } from './config';
import { sessionConfig } from './lib/session';
import { authRouter } from './routes/auth.route';
import { isAuthenticated } from './middlewares/auth.middleware';
import { missionRouter } from './routes/mission.route';
import { apiKeyRouter } from './routes/api-key.route';
import { userRouter } from './routes/user.route';

const app = express();
nunjucks.configure(path.join(__dirname, '..', 'views'), {
    noCache: true,
    autoescape: true,
    express: app,
});

app.use(cors());
app.use(morgan('combined'));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use(express.urlencoded());
app.use(express.json());
app.use(sessionConfig);

app.use('/auth', authRouter);
app.use('/mission', missionRouter);
app.use('/api-key', isAuthenticated, apiKeyRouter);
app.use('/user', isAuthenticated, userRouter);

app.get('/', (req, res) => {
    return res.redirect('/mission');
});

app.listen(config.port, config.host, () => {
    console.log(`Server is running at http://${config.host}:${config.port}`);
});
