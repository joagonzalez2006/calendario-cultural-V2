<?php
// Configuración de cabeceras para permitir CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'conexion.php';

// Verificar si se recibieron los datos necesarios
if (!isset($_POST['titulo']) || !isset($_POST['fecha']) || !isset($_POST['descripcion'])) {
    echo json_encode(["success" => false, "message" => "Faltan datos requeridos."]);
    exit;
}

// Limpiar y validar los datos de entrada
$titulo = $conn->real_escape_string($_POST['titulo']);
$descripcion = $conn->real_escape_string($_POST['descripcion']);
$fecha = $conn->real_escape_string($_POST['fecha']);
$hora = isset($_POST['hora']) ? $conn->real_escape_string($_POST['hora']) : '';
$lugar = isset($_POST['lugar']) ? $conn->real_escape_string($_POST['lugar']) : '';

// Validar formato de fecha
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
    echo json_encode(["success" => false, "message" => "Formato de fecha inválido."]);
    exit;
}

// Insertar el evento en la base de datos
$sql = "INSERT INTO eventos (titulo, descripcion, fecha, hora, lugar)
        VALUES ('$titulo', '$descripcion', '$fecha', '$hora', '$lugar')";

if ($conn->query($sql) === TRUE) {
    // Obtener el ID del evento insertado
    $evento_id = $conn->insert_id;
    echo json_encode([
        "success" => true, 
        "message" => "Evento guardado correctamente",
        "id" => $evento_id,
        "titulo" => $titulo,
        "fecha" => $fecha,
        "hora" => $hora,
        "lugar" => $lugar,
        "descripcion" => $descripcion
    ]);
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Error al guardar el evento: " . $conn->error
    ]);
}

$conn->close();
?>