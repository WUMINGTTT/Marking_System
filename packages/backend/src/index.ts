import express from 'express';
import eventsRouter from './routes/events';
import usersRouter from './routes/users';

const app = express();
const PORT = 3000;
const IP = '127.0.0.1';

// 解析 JSON 请求体
app.use(express.json());

// 挂载路由
app.use('/api/events', eventsRouter);
app.use('/api/users', usersRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, IP, () => {
  console.log(`服务器运行在：http://${IP}:${PORT}`);
  console.log(`局域网访问：http://${IP}:${PORT}`);
});
