<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Recolección</title>
</head>
<body>
  <script>
    fetch('/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        navegador: navigator.userAgent,
        nombre: 'Visitante'
      })
    }).finally(() => {
      window.location.href = 'https://www.tiktok.com/@reyganzo69/video/7482119548657732870?is_from_webapp=1&sender_device=pc';
    });
  </script>
  <p>Recolectando visita...</p>
</body>
</html>

