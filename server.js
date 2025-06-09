const express = require('express');
const fs = require('fs');
const path = require('path');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json({ limit: '2mb' }));

app.post('/api/recibir', (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '';
  const geo = geoip.lookup(ip) || null;

  console.log('POST /api/recibir llamada desde IP:', ip);
  console.log('Cuerpo recibido:', req.body);

  const visita = {
    nombre: 'Visitante',
    ip,
    geo,
    hora: new Date().toISOString(),
    ...req.body,
  };

  fs.appendFile(path.join(__dirname, 'visitas.log'), JSON.stringify(visita) + '\n', err => {
    if (err) {
      console.error('Error al guardar visita:', err);
      return res.status(500).send('Error al guardar visita');
    }
    console.log('Visita guardada');
    res.sendStatus(200);
  });
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/api/visitas', (req, res) => {
  fs.readFile(path.join(__dirname, 'visitas.log'), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error leyendo visitas' });
    const visitas = data.trim().split('\n').filter(Boolean).map(l => JSON.parse(l)).reverse();
    res.json(visitas);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

