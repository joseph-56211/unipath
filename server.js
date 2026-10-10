require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const placesPath = path.join(__dirname, 'data', 'places.json');

app.disable('x-powered-by');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'WayUni', message: 'WayUni server is running.' });
});

app.get('/api/places', (_req, res) => {
  try {
    const places = JSON.parse(fs.readFileSync(placesPath, 'utf8'));
    res.set('Cache-Control', 'public, max-age=300');
    res.json(places);
  } catch (error) {
    console.error('Unable to read campus places:', error.message);
    res.status(500).json({ error: 'Campus place data is currently unavailable.' });
  }
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`WayUni is running at http://localhost:${PORT}`);
});
