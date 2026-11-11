# futInfo - FIFA Ultimate Team Edition | Torneo del Rector ⚽🎮

Plataforma interactiva para la gestión integral de tu equipo en el **Torneo del Rector**, diseñada con la estética de **FIFA Ultimate Team (FUT)**, inspirada en la pantalla táctica de plantillas y FUT Draft.

🌐 **Web en Vivo (GitHub Pages):** [https://josefervg.github.io/futInfo/](https://josefervg.github.io/futInfo/)  
📦 **Repositorio GitHub:** [https://github.com/JoseFerVG/futInfo](https://github.com/JoseFerVG/futInfo)

---

## 🎮 Características Principales

### 1. Pizarra Táctica y Estadio 3D (Estética FIFA FUT)
- **Perspectiva de Césped FIFA:** Campo con líneas oficiales, focos de estadio y portería en primer plano.
- **Cartas FUT Personalizadas:**
  - Cartas Oro Brillante, TOTW (Negras) y Especiales (Azules).
  - Valoración media (OVR), posición, foto/avatar recortado, escudo de facultad universitaria y bandera.
  - Atributos FIFA: Ritmo (PAC), Tiro (SHO), Pase (PAS), Regate (DRI), Defensa (DEF) y Físico (PHY).
- **Líneas de Química Interactivas (Chemistry Links):**
  - 🟢 **Verde:** Máxima afinidad y compañeros de la misma facultad/carrera (Informática, Medicina, Derecho, CAFD, etc.).
  - 🟠 **Naranja:** Conexión estándar / compatibilidad normal.
  - 🔴 **Rojo:** Mala conexión o jugador fuera de posición.
- **Pedestales Hexagonales con Semáforo de Rol:**
  - 🟢 Verde: Juega en su posición favorita (100% afinidad).
  - 🟡 Amarillo: Juega en su rol secundario (75% afinidad).
  - 🔴 Rojo: Juega en su peor rol (riesgo para el equipo).
- **HUD Superior:** Media del equipo (Team Rating) y Química global (Team Chemistry 0-100) con barra dinámica, junto a la tarjeta del Míster.
- **Banquillo de Suplentes e Intercambio Rápido:** Toca un titular y luego un suplente para intercambiarlos en tiempo real.

### 2. Dos Modalidades Oficiales
- **Fútbol 7 (7 vs 7):** Formaciones como `1-3-2-1` (Árbol de Navidad), `1-2-3-1` (Bandas y Control) y `1-3-1-2` (Doble Punta).
- **Fútbol Sala (5 vs 5):** Formaciones como `1-1-2-1` (Rombo Clásico Futsal), `1-2-2` (Cuadrado) y `1-3-0` (Falso 9).
- Selector rápido en la cabecera para alternar entre ambas modalidades al instante.

### 3. Ficha de Personaje con Roles de Mejor a Peor
Al registrarse o editar su ficha, cada jugador define sus preferencias tácticas:
1. 🥇 **1º Mejor Posición (Favorita):** Rinde al 100% y aporta química verde.
2. 🥈 **2º Segunda Posición (Aceptable):** Rinde al 75% con química naranja.
3. 🥉 **3º Tercera Posición (Emergencia):** Rinde al 50%.
4. ❌ **4º Peor Rol (Peligro):** La posición donde nunca debe jugar (ej. Portero o Central). Si el entrenador lo alinea ahí, se muestra en rojo y penaliza la química.

### 4. Sistema de Autenticación & Firebase
- Soporte para **Firebase Authentication** y sincronización en la nube.
- **Modo Local / Demo Offline:** Funciona inmediatamente desde el navegador sin necesidad de configuración previa.
- Cuentas de prueba listas para usar:
  - 👔 **Míster (Admin):** `mister@rector.es` / `rector2026`
  - 🏃 **Jugador:** `charly@rector.es` / `rector2026`

### 5. Suite del Entrenador (Míster)
- Asignación de especialistas a balón parado:
  - 👑 Capitán del equipo
  - 🎯 Lanzador de Penaltis
  - 📐 Faltas Directas
  - 🚩 Saques de Esquina
- Calendario de jornadas con confirmación de asistencia en 1 clic (Asistiré / Duda / Baja).
- Control de tesorería y cuota de inscripción al torneo (35 €).

---

## 🛠️ Tecnologías
- **HTML5 Semántico + `<dialog>` nativo accesible**.
- **Tailwind CSS + CSS3 custom** con efectos glassmorphism, gradientes FIFA y tipografía deportiva *Teko* & *Outfit*.
- **Vanilla JavaScript Modular (ES Modules)**.
- **Firebase SDK v10 (CDN modular)** con persistencia LocalStorage inteligente.
- **Iconografía Lucide**.

---

Desarrollado para el Torneo del Rector.
