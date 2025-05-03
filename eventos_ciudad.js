// Variable global para almacenar eventos
let events = {};

// Cargar eventos desde PHP al iniciar
document.addEventListener('DOMContentLoaded', function() {
    // Primero intentamos cargar eventos de la base de datos
    loadEventsFromDatabase();
    
    // Luego creamos el calendario
    createCalendar();
    
    // Agregamos el evento de envío al formulario
    document.getElementById('eventForm').addEventListener('submit', addEvent);
});

// Función para cargar eventos desde la base de datos
function loadEventsFromDatabase() {
    fetch('obtener_eventos.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar eventos: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Convertir los eventos de la base de datos al formato que usamos
            data.forEach(evento => {
                const dateKey = evento.fecha;
                
                if (!events[dateKey]) {
                    events[dateKey] = [];
                }
                
                events[dateKey].push({
                    id: evento.id,
                    name: evento.titulo,
                    description: evento.descripcion,
                    time: evento.hora,
                    place: evento.lugar
                });
            });
            
            // Actualizar el calendario con los eventos cargados
            createCalendar();
        })
        .catch(error => {
            console.error('Error al cargar eventos:', error);
            // En caso de error, podemos cargar algunos eventos de ejemplo
            loadSampleEvents();
        });
}
/*
// Cargar eventos de ejemplo en caso de que falle la conexión con la base de datos
function loadSampleEvents() {
    events = {
        '2025-05-01': [{ name: 'Concierto de Jazz', description: 'Un gran concierto de jazz.', time: '19:00', place: 'Teatro Municipal' }],
        '2025-05-15': [{ name: 'Exposición de Arte', description: 'Una exposición de arte contemporáneo.', time: '10:00', place: 'Galería Central' }],
        '2025-05-20': [{ name: 'Cine al Aire Libre', description: 'Proyección de películas al aire libre.', time: '20:30', place: 'Parque Central' }],
    };
    
    // Actualizar el calendario después de cargar los eventos de muestra
    createCalendar();
}*/

// Función para crear el calendario
function createCalendar() {
    const calendar = document.getElementById('calendar');
    const date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear();

    // Obtener el primer día del mes
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Limpiar el calendario antes de crear uno nuevo
    calendar.innerHTML = '';
    
    // Agregar encabezados de días de la semana
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerText = day;
        calendar.appendChild(dayHeader);
    });
    
    // Agregar celdas vacías para los días anteriores al primer día del mes
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        calendar.appendChild(emptyDay);
    }
    
    // Crear días del mes
    for (let i = 1; i <= totalDays; i++) {
        const day = document.createElement('div');
        day.className = 'day';
        day.innerText = i;

        const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        day.setAttribute('data-date', fullDate);
        day.onclick = () => showEvents(fullDate);
        
        // Mostrar eventos en la fecha
        if (events[fullDate] && events[fullDate].length > 0) {
            day.classList.add('has-events');
            const eventCount = events[fullDate].length;
            day.innerHTML += `<br><small>${eventCount} evento${eventCount > 1 ? 's' : ''}</small>`;
        }

        calendar.appendChild(day);
    }
}

// Función para mostrar eventos de una fecha
function showEvents(date) {
    const eventsDiv = document.getElementById('events');
    const formattedDate = formatDate(date);
    eventsDiv.innerHTML = `<h2>Eventos del ${formattedDate}:</h2>`;
    
    // Asegurándonos de que estamos trabajando con la fecha correcta
    const exactDate = date; // Usamos directamente la fecha sin manipulación
    
    if (events[exactDate] && events[exactDate].length > 0) {
        events[exactDate].forEach((event, index) => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            
            let eventContent = `<strong>${event.name}</strong>`;
            if (event.time) eventContent += `<br>Hora: ${event.time}`;
            if (event.place) eventContent += `<br>Lugar: ${event.place}`;
            eventContent += `<br>${event.description}`;
            eventContent += `<br><button onclick="deleteEvent('${exactDate}', ${index})">Eliminar</button>`;
            
            eventItem.innerHTML = eventContent;
            eventsDiv.appendChild(eventItem);
        });
    } else {
        eventsDiv.innerHTML += '<p>No hay eventos para esta fecha.</p>';
    }
}

// Función para formatear la fecha en formato legible
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00'); // Asegurarnos de que se interprete en la zona horaria local
    return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
}

// Función para eliminar un evento
function deleteEvent(date, index) {
    // Comprobar si el evento existe
    if (events[date] && events[date][index]) {
        const event = events[date][index];
        
        // Si el evento tiene ID, significa que está en la base de datos
        if (event.id) {
            // Hacer una petición para eliminar el evento de la base de datos
            fetch('eliminar_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id=${event.id}`
            })
            .then(response => response.json())
            .then(data => {
                console.log('Respuesta del servidor:', data);
                if (data.success) {
                    // Eliminar el evento localmente
                    removeEventLocally(date, index);
                } else {
                    alert('Error al eliminar el evento: ' + (data.message || 'Error desconocido'));
                }
            })
            .catch(error => {
                console.error('Error al eliminar evento:', error);
                alert('Error al eliminar el evento. Inténtalo de nuevo.');
            });
        } else {
            // Si no tiene ID, solo lo eliminamos localmente
            removeEventLocally(date, index);
        }
    }
}

// Función para eliminar un evento localmente
function removeEventLocally(date, index) {
    // Eliminar el evento del array
    events[date].splice(index, 1);
    
    // Si no quedan eventos para esa fecha, eliminar la fecha del objeto
    if (events[date].length === 0) {
        delete events[date];
    }
    
    // Actualizar el calendario y la vista de eventos
    createCalendar();
    showEvents(date);
}

// Función para agregar un evento
function addEvent(event) {
    event.preventDefault(); // Evitar el envío del formulario

    const eventName = document.getElementById('eventName').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const eventPlace = document.getElementById('eventPlace').value;
    const eventDescription = document.getElementById('eventDescription').value;

    // Validar datos
    if (!eventName || !eventDate || !eventDescription) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }

    // Mostrar el cuadro de pago y el fondo oscuro
    document.getElementById('paymentModal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    // Agregar un evento al formulario de pago
    document.getElementById('paymentForm').onsubmit = function(paymentEvent) {
        paymentEvent.preventDefault(); // Evitar el envío del formulario de pago

        // Validar el formulario de pago
        const cardHolder = document.getElementById('cardHolder').value;
        const gmail = document.getElementById('gmail').value;
        const cardNumber = document.getElementById('cardNumber').value;
        const cardCode = document.getElementById('cardCode').value;
        const expiryDate = document.getElementById('expiryDate').value;

        if (!cardHolder || !gmail || !cardNumber || !cardCode || !expiryDate) {
            alert('Por favor, complete todos los campos de pago.');
            return;
        }

        // Validar el formato de la fecha de vencimiento
        const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryPattern.test(expiryDate)) {
            alert("Por favor, ingrese una fecha de vencimiento válida en el formato MM/AA.");
            return;
        }

        // Aquí simularíamos el procesamiento del pago
        // En un entorno real, conectaríamos con un procesador de pagos

        // Guardar el evento en la base de datos
        saveEventToDatabase(eventName, eventDate, eventTime, eventPlace, eventDescription);

        // Limpiar los formularios
        document.getElementById('eventForm').reset();
        document.getElementById('paymentForm').reset();
        
        // Ocultar el modal de pago
        document.getElementById('paymentModal').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    };
}

// Función para guardar el evento en la base de datos
function saveEventToDatabase(title, date, time, place, description) {
    // Crear un objeto FormData para enviar los datos
    const formData = new FormData();
    formData.append('titulo', title);
    formData.append('fecha', date);
    formData.append('hora', time);
    formData.append('lugar', place);
    formData.append('descripcion', description);

    // Enviar los datos al servidor
    fetch('guardar_evento.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        console.log('Respuesta del servidor:', data);
        
        try {
            // Intentar parsear la respuesta como JSON
            const jsonData = JSON.parse(data);
            
            // Actualizar la interfaz con el ID del nuevo evento
            if (!events[date]) {
                events[date] = [];
            }
            
            // Añadir el evento localmente con el ID recibido del servidor
            events[date].push({
                id: jsonData.id,
                name: title,
                description: description,
                time: time,
                place: place
            });
        } catch (e) {
            // Si no es JSON, añadir el evento sin ID
            if (!events[date]) {
                events[date] = [];
            }
            
            // Añadir el evento localmente sin ID
            events[date].push({
                name: title,
                description: description,
                time: time,
                place: place
            });
        }

        // Recrear el calendario y mostrar los eventos de la fecha seleccionada
        createCalendar();
        showEvents(date);
        
        alert('Evento guardado correctamente');
    })
    .catch(error => {
        console.error('Error al guardar el evento:', error);
        alert('Error al guardar el evento. Inténtalo de nuevo.');
    });
}

// Función para formatear la fecha de vencimiento de la tarjeta
function formatExpiryDate(input) {
    // Eliminar caracteres no numéricos
    let value = input.value.replace(/\D/g, '');
    
    // Formatear como MM/AA
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    
    input.value = value;
}

// Función para cancelar el pago
function cancelPayment() {
    // Cerrar el cuadro de pago
    document.getElementById('paymentModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    
    // Limpiar el formulario de pago
    document.getElementById('paymentForm').reset();
}
const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const { nombre, fecha, descripcion } = JSON.parse(event.body);

  try {
    await connection.execute(
      'INSERT INTO eventos (nombre, fecha, descripcion) VALUES (?, ?, ?)',
      [nombre, fecha, descripcion]
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ mensaje: 'Evento agregado exitosamente' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al agregar el evento', detalles: error.message }),
    };
  } finally {
    await connection.end();
  }
};
