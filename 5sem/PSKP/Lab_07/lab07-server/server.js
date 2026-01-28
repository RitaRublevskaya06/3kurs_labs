import http from 'http';
import { createServerHandler } from './m07-01.js';

const PORT = 3000;
const STATIC_DIR = './static';

const handler = createServerHandler(STATIC_DIR);

const server = http.createServer(handler);

server.listen(PORT, () => {
  console.log(`Server is running at: http://localhost:${PORT}`);
});
