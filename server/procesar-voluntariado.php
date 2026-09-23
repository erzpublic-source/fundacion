<?php
/**
 * Voluntariado form handler — receives the multipart/form-data POST from
 * /voluntariado on the site, validates the uploaded PDF, and emails the
 * submission (with the PDF attached) to the destination address below.
 *
 * NOT for GitHub Pages: it only runs on a real PHP-capable server. Deploy it
 * there and point VOLUNTARIADO_ENDPOINT in
 * src/pages/Voluntariado/Voluntariado.tsx at its public URL.
 *
 * Requires PHPMailer (composer require phpmailer/phpmailer) so header
 * injection and attachment encoding are handled correctly — do not switch
 * this to the bare mail() function.
 */

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

require __DIR__ . '/vendor/autoload.php';

// ---------------------------------------------------------------------------
// Configuration — adjust for your environment.
// ---------------------------------------------------------------------------

const DESTINATION_EMAIL = 'erzpubli@gmail.com'; // test inbox per current request
const ALLOWED_ORIGIN = 'https://erzpublic-source.github.io'; // the deployed site's origin
const MAX_FILE_SIZE_BYTES = 7 * 1024 * 1024; // 7 MB, must match the frontend limit
const UPLOAD_TMP_PREFIX = 'voluntariado_';

// SMTP credentials — never commit real values; load from environment
// variables (or a .env file kept out of version control) instead.
const SMTP_HOST = ''; // e.g. getenv('SMTP_HOST')
const SMTP_USER = ''; // e.g. getenv('SMTP_USER')
const SMTP_PASS = ''; // e.g. getenv('SMTP_PASS')
const SMTP_PORT = 587;

// ---------------------------------------------------------------------------
// CORS — the frontend is served from a different origin (GitHub Pages).
// ---------------------------------------------------------------------------

header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method-not-allowed']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

function fail(int $status, string $message): never
{
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

// ---------------------------------------------------------------------------
// 1. Validate the plain text fields.
// ---------------------------------------------------------------------------

$requiredFields = [
    'nombre' => 'Nombre del Profesional',
    'fecha_disponibilidad' => 'Fecha de Disponibilidad',
    'especialidad' => 'Especialidad Clínica',
    'ciudad' => 'Ciudad de Residencia',
    'celular' => 'Número de celular',
];

$data = [];
foreach ($requiredFields as $key => $label) {
    $value = trim((string) ($_POST[$key] ?? ''));
    if ($value === '') {
        fail(422, "missing-field:$key");
    }
    // Strip control characters (incl. CR/LF) to rule out SMTP header
    // injection via any field that ends up quoted in the message body.
    $data[$key] = preg_replace('/[\r\n\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $value);
}

// Basic shape checks — reject obvious garbage without being overly strict
// about international phone/city formats.
if (!preg_match('/^[+\d][\d\s()+-]{6,20}$/', $data['celular'])) {
    fail(422, 'invalid-phone');
}

// ---------------------------------------------------------------------------
// 2. Validate the uploaded PDF.
// ---------------------------------------------------------------------------

if (!isset($_FILES['hoja_de_vida']) || $_FILES['hoja_de_vida']['error'] !== UPLOAD_ERR_OK) {
    fail(422, 'missing-file');
}

$upload = $_FILES['hoja_de_vida'];

if ($upload['size'] > MAX_FILE_SIZE_BYTES) {
    fail(422, 'file-too-large');
}

// Never trust the client-supplied MIME type or filename extension — inspect
// the actual file content instead.
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$detectedMime = finfo_file($finfo, $upload['tmp_name']);
finfo_close($finfo);

if ($detectedMime !== 'application/pdf') {
    fail(422, 'invalid-file-type');
}

// Confirm the PDF magic bytes too, since some crafted files can trick
// fileinfo depending on the libmagic version installed.
$handle = fopen($upload['tmp_name'], 'rb');
$header = fread($handle, 5);
fclose($handle);
if ($header !== '%PDF-') {
    fail(422, 'invalid-file-signature');
}

// --- Recommended, not yet wired here: antivirus scan --------------------
// Run the temp file through ClamAV before attaching it, e.g.:
//   $result = shell_exec('clamscan --no-summary ' . escapeshellarg($upload['tmp_name']));
//   if ($result === null || !str_contains($result, 'OK')) { fail(422, 'file-rejected'); }
// or call a hosted scanning API (VirusTotal, Cloudmersive) with the file
// contents. This requires clamscan (or an API key) to be available on the
// server, so it's left as a deploy-time decision rather than hardcoded here.
// --------------------------------------------------------------------------

// Give the attachment a safe, unrelated-to-user-input filename; never reuse
// $upload['name'] directly (path traversal / header injection risk).
$safeFileName = 'hoja-de-vida-' . bin2hex(random_bytes(8)) . '.pdf';

// ---------------------------------------------------------------------------
// 3. Send the email (PDF travels only as an attachment — nothing is written
//    to persistent storage on this server).
// ---------------------------------------------------------------------------

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USER;
    $mail->Password = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = SMTP_PORT;
    $mail->CharSet = 'UTF-8';

    $mail->setFrom(SMTP_USER, 'Formulario Voluntariado — Fundación Un Día Más');
    $mail->addAddress(DESTINATION_EMAIL);

    $mail->Subject = 'Nueva solicitud de voluntariado profesional';
    $mail->Body =
        "Nombre del profesional: {$data['nombre']}\n" .
        "Fecha de disponibilidad: {$data['fecha_disponibilidad']}\n" .
        "Especialidad clínica: {$data['especialidad']}\n" .
        "Ciudad de residencia: {$data['ciudad']}\n" .
        "Número de celular: {$data['celular']}\n";

    $mail->addStringAttachment(
        file_get_contents($upload['tmp_name']),
        $safeFileName,
        'base64',
        'application/pdf'
    );

    $mail->send();
} catch (PHPMailerException $e) {
    error_log('Voluntariado mail error: ' . $mail->ErrorInfo);
    fail(500, 'mail-send-failed');
}

echo json_encode(['ok' => true]);
