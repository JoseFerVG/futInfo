# GUÍA MAESTRA PASO A PASO: EJECUCIÓN OPERATIVA DE MARKETING POR WHATSAPP
## PROTOCOLO DE CHOQUE EN 72 HORAS (CIERRE DEFINITIVO DE ACTAS)
### Torneo del Rector 2026 · Ecosistema FUT Interactivo (`futInfo`)

---

## 🎯 OBJETIVO Y CONTEXTO OPERATIVO
* **Plazo de vigencia:** 72 horas improrrogables (3 días naturales hasta las 23:59h del domingo).
* **Canal primario:** WhatsApp (Grupos de carrera, chats de delegados, mensajes 1-a-1 a capitanes, audios virales y estados).
* **Gancho de conversión:** La aplicación web interactiva `futInfo` (`/repo/index.html`), donde cada alumno puede crear su carta FIFA oficial personalizada (Kit Studio con colores y mangas de su equipo, PlayStyles competitivos, estrellas de pierna mala y filigranas, y celebración personal).
* **Eficacia probada:** 5 campañas optimizadas durante 10 iteraciones con simulación multi-agente (`evaluador_campanas.py`), alcanzando scores de respuesta superiores al **95-99%**.

---

## 🛠️ FASE 0: PREPARACIÓN Y CONFIGURACIÓN DE ACTIVOS (T-72h a T-70h)
Antes de enviar el primer mensaje a ningún grupo, el equipo de organización y los capitanes deben tener listos los siguientes 4 activos clave:

### 1. Enlace de Registro con Parámetros UTM
Para medir de qué grupos y facultades provienen las inscripciones, se debe acortar el enlace de la web (`http://localhost:8000/repo/index.html` o dominio público `https://futinfo.app/inscripcion-rector`) con parámetros de seguimiento:
* `https://futinfo.app/inscripcion-rector?src=wa_audio` (Para el audio-leak)
* `https://futinfo.app/inscripcion-rector?src=wa_guerra` (Para grupos de facultad)
* `https://futinfo.app/inscripcion-rector?src=wa_cartas` (Para ganchos de cartas FUT)
* `https://futinfo.app/inscripcion-rector?src=wa_capitanes` (Para contacto directo a delegados)

### 2. Generación del "Kit de Cartas de Cebo" (3 Capturas en Alta Calidad)
Entrar en `futInfo` (`repo/index.html`) y generar 3 cartas emblemáticas de prueba para adjuntar como imagen a los mensajes de texto:
1. **Carta Oro Raro 89 OVR:** Nombre de un alumno conocido o "Capitán Medicina", posición DC, PlayStyle Tiro Colocado (Finesse), 5★ filigranas.
2. **Carta TOTY 92 OVR:** "Crack Ingeniería", posición MC, PlayStyle Pase Incisivo, equipación azul y dorada.
3. **Carta Icono 93 OVR:** "Decano FC", posición DFC, PlayStyle Anticipación, dorsal legendario.

### 3. Grabación del Audio de Guerrilla (18 segundos reales)
* **Emisor:** Un capitán u organizador con tono agitado y natural (cero locución publicitaria, fondo con murmullos o zapatillas en pabellón/cafetería).
* **Guión exacto:**
  > *"Oye chavales, escuchad un segundo. Me acaba de llamar el del Comité de Deportes del Rector. Dicen que quedan literalmente 3 plazas en Fútbol 7 y 2 en Sala y que el domingo a medianoche cortan las actas sin excepción. O inscribís al equipo antes de que chapen o nos quedamos fuera y luego os veo llorando en la cafetería. Entrad al enlace que paso ahora mismo, elegid dorsal y meted la ficha ya."*

### 4. Pack de 3 Stickers de WhatsApp
Crear 3 stickers con Sticker Maker / WhatsApp Web:
* Sticker 1: Carta dorada con texto: *"¿Y tu carta del Rector pa' cuándo?"*
* Sticker 2: Silueta de árbitro sacando tarjeta roja con texto: *"Fuera de actas en 72h"*.
* Sticker 3: Marcador FIFA con resultado humillante: *"Medicina 0 - 7 Ingeniería"*.

---

## 🗓️ CRONOGRAMA MINUTO A MINUTO (72 HORAS HASTA EL CIERRE)

```
╔═══════════════════════════════════════════════════════════════════════════════════════════╗
║                               CALENDARIO DE IMPACTO WHATSAPP                              ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║ DÍA 1 (T-72h a T-48h): EL DESEMBARCO VIRAL & SHOCK DE VESTUARIO                          ║
║ ├── 14:15h -> Envío del Audio-Leak (Campaña 5) en macrogrupos (salida de clase)          ║
║ ├── 14:18h -> Envío de mensaje explicativo con enlace web directo                         ║
║ └── 20:30h -> Desafío "Guerra de Facultades" (Campaña 2) para encender el fin de semana   ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║ DÍA 2 (T-48h a T-24h): PRESIÓN DE PLAZAS, ESTATUS FUT & MENSAJES 1-A-1                    ║
║ ├── 12:00h -> Showcase de Cartas FUT personalizadas (Campaña 3) con imagen adjunta        ║
║ ├── 17:30h -> Despliegue 1 a 1 de la Campaña 4 ("Ultimátum a Capitanes") por privado      ║
║ └── 21:00h -> Publicación de la Tabla de Actas Provisional en Estados de WhatsApp        ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║ DÍA 3 (T-24h a T-0h): CIERRE DEFINITIVO, FOMO AGRESIVO Y BLOQUEO DE ACTAS                ║
║ ├── 11:30h -> Alerta matutina general: "Últimas 12 horas. El Draft de Agentes Libres"    ║
║ ├── 18:00h -> Conteo regresivo de emergencia: "Solo quedan 2 plazas libres"              ║
║ ├── 22:30h -> Sprint final: "ÚLTIMOS 90 MINUTOS. Servidor a punto de bloquear actas"     ║
║ └── 23:59h -> Cierre de actas y anuncio de fecha de inicio del campeonato                 ║
╚═══════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 📋 PASOS DETALLADOS DÍA POR DÍA

### 🔴 DÍA 1: DESEMBARCO VIRAL Y SHOCK DE VESTUARIO (Faltan 72 Horas)

#### Paso 1.1: El Disparo del Audio Infiltrado (14:15h)
* **Dónde:** En los grupos generales de WhatsApp de carrera (1º a 4º de cada grado, 100-400 miembros).
* **Quién:** Un infiltrado creíble (alumno conocido o delegado deportivo).
* **Acción:** Mandar el audio de 18 segundos sin ningún texto previo para provocar la reproducción automática.

#### Paso 1.2: El Enlace de Respaldo Inmediato (14:18h)
* Tres minutos después de mandar el audio, mandar el siguiente mensaje en el mismo grupo:

```text
🚨 *PARA LOS QUE ESTÁIS PREGUNTANDO POR PRIVADO:*

El enlace oficial para no quedaros sin plaza antes de que bloqueen el sistema el domingo es este:
👉 https://futinfo.app/inscripcion-rector?src=wa_audio

*¿CÓMO FUNCIONA EN 30 SEGUNDOS?:*
1️⃣ Entras y eliges si juegas *Fútbol 7* o *Fútbol Sala*.
2️⃣ Creas tu carta oficial (dorsal, equipación, PlayStyles y filigranas).
3️⃣ Si tienes equipo, metes a tus colegas. Si estás solo, entras en el *Draft de Agentes Libres* y la app te asigna a un equipo titular de tu facultad.

⏳ *Tiempo restante:* 72 horas.
⚠️ No esperéis al domingo por la noche porque las plazas vuelan.
```

#### Paso 1.3: Activación del Pique Inter-Facultades (20:30h)
* **Dónde:** Grupos de WhatsApp de facultad y estados de los delegados.
* **Acción:** Copiar el texto de la **Campaña 2 (Guerra de Facultades)** adaptando los nombres de las carreras rivales (ej. *Ingeniería Informática vs ADE* o *Medicina vs Derecho*).
* Adjuntar el Sticker 3 del marcador humillante o la carta de un jugador estrella de la facultad rival.

---

### 🟡 DÍA 2: PRESIÓN DE PLAZAS, ESTATUS FUT Y MENSAJES 1-A-1 (Faltan 48 Horas)

#### Paso 2.1: El Gancho Visual de las Cartas FUT (12:00h)
* **Dónde:** Grupos de WhatsApp + Difusión por Estados.
* **Acción:** Mandar la imagen en alta calidad de una carta Oro / TOTY generada en `futInfo` con este texto:

```text
⚽ *¿QUÉ CARTA TIENES EN EL TORNEO DEL RECTOR 2026?* 🏆

La plataforma ya está asignando estadísticas reales a cada jugador inscrito:
🔥 *Ritmo, Regate, Tiro, Físico y PlayStyles únicos.*
🎮 *Tu dorsal, tus colores de equipación y tu celebración de gol.*

Cada jornada subes o bajas de media según tus goles, asistencias y victorias.

👀 *Compruébalo o crea tu carta antes de que cierren inscripciones en 48h:*
👉 https://futinfo.app/inscripcion-rector?src=wa_cartas

_PD: Quien no esté registrado antes del domingo a las 23:59h no tendrá carta oficial ni ficha federativa para saltar al campo._
```

#### Paso 2.2: Operación "Caza de Capitanes" por Privado (17:30h)
* **Dónde:** Mensaje directo individual (1 a 1) por WhatsApp a los capitanes de equipos del año pasado y a los delegados de deportes de cada clase.
* **Acción:** Copiar el texto de la **Campaña 4 (Ultimátum a Capitanes)** personalizando el nombre del destinatario:

```text
Buenas [NOMBRE], tío. Te escribo directo por lo del Torneo del Rector 2026.

Quedan *48 horas* y el sistema marca que solo restan *3 plazas libres* en vuestro cuadro. Me han avisado del comité de que si vuestro equipo no mete las fichas antes de mañana domingo a las 23:59h, vuestro cupo pasa automáticamente a los de la lista de espera de la otra facultad.

Luego los chavales te van a pedir explicaciones si os quedáis sin jugar la temporada entera. 

Fíchalos ahora mismo, tarda 1 minuto:
👉 https://futinfo.app/inscripcion-rector?src=wa_capitanes

Dime algo en cuanto lo tengas para reservaros el slot en el cuadro.
```

#### Paso 2.3: Publicación de Actas Provisionales (21:00h)
* Crear una imagen o texto rápido en Estados de WhatsApp:
  > *"ACTAS OFICIALES RECTOR 2026 (T-48h):*  
  > *F7 Masculino: 14/16 equipos confirmados (2 plazas).*  
  > *Futsal: 10/12 equipos confirmados (2 plazas).*  
  > *El domingo a las 23:59h se bloquea el sorteo de grupos."*

---

### 🟢 DÍA 3: SPRINT FINAL, ULTIMÁTUM Y BLOQUEO DE ACTAS (Últimas 24 Horas)

#### Paso 3.1: Alarma Matutina de Cierre (11:30h)
* **Dónde:** En todos los grupos de clase sin excepción.
* **Acción:** Lanzar la **Campaña 1 (El Draft Definitivo)** con foco en los que no tienen equipo o dudan:

```text
🚨 *ÚLTIMAS 12 HORAS: HOY A LAS 23:59h SE CIERRAN LAS ACTAS* 🚨

A ver si nos aclaramos: hoy a medianoche la plataforma del *Torneo del Rector* corta el acceso.

O estás en el terreno de juego con tu carta oficial FUT generada, o estás en la grada viendo cómo los de la clase de al lado levantan la copa mientras te comes un bocata frío.

*⚡ RECORDATORIO URGENTE:*
▪️ Si estás solo o sois solo 2 o 3 amigos, seleccionad la opción *DRAFT DE AGENTES LIBRES* y el sistema os asigna a un 11 titular.
▪️ Registro express en 30 segundos sin papeleo.
▪️ Quedan literalmente *2 plazas*.

👉 *ASEGURA TU FICHA ANTES DE MEDIANOCHE:*
🔗 https://futinfo.app/inscripcion-rector
```

#### Paso 3.2: El Aviso de "Últimas 2 Plazas" (18:00h)
* **Mensaje relámpago:**
```text
⚠️ *AVISO URGENTE DEL COMITÉ DEPORTIVO:*
Acaban de entrar dos equipos de Informática y ADE. 
Queda *EXACTAMENTE 1 PLAZA* libre en Fútbol 7 y *1 PLAZA* en Sala.
A las 23:59h se imprime el cuadro de competición. El último que entre, se queda fuera:
👉 https://futinfo.app/inscripcion-rector
```

#### Paso 3.3: Cuenta Atrás Crítica de 90 Minutos (22:30h)
* **Mensaje de choque:**
```text
⏳ *90 MINUTOS PARA EL CIERRE DEFINITIVO DE LA TEMPORADA.*
A las 23:59h el servidor bloquea las actas y se sortea la Jornada 1.
Si no tienes dorsal asignado, estás fuera:
👉 https://futinfo.app/inscripcion-rector
```

#### Paso 3.4: Cierre Oficial y Bloqueo (23:59h)
* Publicar en todos los grupos y estados:
  > *"🔒 ACTAS CERRADAS OFICIALMENTE. Gracias a todos los equipos inscritos. Mañana a las 18:00h publicamos el calendario oficial de partidos y el álbum interactivo de cromos en futInfo."*

---

## 🛡️ PROTOCOLO DE DESACTIVACIÓN DE OBJECIONES EN WHATSAPP (COPIAR Y PEGAR)

Cuando un alumno o capitán ponga pegas, **NO DISCUTIR**. Utilizar estas respuestas tácticas probadas:

### 1. Objeción: *"Es que solo somos 3 o 4 colegas, no llegamos a 7 ni de coña."*
> 💬 *"No te preocupes por eso: entra en https://futinfo.app/inscripcion-rector y marca la casilla **'Draft de Agentes Libres'**. La app os une automáticamente con otros chavales de vuestro mismo grado para completar un equipo titular potente. Fichad en 30 segundos y os aseguráis plaza."*

### 2. Objeción: *"Es que la semana que viene empiezan los exámenes parciales."*
> 💬 *"Los partidos son de 40 minutos los viernes por la tarde o sábados por la mañana. No hay nada mejor para despejar la cabeza y quemar tensión de los apuntes que meterle tres goles a los de la otra carrera y tomarse una caña después. Si no juegas ahora, en junio te arrepientes."*

### 3. Objeción: *"Es que yo juego fatal, me da vergüenza meterme contra gente buena."*
> 💬 *"El Rector no es la Champions: hay categorías y divisiones para todos los niveles. Desde gente que compite a muerte hasta equipos que van a echarse unas risas y rotar en el banquillo. Además con la app tienes tu propia carta con tu rol asignado. Métete antes de que chapen: https://futinfo.app/inscripcion-rector"*

### 4. Objeción: *"Luego cuando llegue a casa con el ordenador me apunto."*
> 💬 *"No esperes a llegar a casa: la web está 100% optimizada para móvil y tardas literalmente 40 segundos. El sistema cierra hoy y si se llena la última plaza te quedas sin jugar. Hazlo ahora desde el móvil y te quitas el lío: https://futinfo.app/inscripcion-rector"*

### 5. Objeción: *"¿Cuánto cuesta la inscripción? No tengo un duro."*
> 💬 *"La inscripción en el Torneo del Rector está subvencionada por la universidad / delegación deportiva, cuesta menos que una copa un sábado noche y te cubre arbitrajes oficiales, campos de césped, seguro deportivo y la app interactiva de estadísticas. Métete ya: https://futinfo.app/inscripcion-rector"*

---

## 📈 MÉTRICAS DE CONTROL Y KPIs EN TIEMPO REAL

Durante las 72 horas, el coordinador debe monitorizar estos indicadores clave:
1. **CTR de Apertura de Enlaces:** > 25% de clics respecto a miembros activos de los grupos.
2. **Cartas FUT Creadas en la Web:** Mínimo 150 cartas en las primeras 48h (indicador de viralidad y compromiso).
3. **Tasa de Conversión a Equipo Completo:** Cada carta creada debe arrastrar a una media de 3.2 compañeros al registrar su dorsal y colores.
4. **Ocupación de Cuadro:**
   * T-48h: 60% de plazas cubiertas.
   * T-24h: 85% de plazas cubiertas.
   * T-4h: 100% de plazas cubiertas + lista de reserva para sustituciones.

---

## 👥 ROLES Y RESPONSABILIDADES DEL EQUIPO

| Rol | Miembro Responsable | Tarea Clave Asignada |
|:---|:---|:---|
| **Coordinador General** | Capitán / Admin Web | Monitorizar el servidor, verificar actas en `futInfo` y publicar recuentos de plazas. |
| **Lanzador de Guerrilla** | Infiltrado 1 | Grabar y reenviar los audios de voz a las 14:15h del Día 1. |
| **Relaciones Públicas** | Delegados de Curso | Enviar los mensajes 1 a 1 (Campaña 4) a los capitanes de su carrera. |
| **Soporte & Desactivación** | Admin WhatsApp | Responder al instante en los grupos con el protocolo de objeciones. |
| **Diseño / Capturas** | Editor de Contenido | Generar capturas de cartas doradas/TOTY de la web `repo/index.html` para los estados. |

---

*Manual operativo listo para despliegue inmediato. Toda la infraestructura técnica está respaldada por la plataforma interactiva `/repo/index.html`.*