const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Define los links de TikTok que quieres usar para redirigir
const linksTikTok = {
  reyganzo: 'https://www.tiktok.com/@reyganzo69/video/7482119548657732870?is_from_webapp=1&sender_device=pc'
};

app.get('/:codigo', (req, res) => {
  const codigo = req.params.codigo || 'anonimo';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const hora = new Date().toISOString();
  const navegador = req.headers['user-agent'] || 'Desconocido';

  const registro = {
    codigo,
    ip,
    hora,
    navegador,
  };

  fs.appendFile(path.join(__dirname, 'visitas.log'), JSON.stringify(registro) + '\n', err => {
    if (err) {
      console.error('Error guardando registro:', err);
    }
    const destino = linksTikTok[codigo] || 'https://www.tiktok.com';
    res.redirect(destino);
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

