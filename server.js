const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Servir archivos estáticos desde 'public'
app.use(express.static('public'));

// Middleware para interpretar JSON en requests POST
app.use(express.json());

// Ruta raíz: servir index.html para registro y redirección
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para recibir datos de visitas
app.post('/api/registro', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const hora = new Date().toISOString();
  const { navegador, nombre, ubicacion } = req.body;

  const registro = {
    ip,
    hora,
    navegador,
    nombre,
    ubicacion: ubicacion || null,
  };

  // Guardar registro en archivo (añadiendo al final)
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

// Ruta para testear servidor vivo
app.get('/test', (req, res) => {
  res.send('Servidor está vivo y respondiendo!');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

