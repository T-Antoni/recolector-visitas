const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Para evitar cache en navegador (opcional pero recomendado)
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Servir archivos estáticos desde 'public'
app.use(express.static('public'));

// Middleware para interpretar JSON
app.use(express.json());

// Ruta raíz: mostrar index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para recibir registros de visitas
app.post('/api/registro', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const hora = new Date().toISOString();
  const { navegador, nombre, ubicacion, resolucion, idioma, plataforma, referer, gps, red } = req.body;

  const registro = {
    ip,
    hora,
    navegador,
    nombre,
    ubicacion,
    resolucion,
    idioma,
    plataforma,
    referer,
    gps,
    red,
  };

  fs.appendFile(
    path.join(__dirname, 'visitas.log'),
    JSON.stringify(registro) + '\n',
    err => {
      if (err) {
        console.error('Error guardando registro:', err);
        return res.status(500).send('Error guardando registro');
      }
      res.send('Registro guardado');
    }
  );
});

// Ruta para mostrar el dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API para enviar las visitas en JSON
app.get('/api/visitas', (req, res) => {
  const visitasFile = path.join(__dirname, 'visitas.log');
  fs.readFile(visitasFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error leyendo visitas' });
    if (!data) return res.json([]);
    const visitas = data.trim().split('\n').map(line => JSON.parse(line));
    res.json(visitas);
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

