const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/registro', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const hora = new Date().toISOString();
  const { navegador, nombre } = req.body || {};

  const registro = {
    ip,
    hora,
    navegador: navegador || 'Desconocido',
    nombre: nombre || 'Anonimo',
  };

  fs.appendFile(path.join(__dirname, 'visitas.log'), JSON.stringify(registro) + '\n', err => {
    if (err) {
      console.error('Error guardando registro:', err);
      return res.status(500).send('Error guardando registro');
    }
    res.send('Registro guardado');
  });
});

app.get('/test', (req, res) => {
  res.send('Servidor está vivo y respondiendo!');
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Recolector simple</title></head>
      <body>
        <h1>Recolectando visita...</h1>
        <script>
          fetch('/api/registro', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              navegador: navigator.userAgent,
              nombre: 'Visitante'
            })
          })
          .then(res => res.text())
          .then(console.log)
          .catch(console.error);
        </script>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log('Servidor escuchando en http://localhost:' + port);
});

