<?php
/**
 * Recebe eventos de conversão do site (fetch em assets/js/main.js) e repassa
 * para a Conversions API do Meta, do lado do servidor. O token de acesso fica
 * só aqui (config.php), nunca é exposto ao navegador.
 */

define('EVA_API', true);

header('Content-Type: application/json');

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'config ausente']);
  exit;
}
require $configFile;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'method not allowed']);
  exit;
}

if (!defined('META_PIXEL_ID') || META_PIXEL_ID === '' || !defined('META_ACCESS_TOKEN') || META_ACCESS_TOKEN === '') {
  http_response_code(200); // não quebra o site, só não envia
  echo json_encode(['ok' => false, 'error' => 'pixel/token não configurado']);
  exit;
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body) || empty($body['event_name'])) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'payload inválido']);
  exit;
}

function eva_hash($value) {
  $value = strtolower(trim((string) $value));
  return $value === '' ? null : hash('sha256', $value);
}

// Telefone brasileiro no padrão E.164 (55 + DDD + número), só dígitos
function eva_hash_phone($value) {
  $digits = preg_replace('/\D/', '', (string) $value);
  if ($digits === '') return null;
  if (strlen($digits) <= 11) $digits = '55' . $digits; // adiciona DDI se faltar
  return hash('sha256', $digits);
}

$userDataIn = isset($body['user_data']) && is_array($body['user_data']) ? $body['user_data'] : [];

$userData = [
  'client_ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
  'client_user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
];
if (!empty($body['fbp'])) $userData['fbp'] = $body['fbp'];
if (!empty($body['fbc'])) $userData['fbc'] = $body['fbc'];
if (!empty($userDataIn['phone'])) $userData['ph'] = [eva_hash_phone($userDataIn['phone'])];
if (!empty($userDataIn['email'])) $userData['em'] = [eva_hash($userDataIn['email'])];
if (!empty($userDataIn['first_name'])) $userData['fn'] = [eva_hash($userDataIn['first_name'])];
$userData = array_filter($userData, function ($v) { return $v !== null && $v !== ''; });

$event = [
  'event_name' => $body['event_name'],
  'event_time' => time(),
  'action_source' => 'website',
  'event_source_url' => $body['event_source_url'] ?? null,
  'user_data' => $userData,
];
if (!empty($body['event_id'])) $event['event_id'] = $body['event_id'];
if (!empty($body['custom_data']) && is_array($body['custom_data'])) $event['custom_data'] = $body['custom_data'];
$event = array_filter($event, function ($v) { return $v !== null; });

$payload = [
  'data' => [$event],
  'access_token' => META_ACCESS_TOKEN,
];

$url = 'https://graph.facebook.com/v19.0/' . META_PIXEL_ID . '/events';
$ch = curl_init($url);
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode($payload),
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 5,
]);
$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code(200); // sempre 200 pro navegador, mesmo se o Meta recusar — não deve travar o site
echo json_encode(['ok' => $status >= 200 && $status < 300, 'meta_status' => $status]);
