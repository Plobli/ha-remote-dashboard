<?php
// Lese den Access Token aus einer Konfigurationsdatei
$config = json_decode(file_get_contents("config.json"), true);
$accessToken = $config["access_token"];

// Verbinden Sie sich mit dem Home Assistant und verwenden Sie den Access Token für die Authentifizierung
$homeAssistantUrl = "https://example.com/api/sensors"; // Beispiel-URL für die Home Assistant API

// Konfigurieren Sie die HTTP-Anfrage
$options = array(
    'http' => array(
        'header'  => "Authorization: Bearer $accessToken\r\n",
        'method'  => 'GET',
    ),
);

// Führen Sie die HTTP-Anfrage aus, um die Sensordaten abzurufen
$response = file_get_contents($homeAssistantUrl, false, stream_context_create($options));

// Überprüfen Sie die Antwort und geben Sie sie zurück
if ($response === FALSE) {
    // Fehler beim Abrufen der Daten
    echo json_encode(array("error" => "Fehler beim Abrufen der Sensordaten"));
} else {
    // Erfolgreich abgerufene Sensordaten
    echo $response;
}
?>
