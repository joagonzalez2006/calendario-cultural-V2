<?php
// Configuración de cabeceras para permitir CORS (importante para peticiones desde JavaScript)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'conexion.php';

// Verificar la conexión
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos: " . $conn->connect_error]);
    exit;
}

// Consultar eventos
$resultado = $conn->query("SELECT id, titulo, descripcion, fecha, hora, lugar FROM eventos ORDER BY fecha");

if (!$resultado) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la consulta: " . $conn->error]);
    exit;
}

$eventos = [];

while ($fila = $resultado->fetch_assoc()) {
    $eventos[] = [
        "id" => $fila["id"],
        "titulo" => $fila["titulo"],
        "descripcion" => $fila["descripcion"],
        "fecha" => $fila["fecha"],
        "hora" => $fila["hora"],
        "lugar" => $fila["lugar"]
    ];
}

echo json_encode($eventos);

$conn->close();
?>