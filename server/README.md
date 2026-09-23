# Backend del formulario de Voluntariado

`procesar-voluntariado.php` recibe el envío del formulario de `/voluntariado`
y reenvía los datos por correo (con la hoja de vida en PDF como adjunto) a
la dirección de pruebas configurada. **No se guarda ninguna copia del PDF en
disco** — el correo es el único destino.

Este script **no vive en GitHub Pages** (hosting estático, no ejecuta PHP).
Se despliega en tu propio servidor con PHP cuando lo conectes.

## Pasos para activarlo

1. Sube esta carpeta (o solo el `.php`) a tu servidor PHP.
2. Instala PHPMailer con Composer, en el mismo directorio:
   ```
   composer require phpmailer/phpmailer
   ```
3. Configura las constantes al inicio del archivo:
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_PORT` — credenciales de tu
     cuenta de envío (nunca las subas al repositorio; usa variables de
     entorno o un `.env` fuera de control de versiones).
   - `ALLOWED_ORIGIN` — el origen exacto del sitio publicado (ya viene con
     `https://erzpublic-source.github.io`; ajústalo si cambia el dominio).
   - `DESTINATION_EMAIL` — ya apunta a `erzpubli@gmail.com` (correo de
     pruebas indicado).
4. En `src/pages/Voluntariado/Voluntariado.tsx`, cambia:
   ```ts
   const VOLUNTARIADO_ENDPOINT = ''
   ```
   por la URL pública del script, por ejemplo:
   ```ts
   const VOLUNTARIADO_ENDPOINT = 'https://tudominio.com/procesar-voluntariado.php'
   ```
   y vuelve a compilar/desplegar el sitio.

## Seguridad ya incluida en el script

- Valida el PDF por contenido real (`finfo` + firma `%PDF-`), no por
  extensión ni `Content-Type` del navegador.
- Revalida el límite de 7 MB en el servidor (nunca confíes solo en el
  límite del frontend).
- Sanea los campos de texto contra inyección de cabeceras SMTP.
- Renombra el adjunto antes de enviarlo (nunca reutiliza el nombre original
  del archivo del usuario).
- Usa PHPMailer en vez de `mail()` nativo, que maneja adjuntos y cabeceras
  de forma segura.

## Pendiente de decisión (no incluido por defecto)

- **Escaneo antivirus**: se deja comentado en el script dónde engancharlo
  (ClamAV vía `clamscan`, o una API como VirusTotal/Cloudmersive). Requiere
  que tu servidor tenga esa herramienta instalada o una clave de API, así
  que es una decisión de despliegue, no algo que pueda dejar hardcodeado.
- **Rate limiting / captcha**: recomendado para evitar spam o abuso del
  endpoint, pero depende de tu infraestructura (Cloudflare, hCaptcha, etc.).
