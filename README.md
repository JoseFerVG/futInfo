# futInfo - Gestor de Equipo para el Torneo del Rector ⚽🏆

Plataforma web moderna y responsiva para gestionar tu equipo de fútbol universitario (Torneo del Rector).

## 🚀 Características
- **Sistema de Autenticación**: Login y Registro de usuarios (Roles: Míster/Capitán y Jugadores).
- **Conexión a Firebase**: Compatible con Firebase Authentication y Cloud Firestore (Plan gratuito Spark).
- **Modo Demo / LocalStorage Offline**: Funciona inmediatamente sin configuración previa si estás probando en local.
- **Plantilla de Jugadores**: Gestión completa (dorsal, posición, estadísticas de goles, asistencias y tarjetas).
- **Pizarra Táctica / Convocatoria**: Campo de fútbol interactivo con formaciones tácticas (Fútbol 7 y Fútbol 11) y confirmación de asistencia.
- **Calendario y Resultados**: Registro de partidos, rivales, pistas universitarias, resultados y MVP.
- **Control de Cuotas**: Seguimiento de pagos de inscripción del torneo y equipación.

## 🛠️ Tecnologías
- HTML5 Semántico + `<dialog>` modal accesible.
- Tailwind CSS + CSS3 custom para la pizarra y efectos deportivos.
- Vanilla JavaScript moderno (ES Modules).
- Firebase SDK v10 (Auth & Firestore) con fallback local.

## 📦 Configuración de Firebase (100% Gratuito)
1. Ve a [Firebase Console](https://console.firebase.google.com/) y crea un proyecto gratuito (Plan Spark).
2. En la sección **Compilación**:
   - Activa **Authentication** (método Correo electrónico/contraseña).
   - Crea una base de datos **Firestore Database** (modo de prueba o producción).
3. En Configuración del proyecto > Tus apps > Selecciona Web (`</>`) y copia tu objeto `firebaseConfig`.
4. Pega tus credenciales en `js/firebase-config.js`.

---
Creado para el Torneo del Rector.
