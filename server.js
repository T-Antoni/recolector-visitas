// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const geoip = require('geoip-lite');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Recibir datos del visitante
app.post('/api/registrar', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const geo = geoip.lookup(ip) || null;
    const datos = {
      ...req.body,
      ip,
      hora: new Date().toISOString(),
      ubicacion: geo,
    };

    fs.appendFileSync('visitas.log', JSON.stringify(datos) + '\n');
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar la visita' });
  }
});

// API para ver las visitas
app.get('/api/visitas', (req, res) => {
  const filePath = path.join(__dirname, 'visitas.log');
  if (!fs.existsSync(filePath)) return res.json([]);

  const lines = fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  res.json(lines);
});

// Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

