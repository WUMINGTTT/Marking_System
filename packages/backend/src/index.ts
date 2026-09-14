import express from 'express';
import eventsRouter from './routes/event';
import usersRouter from './routes/user';
import teamsRouter from './routes/team';
import scoresRouter from './routes/score';

const app = express();

// 解析 JSON 请求体
app.use(express.json());

// 挂载路由
app.use('/api/events', eventsRouter);
app.use('/api/users', usersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/scores', scoresRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

const PORT = Number(process.env.PORT) || 3000;
const IP = process.env.IP || '127.0.0.1';

app.listen(PORT, IP, () => {
  console.log(`服务器运行在：http://${IP}:${PORT}`);
});
