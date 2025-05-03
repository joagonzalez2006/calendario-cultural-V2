<?php
// Configuración de cabeceras para permitir CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'conexion.php';

// Verificar si se recibió el ID
if (!isset($_POST['id'])) {
    echo json_encode(["error" => "ID de evento no proporcionado"]);
    exit;
}

// Validar y limpiar el ID
$id = intval($_POST['id']);

// Eliminar el evento
$sql = "DELETE FROM eventos WHERE id = $id";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Evento eliminado correctamente"]);
} else {
    echo json_encode(["error" => "Error al eliminar el evento: " . $conn->error]);
}

$conn->close();
?>