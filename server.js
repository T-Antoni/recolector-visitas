const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

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
  const { navegador, nombre, ubicacion } = req.body;

  const registro = {
    ip,
    hora,
    navegador,
    nombre,
    ubicacion,
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

// Ruta para mostrar visitas como HTML
app.get('/visitas', (req, res) => {
  const logPath = path.join(__dirname, 'visitas.log');
  if (!fs.existsSync(logPath)) {
    return res.send('<h2>No hay registros todavía</h2>');
  }

  const registros = fs.readFileSync(logPath, 'utf8')
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => JSON.parse(line));

  let html = `
    <html>
    <head>
      <title>Visitas Registradas</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border: 1px solid #ccc; }
        th { background-color: #f4f4f4; }
      </style>
    </head>
    <body>
      <h2>Visitas Registradas</h2>
      <table>
        <tr>
          <th>IP</th><th>Hora</th><th>Navegador</th><th>Nombre</th><th>Ubicación</th>
        </tr>
  `;

  registros.forEach(r => {
    html += `<tr>
      <td>${r.ip || ''}</td>
      <td>${r.hora || ''}</td>
      <td>${r.navegador || ''}</td>
      <td>${r.nombre || ''}</td>
      <td>${r.ubicacion ? `${r.ubicacion.lat}, ${r.ubicacion.lon}` : ''}</td>
    </tr>`;
  });

  html += '</table></body></html>';
  res.send(html);
});

// Ruta para descargar el archivo de visitas
app.get('/descargar', (req, res) => {
  const filePath = path.join(__dirname, 'visitas.log');
  res.download(filePath, 'visitas.log', err => {
    if (err) {
      console.error('Error al descargar el archivo:', err);
      res.status(500).send('No se pudo descargar el archivo.');
    }
  });
});

// Ruta de prueba para ver si el servidor responde
app.get('/test', (req, res) => {
  res.send('Servidor activo');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

