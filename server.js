const express = require('express');
const fs = require('fs');
const path = require('path');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

app.post('/api/recibir', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const geo = geoip.lookup(ip) || null;

  const ua = new UAParser(req.body.userAgent || '');
  const deviceInfo = ua.getResult();

  const visita = {
    nombre: 'Visitante',
    ip,
    hora: new Date().toISOString(),
    userAgent: req.body.userAgent || '',
    navegador: deviceInfo.browser.name + ' ' + deviceInfo.browser.version,
    sistemaOperativo: deviceInfo.os.name + ' ' + deviceInfo.os.version,
    plataforma: deviceInfo.device.vendor || 'Desconocida',
    dispositivoTipo: deviceInfo.device.type || 'desktop',
    dispositivoMarca: deviceInfo.device.vendor || 'Desconocida',
    dispositivoModelo: deviceInfo.device.model || 'Desconocido',
    resolucion: req.body.resolucion || '',
    devicePixelRatio: req.body.devicePixelRatio,
    idioma: req.body.idioma,
    zonaHoraria: req.body.zonaHoraria,
    referrer: req.body.referrer || '',
    coords: req.body.coords || null,
    tipoRed: req.body.tipoRed || null,
    cookiesHabilitadas: req.body.cookiesHabilitadas || null,
    soportaLocal: req.body.soportaLocal || null,
    soportaSession: req.body.soportaSession || null,
    pestañaActiva: req.body.pestañaActiva || null,
    bateria: req.body.bateria || null,
    almacenamiento: req.body.almacenamiento || null,
    esBot: req.body.esBot || false,
    socialFromReferrer: req.body.socialFromReferrer || null,
    socialFromUA: req.body.socialFromUA || null,
    ubicacion: geo,
    duracion: req.body.duracion || 0
  };

  fs.appendFile(path.join(__dirname, 'visitas.log'), JSON.stringify(visita) + '\n', err => {
    if (err) console.error('Error al guardar visita:', err);
  });

  res.sendStatus(200);
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/api/visitas', (req, res) => {
  fs.readFile(path.join(__dirname, 'visitas.log'), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error leyendo visitas' });
    const visitas = data.trim().split('\n').map(l => JSON.parse(l)).reverse();
    res.json(visitas);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

