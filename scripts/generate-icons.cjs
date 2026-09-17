const http = require('http');
const fs = require('fs');
const path = require('path');

const pomoDinoPath = path.join(__dirname, '../public/pomo-dino.png');
const pomoDinoBase64 = fs.readFileSync(pomoDinoPath).toString('base64');

const html = `<!DOCTYPE html>
<html>
<head><title>Generate Icons</title></head>
<body style="background:#333; color:#fff; font-family:sans-serif; text-align:center; padding:20px;">
  <h2>Generating PWA Icons...</h2>
  <div id="status">Loading...</div>
  <script>
    const base64Src = 'data:image/png;base64,${pomoDinoBase64}';
    const img = new Image();
    img.onload = () => {
      const sizes = [
        { name: 'pwa-512x512.png', size: 512, paddingRatio: 0.10 },
        { name: 'pwa-192x192.png', size: 192, paddingRatio: 0.10 },
        { name: 'apple-touch-icon.png', size: 180, paddingRatio: 0.08 },
        { name: 'favicon.png', size: 64, paddingRatio: 0.06 },
        { name: 'logo.png', size: 512, paddingRatio: 0.10 }
      ];

      const results = {};

      for (const item of sizes) {
        const canvas = document.createElement('canvas');
        canvas.width = item.size;
        canvas.height = item.size;
        const ctx = canvas.getContext('2d');
        
        // 1. Solid pure white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, item.size, item.size);

        // 2. High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 3. Draw image centered with safe zone padding
        const pad = Math.round(item.size * item.paddingRatio);
        const drawSize = item.size - (pad * 2);
        ctx.drawImage(img, pad, pad, drawSize, drawSize);

        results[item.name] = canvas.toDataURL('image/png');
      }

      document.getElementById('status').innerText = 'Sending to server...';

      fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results)
      })
      .then(res => res.json())
      .then(data => {
        document.getElementById('status').innerText = 'Done! All icons successfully created.';
      })
      .catch(err => {
        document.getElementById('status').innerText = 'Error: ' + err.message;
      });
    };
    img.src = base64Src;
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const publicDir = path.join(__dirname, '../public');
        for (const [filename, dataUrl] of Object.entries(payload)) {
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          const filePath = path.join(publicDir, filename);
          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          console.log(`Saved ${filename} (${fs.statSync(filePath).size} bytes)`);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        console.log('ALL ICONS SAVED SUCCESSFULLY!');
        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 1000);
      } catch (err) {
        console.error('Save error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(4567, () => {
  console.log('Icon generation server listening on http://localhost:4567');
});
