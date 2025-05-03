<?php
// Es mejor usar variables de entorno o un archivo de configuración separado
// para las credenciales de la base de datos, pero por simplicidad las dejamos aquí

// Configuración de la base de datos
$host = '34.51.23.45'; // Tu IP de Google Cloud MySQL
$user = 'joaquin-admin1'; // Usuario de la base de datos
$pass = 'Jo@quin2oo6'; // Contraseña (deberías cambiarla y no exponerla en código)
$dbname = 'eventos_db'; // Nombre de la base de datos

// Manejo de errores
try {
    // Crear conexión con manejo de errores
    $conn = new mysqli($host, $user, $pass, $dbname);
    
    // Verificar la conexión
    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }
    
    // Establecer el conjunto de caracteres
    $conn->set_charset("utf8");
    
} catch (Exception $e) {
    // En producción, no deberías mostrar el mensaje de error completo
    // por razones de seguridad
    error_log("Error de base de datos: " . $e->getMessage());
    
    // Solo para depuración
    if (defined('DEBUG') && DEBUG) {
        echo "Error: " . $e->getMessage();
    } else {
        echo "Error de conexión a la base de datos. Contacte al administrador.";
    }
    exit;
}
?>