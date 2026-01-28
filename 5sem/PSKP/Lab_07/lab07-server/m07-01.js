import fs from 'fs';
import path from 'path';
import url from 'url';

const MIME_TYPES = {
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  png: 'image/png',
  docx: 'application/msword',
  json: 'application/json',
  xml: 'application/xml',
  mp4: 'video/mp4'
};

export function createServerHandler(staticDir) {
  return (req, res) => {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('405 Method Not Allowed');
      return;
    }

    let parsedUrl = url.parse(req.url);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === '/' || pathname === '') pathname = '/index.html';

    const filePath = path.join(staticDir, pathname);
    const ext = path.extname(filePath).substring(1);

    if (!MIME_TYPES[ext]) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 File Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] });
        res.end(data);
      }
    });
  };
}
