import express from 'express';

const app = express();

const PORT = 3000;
const IP = '127.0.0.1';

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, IP, () => {
  console.log(`服务器运行在：http://${IP}:${PORT}`);
  console.log(`局域网访问：http://${IP}:${PORT}`);
});
