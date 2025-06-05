const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para registrar visitas
app.post('/api/registro', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const hora = new Date().toISOString();
  const {
    navegador,
    idioma,
    plataforma,
    resolucion,
    referrer,
    coords,
    tipoRed,
    zonaHoraria,
    nombre,
    ubicacion,
    duracion
  } = req.body;

  const registro = {
    ip,
    hora,
    navegador,
    idioma,
    plataforma,
    resolucion,
    referrer,
    coords,
    tipoRed,
    zonaHoraria,
    nombre,
    ubicacion,
    duracion
  };

  // Mostrar en consola de forma ordenada
  console.log('\n📥 Nueva visita registrada:');
  console.log(`📌 IP: ${ip}`);
  console.log(`🕒 Hora: ${hora}`);
  console.log(`🌐 Navegador: ${navegador}`);
  console.log(`💬 Idioma: ${idioma}`);
  console.log(`🖥️ Plataforma: ${plataforma}`);
  console.log(`📏 Resolución: ${resolucion}`);
  console.log(`🌍 Zona horaria: ${zonaHoraria}`);
  console.log(`🔗 Referer: ${referrer || 'Directo'}`);
  console.log(`📶 Tipo de red: ${tipoRed || 'Desconocida'}`);
  console.log(`📍 Coordenadas: ${coords ? `${coords.lat}, ${coords.lon}` : 'No disponible'}`);
  console.log(`⏱️ Duración (s): ${duracion}`);
  console.log('--------------------------------------------');

  // Guardar en archivo visitas.log
  fs.appendFile(
    path.join(__dirname, 'visitas.log'),
    JSON.stringify(registro) + '\n',
    err => {
      if (err) {
        console.error('❌ Error guardando registro:', err);
        return res.status(500).send('Error guardando registro');
      }
      res.send('Registro guardado');
    }
  );
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor funcionando en http://localhost:${port}`);
});

