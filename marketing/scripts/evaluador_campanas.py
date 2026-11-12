"""
EVALUADOR MULTI-AGENTE Y MOTOR DE OPTIMIZACIÓN ITERATIVA (10 RONDAS)
Campañas de Marketing Disruptivo por WhatsApp - Torneo del Rector 2026
Plazo Crítico: Cierre de inscripciones en 72 horas (3 días).
"""

import json
import os
import sys

# Perfiles de los 5 agentes evaluadores
AGENT_PROFILES = {
    "crack_competitivo": {
        "nombre": "Sergio 'El Picas'",
        "rol": "Crack Competitivo / Tryhard Universitario",
        "descripcion": "Juega para ganar y humillar a sus rivales. Le motivan el estatus, los ratings FIFA y que le desafíen el ego.",
        "pesos": {"hook": 0.25, "urgencia": 0.25, "viralidad": 0.20, "conversion": 0.30}
    },
    "capitan_procrastinador": {
        "nombre": "Marcos 'El Capitán'",
        "rol": "Capitán Perezoso / Lo deja todo para el final",
        "descripcion": "Tiene un equipo a medias con amigos pero le da pereza rellenar formularios si no ve un ultimátum inminente.",
        "pesos": {"hook": 0.20, "urgencia": 0.40, "viralidad": 0.15, "conversion": 0.25}
    },
    "novato_inseguro": {
        "nombre": "Dani 'El Duda'",
        "rol": "Estudiante Novato / Teme no dar la talla",
        "descripcion": "Le gusta el fútbol pero teme que haya demasiado nivel. Necesita saber que hay banquillo, draft y ambiente épico.",
        "pesos": {"hook": 0.20, "urgencia": 0.20, "viralidad": 0.20, "conversion": 0.40}
    },
    "fiestero_cafeteria": {
        "nombre": "Lucas 'El Fiestero'",
        "rol": "Universitario de Cafetería / Tercer Tiempo",
        "descripcion": "Busca risas, piques en el grupo de clase, cervezas post-partido y memes. Reenvía todo lo que sea gracioso o provocador.",
        "pesos": {"hook": 0.35, "urgencia": 0.15, "viralidad": 0.40, "conversion": 0.10}
    },
    "copywriter_conversion": {
        "nombre": "Elena 'Direct-Response'",
        "rol": "Especialista en Copywriting & Conversión WhatsApp",
        "descripcion": "Evalúa el gancho en los primeros 60 caracteres (notificación push), jerarquía visual, fricción del CTA y escasez real.",
        "pesos": {"hook": 0.30, "urgencia": 0.25, "viralidad": 0.15, "conversion": 0.30}
    }
}

# Campañas base (v1.0)
INITIAL_CAMPAIGNS = {
    "campana_1": {
        "id": "campana_1",
        "titulo": "EL DRAFT DEFINITIVO / CALL-OUT PERSONAL",
        "angulo": "Ego, desafío personal y estatus de vestuario",
        "v1": """🚨 *AVISO URGENTE TORNEO DEL RECTOR* 🚨

Hola a todos. Os informamos de que las inscripciones para el Torneo del Rector de Fútbol 7 y Sala se cierran en 3 días.

No te quedes sin jugar. Puedes apuntarte con tu equipo o solo para entrar en el draft universitario.
Habrá trofeos, cartas con estadísticas y arbitrajes oficiales.

👉 Entra aquí para inscribirte antes de que se acaben las plazas:
https://futinfo.app/inscripcion

¡Te esperamos en el campo!"""
    },
    "campana_2": {
        "id": "campana_2",
        "titulo": "GUERRA DE FACULTADES / ORGULLO & RIVALIDAD",
        "angulo": "Provocación tribal universitaria (Medicina vs Ingeniería vs ADE vs Derecho)",
        "v1": """⚽ *TORNEO DE FACULTADES 2026* ⚽

¿Qué facultad manda este año en el campus?
Medicina, Ingeniería, ADE y Derecho ya están preparando sus alineaciones para el torneo rector.

Quedan solo 3 días para cerrar el plazo de inscripción. Demuestra que tu carrera es la mejor en el campo.

Apúntate en este enlace:
https://futinfo.app/facultades

¡Que gane el mejor!"""
    },
    "campana_3": {
        "id": "campana_3",
        "titulo": "LA CARTA FIFA DE TU VIDA / GAMIFICACIÓN TOTAL",
        "angulo": "Cartas FUT personalizadas, rating, posición oficial y banquillo",
        "v1": """🎮 *TU CARTA FIFA EN EL TORNEO DEL RECTOR* 🎮

Este año todos los jugadores inscritos tendrán su propia carta de FUT con estadísticas reales: ritmo, tiro, pase, regate y físico.

Las inscripciones terminan en 3 días. Si no te inscribes a tiempo no podremos crear tu carta en la aplicación web del torneo.

Rellena tus datos aquí:
https://futinfo.app/carta-fut

¡Consigue tu valoración OVR!"""
    },
    "campana_4": {
        "id": "campana_4",
        "titulo": "ÚLTIMA LLAMADA CAPITANES / 72 HORAS O FUERA",
        "angulo": "Ultimátum implacable de tiempo y escasez de plazas",
        "v1": """⚠️ *ÚLTIMO AVISO: CIERRE DE INSCRIPCIONES EN 72H* ⚠️

Capitanes y delegados de equipo:
Quedan exactamente 3 días para enviar la lista de jugadores. Pasado el plazo la plataforma se cierra y no habrá excepciones.

Si te falta algún jugador para completar la plantilla podéis fichar agentes libres del draft.

Enlace oficial de registro:
https://futinfo.app/capitanes

No lo dejes para el último minuto."""
    },
    "campana_5": {
        "id": "campana_5",
        "titulo": "AUDIO-LEAK / GUERRILLA & MEME EN GRUPOS",
        "angulo": "Formato audio filtrado + pattern interrupt viral de vestuario",
        "v1": """🔊 *AUDIO FILTRADO DEL VESTUARIO* (0:18)
▶️ 🔘━━━━━━━━━━━━━━ 0:18

"Tío, dile a los del grupo que espabilen que en 3 días cierran las plazas del Rector y nos quedamos sin jugar como el año pasado."

No seáis paquetes. Tenéis 72 horas para registrar al equipo o acabáis viendo los partidos desde la cafetería con un donut.

Inscripción rápida:
https://futinfo.app/draft"""
    }
}

# Transformaciones iterativas y mejoras acumulativas por ronda (1 a 10)
REFINEMENT_STEPS = [
    {
        "iteracion": 2,
        "foco": "Pattern interrupt en primeros 60 caracteres y eliminación de tono corporativo",
        "mejora": "Sustituir aperturas neutras por ganchos que detengan el scroll del móvil y desafíen directamente al lector."
    },
    {
        "iteracion": 3,
        "foco": "Inyección de urgencia real (reloj de 72h / 3 días exactos)",
        "mejora": "Añadir límite estricto de plazas (ej: 'quedan solo 4 plazas para F7 y 2 para Sala') para generar escasez verídica."
    },
    {
        "iteracion": 4,
        "foco": "Formato nativo WhatsApp de alto impacto (negritas, monoespaciado, tachado)",
        "mejora": "Estructurar en bloques escaneables con *negritas tácticas*, citas en bloque y emojis de advertencia deportiva."
    },
    {
        "iteracion": 5,
        "foco": "Ataque al ego y estatus de vestuario",
        "mejora": "Contrastar ser titular con tu carta de oro vs quedarse de espectador en la grada; provocar a los que 'siempre ponen excusas'."
    },
    {
        "iteracion": 6,
        "foco": "Eliminación de fricción de registro (Fricción Cero en CTA)",
        "mejora": "Aclarar que registrarse toma literalmente 45 segundos: 'Solo necesitas nombre, apodo y dorsal. Sin papeleos'."
    },
    {
        "iteracion": 7,
        "foco": "Pique directo entre carreras (Tribalismo)",
        "mejora": "Citar facultades rivales específicas con cifras reales de equipos ya inscritos para desatar el miedo a ser humillados."
    },
    {
        "iteracion": 8,
        "foco": "Refuerzo para los novatos y jugadores sueltos (Draft de Agentes Libres)",
        "mejora": "Añadir cláusula clara: '¿No tienes equipo entero? Entra como Agente Libre en el Draft y te asignamos un once titular'."
    },
    {
        "iteracion": 9,
        "foco": "Viralidad y reenvío automático en grupos de WhatsApp de clase",
        "mejora": "Incluir llamada expresa para reenviar: 'Pásalo al grupo de tu clase y señala al que va a ser suplente'."
    },
    {
        "iteracion": 10,
        "foco": "Perfección de conversión de respuesta directa (Copy Definitivo Implacable)",
        "mejora": "Fusión de urgencia crítica (últimas 72h), escasez milimétrica, jerarquía visual ineludible y CTA de alta conversión."
    }
]

# Definición de las versiones optimizadas para cada campaña a través de las 10 iteraciones
CAMPAIGN_ITERATIONS = {
    "campana_1": [
        # v1.0
        INITIAL_CAMPAIGNS["campana_1"]["v1"],
        # v1.1
        """🚨 *¿VAS A JUGAR O TE VAS A QUEDAR EN LA GRADA CON UN CAFÉ?* 🚨

Las inscripciones del *Torneo del Rector (F7 y Futsal)* se cierran en *EXACTAMENTE 3 DÍAS*.
El lunes se imprimen las cartas y se cierran las actas oficiales.

Si no estás registrado antes del domingo a las 23:59h:
❌ Te quedas fuera de la base de datos oficial
❌ Tu carta FUT no se genera
❌ Tu equipo no entra en el sorteo

👉 *Inscríbete en 60 segundos aquí:*
https://futinfo.app/inscripcion-rector

_¿O vas a dejar que los de la otra clase levanten la copa?_""",
        # v1.2
        """🚨 *MENSAJE DE VESTUARIO: ÚLTIMAS 72 HORAS* 🚨

A ver si espabiláis: el plazo para el *Torneo del Rector 2026* se cierra en *3 DÍAS*.
El año pasado la mitad se quedó fuera llorando porque "no le dio tiempo".

Este año no hay prórrogas:
⚡ *Fútbol 7:* Quedan 3 plazas de equipo.
⚡ *Fútbol Sala:* Quedan 2 plazas libres.
⚡ *Individual:* Puedes entrar como Agente Libre en el Draft.

📲 *Asegura tu dorsal antes del domingo 23:59h:*
https://futinfo.app/inscripcion-rector

_Pásale esto al típico del grupo que siempre dice 'sí sí luego me apunto' y nunca lo hace._""",
        # v1.3
        """🚨 *CALL-OUT DIRECTO A LOS QUE VAN DE CRACKS:* 🚨

Mucho hablar de regates en la cafetería, pero las inscripciones del *Torneo del Rector* se cierran en *72 HORAS* (3 días) y todavía no te vemos en la lista oficial.

¿Te da miedo que te saquen una carta de plata con 45 de ritmo o qué pasa?

*DATOS CLAVE DEL CIERRE:*
⏰ *PLAZO:* Domingo a las 23:59h (reloj en cuenta atrás).
🛡️ *FORMATO:* Fútbol 7 y Fútbol Sala universitario.
🃏 *CARTAS:* Cada jugador tiene carta FUT real con rating y estadísticas.

👉 *Inscríbete en 40 segundos sin papeleos:*
https://futinfo.app/inscripcion-rector

_Demuestra en el campo lo que presumes en el grupo._""",
        # v1.4
        """🚨 *ADVERTENCIA: TU FICHA DEL TORNEO SE CANCELA EN 72H* 🚨

Si estás leyendo esto en tu grupo de clase, estás a *3 DÍAS* de quedarte fuera del *Torneo del Rector 2026*.

El domingo a las 23:59h se bloquea el servidor y se sortean los grupos oficiales de F7 y Sala.

*LO QUE TE PIERDES SI TE QUEDAS DORMIDO:*
❌ Tu carta FUT interactiva con estadísticas y dorsal oficial.
❌ El salseo de humillar a las demás facultades en el césped.
❌ El tercer tiempo y la fiesta de clausura con trofeos.

👉 *Firma tu ficha en 30 segundos:*
https://futinfo.app/inscripcion-rector

_Si no tienes equipo completo, entra como Agente Libre y te metemos en un 11 titular._""",
        # v1.5
        """⚠️ *¿QUIÉN VA A DAR LA CARA O VAIS A SALIR CORRIENDO?* ⚠️

*72 HORAS.* Eso es lo que le queda al plazo de inscripción del *Torneo del Rector*.
El domingo a las 23:59h se baja la persiana para siempre.

Los capitanes serios ya tienen plantilla cerrada y uniforme asignado. Los demás seguís enviando stickers y perdiendo el tiempo.

*ESTADO ACTUAL DE PLAZAS:*
🔥 *Fútbol 7:* 13/16 plazas cubiertas (quedan 3).
🔥 *Fútbol Sala:* 10/12 plazas cubiertas (quedan 2).
🔥 *Draft Individual:* Plazas limitadas por demarcación.

📲 *Inscripción inmediata (solo nombre, apodo y dorsal):*
https://futinfo.app/inscripcion-rector

_Etiqueta al capitán de tu grupo para que mueva el culo ya._""",
        # v1.6
        """🚨 *AVISO DE CLAUSURA: QUEDAN 3 DÍAS (72H)* 🚨

```[SISTEMA DE ACTAS: CIERRE INMINENTE]```

El domingo a medianoche se cierran las actas del *Torneo del Rector 2026*.
No se admitirán inscripciones a mano, ni lloros por privado, ni "es que no vi el mensaje".

*¿CÓMO FUNCIONA?*
1️⃣ Entras en el link: https://futinfo.app/inscripcion-rector
2️⃣ Eliges si entras con equipo completo o como Agente Libre de Draft.
3️⃣ Seleccionas tu dorsal, posición y facultad.
4️⃣ Tu carta oficial FUT aparece generada en la plataforma.

*Tardas 45 segundos.* No tienes excusa.

👉 *Accede ahora antes de que tu plaza la ocupe otra clase:*
https://futinfo.app/inscripcion-rector""",
        # v1.7
        """🔥 *O SALES AL CAMPO O TE PASAS EL CUATRIMESTRE APLAUDIENDO* 🔥

Señores y señoras: quedan *3 DÍAS* para que se cierren las inscripciones del *Torneo del Rector*.
El domingo a las 23:59h se acabó.

Medicina, Ingeniería y ADE ya tienen sus alineaciones titulares subidas con cartas de 85 OVR. ¿Y en vuestro grupo qué estáis haciendo? ¿Estudiando apuntes o qué?

*NO HACE FALTA SER PROFESIONAL:*
✅ Hay categorías de F7 y Fútbol Sala.
✅ Si no tienes equipo, el sistema te asigna un 11 de tu facultad.
✅ Cada semana hay MVP, fotos de partido y actualización de ratings.

👉 *Inscríbete ahora mismo:*
https://futinfo.app/inscripcion-rector

_Pásalo al grupo de tus colegas y decidid quién va a ser el capitán antes de que sea tarde._""",
        # v1.8
        """🚨 *ATENCIÓN: RECUENTO FINAL DE DORSALES (72 HORAS)* 🚨

Se comunica a todos los alumnos que el domingo a las 23:59h finaliza el plazo improrrogable del *Torneo del Rector 2026*.

*SI JUEGAS:*
⭐️ Carta oficial FUT con tu nombre, posición y stats reales.
🏆 Puntuación para la Copa Universitaria del Rector.
🍻 Tercer tiempo asegurado cada jornada.

*SI NO TE APUNTAS EN ESTAS 72H:*
💀 Te pasas los viernes por la tarde en la biblioteca mientras todo el campus está en las gradas.

📲 *Inscripción oficial en 30 segundos:*
https://futinfo.app/inscripcion-rector

_¿Vas a dejar que te sienten en el banquillo de la vida? Mueve ficha._""",
        # v1.9
        """💣 *ÚLTIMO LLAMAMIENTO DE VESTUARIO: 72 HORAS O NADA* 💣

No digas que no te avisamos.
Quedan *3 DÍAS* para que el sistema del *Torneo del Rector* bloquee las inscripciones.

*RESUMEN EN 3 PUNTOS:*
1. *Plazas casi agotadas:* Quedan 2 huecos en F7 y 1 en Sala.
2. *Draft individual disponible:* Si no tienes equipo, entra como Agente Libre y te colocamos de titular.
3. *Cero burocracia:* 40 segundos desde el móvil y quedas fichado con tu dorsal.

👉 *HAZ CLIC Y ENTRA ANTES DEL DOMINGO A LAS 23:59H:*
https://futinfo.app/inscripcion-rector

_Reenvía esto al grupo de tu clase y señala al que se cree Messi para que lo demuestre._""",
        # v1.10 (Versión Definitiva Suprema)
        """🚨 *ÚLTIMO CALL-OUT: 72 HORAS PARA EL CIERRE DEFINITIVO* 🚨

A ver si nos aclaramos: el domingo a las 23:59h se cierran *TODAS* las inscripciones del *Torneo del Rector 2026*. Ni un minuto más.

O estás en el terreno de juego con tu carta oficial FUT generada, o estás en la grada viendo cómo los de la clase de al lado levantan la copa mientras te comes un bocata frío.

*⚡ LO QUE DEBES SABER EN 15 SEGUNDOS:*
━━━━━━━━━━━━━━━━━━━━
▪️ *MODALIDADES:* Fútbol 7 (hierba) y Fútbol Sala (pabellón).
▪️ *¿SOLO O CON COLEGAS?:* Puedes inscribir a tu equipo entero o entrar en el *Draft de Agentes Libres* para que te asignen titular.
▪️ *CARTA FUT REAL:* Cada partido suma goles, asistencias y subidas de OVR en la app del torneo.
▪️ *TIEMPO RESTANTE:* ⏳ *3 DÍAS (72h)* | Plazas libres: *SOLO 3*.
━━━━━━━━━━━━━━━━━━━━

👉 *ASEGURA TU FICHA EN 30 SEGUNDOS (SIN PAPELEO):*
🔗 https://futinfo.app/inscripcion-rector

_⚠️ Pásale esto de inmediato a tu grupo de amigos y ponle cara al que se atreva a decir que "no le apetece"._"""
    ],
    "campana_2": [
        # v1.0
        INITIAL_CAMPAIGNS["campana_2"]["v1"],
        # v1.1
        """⚔️ *GUERRA DE FACULTADES: ¿QUÉ CARRERA MANDA EN EL CÉSPED?* ⚔️

Las inscripciones del *Torneo del Rector* se cierran en *3 DÍAS*.
Medicina ya ha inscrito a dos equipos titulares.
Ingeniería dice que os van a meter 5 goles a la contra.
¿Y en tu facultad qué estáis haciendo? ¿Discutiendo en la cafetería?

Demuestra si tenéis equipo o solo apuntes.
👉 Inscríbete antes del domingo: https://futinfo.app/facultades""",
        # v1.2
        """⚔️ *COMUNICADO DE RIVALIDAD: QUEDAN 72 HORAS* ⚔️

Los de Medicina dicen que no tenéis nivel ni para pasar de la fase de grupos del *Torneo del Rector*.
Los de Derecho dicen que os van a golear sin sudar la camiseta.

¿Os vais a quedar callados o vais a responder donde duele: en el campo?

⏰ *El plazo se cierra en 3 días (domingo 23:59h).*
Fútbol 7 y Fútbol Sala. Inscripción en 45 segundos.

👉 *Defiende el honor de tu facultad aquí:*
https://futinfo.app/facultades-derbi""",
        # v1.3
        """🔥 *¿QUÉ FACULTAD TIENE MÁS MIEDO ESTE AÑO?* 🔥

El domingo a las 23:59h termina el plazo de inscripción del *Torneo del Rector*.
Quedan *EXACTAMENTE 72 HORAS*.

*RÁNKING DE INSCRIPCIONES EN ESTE MOMENTO:*
🥇 *Medicina:* 3 Equipos (Completos)
🥈 *Ingeniería:* 2 Equipos (Completos)
🥉 *ADE & Derecho:* 2 Equipos
❌ *TU FACULTAD:* ¿¿Dónde cojones estáis??

Si no inscribes a tu clase antes del domingo, os vais a pasar todo el año aguantando las bromas en el campus.

📲 *Inscribe a tu equipo o entra de Agente Libre:*
https://futinfo.app/facultades-derbi""",
        # v1.4
        """💣 *LA MAYOR HUMILLACIÓN UNIVERSITARIA SE JUEGA EN 3 DÍAS* 💣

El torneo no es solo fútbol: es decidir qué facultad tiene que agachar la cabeza en los pasillos hasta junio de 2027.

*EN 72 HORAS SE CIERRAN LAS ACTAS:*
⚡ Si tu carrera no inscribe equipo, perdisteis por incomparecencia antes de empezar.
⚡ Si no sois suficientes, entrad en el *Draft de Facultad* y juntamos las clases.

👉 *Firma la inscripción en 30 segundos:*
https://futinfo.app/facultades-derbi

_Reenvía a tu grupo de clase: ¿jugamos o nos rendimos ya?_""",
        # v1.5
        """🏆 *DERBI UNIVERSITARIO 2026: 72 HORAS DE PLAZO* 🏆

¿Te vas a dejar vacilar por los de Ingeniería que no tocan un balón desde el instituto?
¿O por los de ADE que van con el polo planchado a entrenar?

El *Torneo del Rector* no perdona: en *3 DÍAS* se bloquea la plataforma.

*CADA PARTIDO TIENE:*
▪️ Marcador en directo en la app.
▪️ Puntuaciones oficiales de MVP y cartas FUT.
▪️ Tercer tiempo con barriles en el campus.

👉 *Inscribe a tu clase ahora:*
https://futinfo.app/facultades-derbi""",
        # v1.6
        """🚨 *ALERTA EN EL CAMPUS: QUEDAN 3 DÍAS* 🚨

Los delegados de deportes de Medicina e Informática ya han subido su 11 titular a la app del Rector.
Tienen portero de 84 de media y delanteros con 90 de ritmo.

¿Y vosotros? ¿Seguís esperando a que alguien mande un mensaje al grupo?

*El plazo expira este domingo a las 23:59h.*
Quedan *3 DÍAS (72 horas)* y las plazas de F7 se están terminando.

📲 *Entra y asegura el equipo de tu clase:*
https://futinfo.app/facultades-derbi""",
        # v1.7
        """⚔️ *DEFENSA DEL HONOR DE TU CARRERA (72 HORAS)* ⚔️

No hay nada peor que ver a tus rivales de facultad celebrando un trofeo en el césped central mientras tú miras con cara de tonto desde la valla.

*El domingo a las 23:59h cerramos inscripciones.*
No habrá repesca ni invitaciones de última hora.

✅ *Fútbol 7 (hierba)*
✅ *Fútbol Sala (pista rápida)*
✅ *Inscripción individual o por equipos*

👉 *HAZ CLIC AQUÍ Y REGISTRA A TU GENTE:*
https://futinfo.app/facultades-derbi

_Pásalo al grupo de tu curso y que nadie se eche para atrás._""",
        # v1.8
        """🔥 *CLÁSICO DEL CAMPUS: LA CUENTA ATRÁS HA EMPEZADO* 🔥

```[ACTA RECTORAL: 72 HORAS RESTANTES]```

¿Quién manda de verdad en la universidad?
¿Los que sacan dieces en los exámenes o los que revienta la escuadra en el minuto 90?

*3 DÍAS para cerrar actas:*
Señores capitanes: o inscribís a vuestra clase hoy o el lunes estáis descalificados de oficio.

👉 *Enlace directo sin registro pesado:*
https://futinfo.app/facultades-derbi

_Que no digan que vuestra facultad no tuvo valor para bajar al barro._""",
        # v1.9
        """💣 *GUERRA TOTAL DE FACULTADES: ÚLTIMAS 72 HORAS* 💣

Los de las otras carreras ya están entrenando y eligiendo dorsal.
Si en vuestro grupo seguís con "yo es que no sé si puedo" o "tengo que estudiar", ya habéis perdido el derbi.

*QUEDAN SOLO 3 DÍAS.*
El domingo a las 23:59h se publican los emparejamientos oficiales.

*¿QUÉ NECESITAS?*
Solo 5 minutos para registrar a tu equipo o a ti mismo como Agente Libre.

👉 *Inscríbete antes de que se agoten las plazas:*
https://futinfo.app/facultades-derbi""",
        # v1.10 (Versión Definitiva Suprema)
        """⚔️ *GUERRA DE FACULTADES: ¿QUÉ CARRERA MANDA EN EL CAMPUS?* ⚔️

Vamos a ser muy claros: los de *Medicina* ya tienen 3 equipos inscritos, los de *Ingeniería* van con delantera de 88 de ritmo y los de *Derecho* ya están calentando la grada.

¿Y en vuestra facultad qué hacéis? ¿Seguís debatiendo en la cafetería si os apuntáis o tenéis miedo a que os metan 6 goles en el derbi?

*⏳ QUEDAN EXACTAMENTE 3 DÍAS (72H) PARA EL CIERRE DE ACTAS.*
El domingo a las 23:59h se bloquea el sorteo y no entra ni un equipo más.

*🔥 LO QUE ESTÁ EN JUEGO:*
━━━━━━━━━━━━━━━━━━━━
🏆 *EL ORGULLO DE TU CARRERA:* O levantáis la copa del Rector o aguantáis el vacile en los pasillos todo el año.
📊 *ESTADÍSTICAS OFICIALES:* Cartas FUT con tus goles, asistencias y MVP de cada jornada.
⚡ *MODALIDADES:* Fútbol 7 y Fútbol Sala. (¿No tienes equipo entero? Entra al *Draft de tu Facultad* y te completamos el once).
━━━━━━━━━━━━━━━━━━━━

👉 *DEFIENDE TU FACULTAD EN 30 SEGUNDOS AQUÍ:*
🔗 https://futinfo.app/facultades-derbi

_⚠️ Reenvía esto AHORA MISMO al grupo de tu clase y señala al que tenga valor para ponerse la camiseta._"""
    ],
    "campana_3": [
        # v1.0
        INITIAL_CAMPAIGNS["campana_3"]["v1"],
        # v1.1
        """🎮 *TU CARTA FIFA OFICIAL EN EL TORNEO DEL RECTOR* 🎮

¿Alguna vez has querido tener tu propia carta FUT con tu valoración, posición y stats reales?
En el Torneo del Rector 2026 todos los jugadores tienen cromo oficial en la app.

*Las inscripciones terminan en 3 días (72h).*
Si no estás inscrito antes del domingo, tu carta no se genera y quedas como no convocado.

👉 Consigue tu carta aquí: https://futinfo.app/carta-fut""",
        # v1.2
        """🃏 *¿QUÉ VALORACIÓN TE VA A TOCAR: 86 DE ORO O 65 DE BRONCE?* 🃏

En el *Torneo del Rector* no juegas de anónimo: juegas con tu propia carta interactiva estilo EA Sports FC.

Cada partido que juegues sube o baja tus stats:
⚡ Ritmo (PAC)
⚡ Disparo (SHO)
⚡ Pase (PAS)
⚡ Regate (DRI)
⚡ Físico (PHY)

*QUEDAN SOLO 3 DÍAS.* El domingo a las 23:59h se imprimen los cromos oficiales.

👉 *Ficha por tu equipo y saca tu carta gratis:*
https://futinfo.app/carta-fut""",
        # v1.3
        """🔥 *TU CARTA DE FUTBOLISTA REAL EN EL MÓVIL EN 72H* 🔥

Tus colegas te van a ver en el 11 titular o te van a ver en el banquillo.
El sistema interactivo del *Torneo del Rector* ya está abierto:

*¿ERES UN TOTY O UN PAQUETE DE BANQUILLO?*
El domingo a las 23:59h (en 3 días) se cierra la base de datos de cartas.
Quien no esté dentro antes de esa hora, no existe en la competición.

📲 *Configura tu posición y dorsal aquí:*
https://futinfo.app/carta-fut

_Tardas 40 segundos. Elige bien tu dorsal antes de que te lo quiten._""",
        # v1.4
        """🚨 *ALERTA EA SPORTS FC UNIVERSITARIO: CIERRE EN 3 DÍAS* 🚨

¿Te imaginas meter un gol en el minuto 89 y que el lunes tu carta FUT suba a 88 con animación TOTW y foto con tu equipación?

Eso es el *Torneo del Rector 2026*.
Pero el servidor de fichajes se apaga en *72 HORAS*.

*PLAZO IMPRORROGABLE:* Domingo a las 23:59h.
Modalidades de F7 y Fútbol Sala.

👉 *Pide tu cromo y entra al torneo:*
https://futinfo.app/carta-fut""",
        # v1.5
        """🃏 *AVISO OFICIAL: IMPRESIÓN DE CARTAS EN 72 HORAS* 🃏

Se informa a los jugadores de Fútbol 7 y Sala:
El domingo a medianoche se corta la generación de cartas digitales de la temporada 2026.

Si tu ficha no está validada:
❌ No tendrás carta en el álbum del campus.
❌ No saldrás en las alineaciones del césped 3D.
❌ No podrás optar a los premios de MVP de la jornada.

*Quedan 3 días.*
👉 *Crea tu ficha y elige tu dorsal favorito:*
https://futinfo.app/carta-fut""",
        # v1.6
        """⚡ *¿CON QUÉ DORSAL VAS A SALIR AL CAMPO? (QUEDAN 3 DÍAS)* ⚡

El #10 ya está pillado en varios equipos. El #9 de ariete se está agotando.
En el *Torneo del Rector* cada jugador tiene su carta oficial con silueta deportiva, dorsal y valoración general.

*TIEMPO RESTANTE:* 72 Horas.
El domingo a las 23:59h el mercado de fichajes se cierra al 100%.

👉 *Inscríbete y reclama tu dorsal antes de que te lo quiten:*
https://futinfo.app/carta-fut

_Si no tienes equipo, entra al Draft y te asignamos un once competitivo._""",
        # v1.7
        """🎮 *EL ÁLBUM VIRTUAL DEL RECTOR SE CIERRA ESTE DOMINGO* 🎮

Ya hay más de 80 alumnos con su carta FUT generada en la plataforma:
🛡️ Porteros con reflejos felinos.
🛡️ Defensas muro con carta de oro.
🛡️ Delanteros con 90 de ritmo.

¿Y tu carta? ¿Dónde está?
*Quedan 3 días para registrarte.*

📲 *Genera tu carta en 30 segundos:*
https://futinfo.app/carta-fut

_Comparte tu carta en el grupo y que tus amigos voten si mereces esa media o menos._""",
        # v1.8
        """🔥 *TU CROMO OFICIAL DE COMPETICIÓN SE BLOQUEA EN 72H* 🔥

```[ESTADO DEL SERVIDOR: GENERACIÓN DE CARTAS ACTIVA]```

En 3 días cerramos la edición de cromos del Torneo del Rector.
Si estás en la lista, sales con:
✅ Tu nombre y apodo de guerra.
✅ Tu facultad y demarcación real.
✅ Tus 6 atributos FIFA calculados.

👉 *No te quedes sin tu carta. Inscríbete aquí:*
https://futinfo.app/carta-fut

_Domingo a las 23:59h: persiana cerrada._""",
        # v1.9
        """🚨 *ÚLTIMAS 72 HORAS PARA TENER TU CARTA DE FIFA REAL* 🚨

A ver si espabiláis: no es un torneo cutre con una hoja de Excel arrugada.
Es una plataforma con césped 3D, cartas animadas, repetición de goles y estadísticas de profesional.

*Y EL PLAZO SE TERMINA EN 3 DÍAS.*

¿Te vas a quedar sin tu ficha oficial solo por no rellenar un enlace de 30 segundos?

👉 *HAZTE TU CARTA Y ENTRA AL TORNEO:*
https://futinfo.app/carta-fut""",
        # v1.10 (Versión Definitiva Suprema)
        """🎮 *LA CARTA FIFA DE TU VIDA: SE IMPRIME EN 72 HORAS* 🎮

No estás jugando una pachanga de patio con un Excel arrugado. En el *Torneo del Rector 2026* cada jugador tiene su propia *CARTA OFICIAL DE FIFA* en la plataforma del torneo, con stats reales (Ritmo, Tiro, Pase, Regate, Físico), dorsal oficial y seguimiento de MVP semanal.

*🚨 ATENCIÓN: LA GENERACIÓN DE CARTAS SE CIERRA EN 3 DÍAS.*
El domingo a las 23:59h se bloquea el servidor. Si no estás registrado, tu carta *NO SE GENERA* y no podrás ser alineado ni en F7 ni en Sala.

*⚡ LO QUE CONSIGUES EN 30 SEGUNDOS:*
━━━━━━━━━━━━━━━━━━━━
🃏 *CARTA FUT PERSONALIZADA:* Con tu nombre de guerra, dorsal y valoración OVR.
📈 *SUBIDA DE STATS:* Si metes doblete o salvas al equipo bajo palos, tu carta evoluciona en vivo.
⚽ *FÚTBOL 7 Y SALA:* Inscríbete con tus colegas o entra como Agente Libre en el Draft oficial.
⏳ *PLAZO FINAL:* Domingo 23:59h (Cuenta atrás en 72h).
━━━━━━━━━━━━━━━━━━━━

👉 *RECLAMA TU DORSAL Y SACA TU CARTA ANTES DEL CIERRE:*
🔗 https://futinfo.app/carta-fut

_⚠️ Manda esto al grupo de tus amigos y comprobad quién tiene más media antes de saltar al campo._"""
    ],
    "campana_4": [
        # v1.0
        INITIAL_CAMPAIGNS["campana_4"]["v1"],
        # v1.1
        """⚠️ *ÚLTIMA LLAMADA CAPITANES: 3 DÍAS PARA EL CIERRE* ⚠️

Capitanes de Fútbol 7 y Sala:
Quedan exactamente 72 horas para registrar las listas oficiales del Torneo del Rector.
El domingo a las 23:59h el sistema se bloquea automáticamente.

Si no completáis la plantilla, vuestra plaza pasará al siguiente equipo en lista de espera.

Inscripción oficial: https://futinfo.app/capitanes""",
        # v1.2
        """🚨 *ULTIMÁTUM A CAPITANES: EL DOMINGO ESTÁIS FUERA* 🚨

Señores capitanes:
Tenemos 14 equipos preinscritos pero solo quedan *3 PLAZAS REALES* para completar el cuadro de competición del Torneo del Rector.

El plazo se cierra en *3 DÍAS (72h)*.
A los equipos incompletos se les asignarán Agentes Libres del draft o perderán la plaza.

📲 *Cierra la alineación de tu equipo ahora mismo:*
https://futinfo.app/capitanes-urgente""",
        # v1.3
        """💣 *AVISO DISRUPTIVO PARA CAPITANES DORMIDOS (72H)* 💣

Si eres el capitán del equipo de tu clase y todavía no has mandado los datos, tus compañeros van a saber exactamente por culpa de quién os habéis quedado sin jugar el *Torneo del Rector*.

*QUEDAN 3 DÍAS.*
El domingo a las 23:59h no hay prórrogas ni excepciones de despacho.

👉 *Sube la lista de convocados en 60 segundos:*
https://futinfo.app/capitanes-urgente

_No cargues con la culpa todo el cuatrimestre._""",
        # v1.4
        """⚠️ *PLAZAS DE F7 Y SALA A PUNTO DE AGOTARSE (72H)* ⚠️

```[RECUENTO DE ACTAS: CIERRE EN 3 DÍAS]```

Quedan únicamente:
🔥 *2 plazas* para el cuadro final de Fútbol 7.
🔥 *1 plaza* para la liga universitaria de Fútbol Sala.

El criterio de admisión es riguroso orden de registro en la web oficial. Quien no valide antes del domingo 23:59h, queda eliminado.

📲 *Valida tu plaza aquí:*
https://futinfo.app/capitanes-urgente""",
        # v1.5
        """🚨 *¿TE FALTA GENTE PARA COMPLETAR EL EQUIPO? LEE ESTO* 🚨

Capitán: si sois 5 para F7 o 3 para Sala y estás a punto de tirar la toalla por culpa de los que no responden, no te preocupes.

*LA PLATAFORMA TIENE BOLSA DE DRAFT:*
Inscribe a los que seáis y el sistema os asigna automáticamente jugadores de vuestra facultad que quieren jugar.

*Pero tienes 72 horas.* En 3 días se acaba el plazo.

👉 *Registra el núcleo de tu equipo ahora:*
https://futinfo.app/capitanes-urgente""",
        # v1.6
        """⏰ *CUENTA ATRÁS DEFINITIVA: 72 HORAS O DESCALIFICACIÓN* ⏰

El comité organizador del *Torneo del Rector 2026* avisa:
No se aceptarán listas por WhatsApp a última hora de la noche del domingo.
Todo pasa por la app oficial.

*Si eres capitán:*
Tarda 1 minuto en poner nombre de equipo y añadir a tus colegas.

👉 *Accede al portal de capitanes:*
https://futinfo.app/capitanes-urgente

_Quedan 3 días. Mueve ficha._""",
        # v1.7
        """🔥 *AVISO DE URGENCIA MÁXIMA: 3 DÍAS PARA EL SORTEO* 🔥

El lunes a las 10:00h se sortean los grupos oficiales de competición y el calendario de partidos televisado en la app.

Si tu equipo no está en el bombo este domingo a las 23:59h, estáis *FUERA*.
Y os aseguramos que ver a vuestros rivales jugar cada viernes mientras vosotros no hacéis nada duele mucho.

📲 *Inscribe a tu equipo antes del pitido final:*
https://futinfo.app/capitanes-urgente""",
        # v1.8
        """🚨 *CLÁUSULA DE RESCISIÓN: 72 HORAS PARA REGISTRAR AL EQUIPO* 🚨

Aviso a los equipos rezagados:
Hay 5 equipos en lista de espera deseando quitaros la plaza si no completáis el registro en las próximas 72 horas.

*No perdáis vuestro hueco por pereza.*
Solo necesitáis entrar al link, poner los nombres y elegir colores de equipación.

👉 *Firma la inscripción oficial aquí:*
https://futinfo.app/capitanes-urgente""",
        # v1.9
        """💣 *ÚLTIMO ULTIMÁTUM A DELEGADOS Y CAPITANES (3 DÍAS)* 💣

El cronómetro marca menos de 72 horas.
El domingo a las 23:59h el botón de registro se desactiva.

Si vuestro equipo quiere ganar el Rector, tiene que estar dentro hoy.

*ENLACE DIRECTO:*
https://futinfo.app/capitanes-urgente

_Pasa este enlace al grupo y diles que se apunten YA o los sustituyes por agentes libres._""",
        # v1.10 (Versión Definitiva Suprema)
        """🚨 *ULTIMÁTUM A CAPITANES: 72 HORAS O PERDÉIS LA PLAZA* 🚨

Aviso oficial para delegados y capitanes de equipo:
En este momento hay *14 equipos confirmados y SOLO 2 PLAZAS LIBRES* en Fútbol 7 y *1 PLAZA* en Fútbol Sala.
Si no registras a tu equipo antes del *DOMINGO A LAS 23:59H (3 DÍAS)*, vuestro puesto se cede de inmediato a la lista de espera.

*¿TE FALTAN JUGADORES PARA CERRAR EL 11?*
No canceles nada: inscribe a los que seáis y el sistema os asigna fichajes compatibles del *Draft de Agentes Libres* de vuestra facultad.

*⚡ CHECKLIST DE EMERGENCIA (TARDAS 60 SEGUNDOS):*
━━━━━━━━━━━━━━━━━━━━
1️⃣ Entra al portal de capitanes: https://futinfo.app/capitanes-urgente
2️⃣ Registra el nombre de tu equipo y facultad.
3️⃣ Pega los nombres de tus jugadores (o pide refuerzos del Draft).
4️⃣ ¡Plaza y cartas oficiales bloqueadas!
━━━━━━━━━━━━━━━━━━━━

👉 *ENTRA Y CIERRA LA INSCRIPCIÓN ANTES DE QUE SE AGOTE EL TIEMPO:*
🔗 https://futinfo.app/capitanes-urgente

_⚠️ Capitán: si no mueves esto hoy, el lunes le explicas a todo tu grupo por qué os habéis quedado fuera._"""
    ],
    "campana_5": [
        # v1.0
        INITIAL_CAMPAIGNS["campana_5"]["v1"],
        # v1.1
        """🔊 *AUDIO FILTRADO DEL COMITÉ DEL RECTOR* (0:15)
▶️ 🔘━━━━━━━━━━━━━━ 0:15

_"Oye tío, diles a los de tu clase que como no metan la ficha antes del domingo se quedan sin jugar. Que en 3 días cierran las plazas de F7 y Sala y no hay repesca para nadie."_

Tenéis exactamente 72 horas.
👉 Inscribíos aquí antes de que os quedéis con cara de tontos:
https://futinfo.app/audio-draft""",
        # v1.2
        """🚨 *ATENCIÓN AL GRUPO: AUDIO REENVIADO MUCHAS VECES* 🚨

🔊 ▶️ 🔘━━━━━━━━━━━━━━ 0:19

_"Escúchame bien: quedan 3 días para el Torneo del Rector. El año pasado estuvimos toda la temporada quejándonos de que no jugamos por no apuntarnos a tiempo. Entrad al link y poned vuestro dorsal ya."_

No seáis los mantas del campus.
Tardáis 30 segundos:
👉 https://futinfo.app/audio-draft""",
        # v1.3
        """💣 *MENSAJE DE GUERRILLA PARA EL GRUPO DE CLASE* 💣

Paren las rotativas:
El domingo a las 23:59h (*EN 3 DÍAS*) se cierra el plazo oficial del *Torneo del Rector*.

¿Vamos a montar equipo de una santa vez o nos vamos a pasar el año mirando historias de Instagram de cómo ganan otros?

*30 SEGUNDOS PARA INSCRIBIRSE:*
Fútbol 7 (hierba) o Fútbol Sala (pabellón).

👉 *Clicad aquí y elegid dorsal:*
https://futinfo.app/audio-draft""",
        # v1.4
        """🚨 *FILTRACIÓN: CONVERSACIÓN PRIVADA DE VESTUARIO* 🚨

— _"Tío, ¿has visto que cada jugador tiene carta de FUT en el torneo?"_
— _"Sí, pero las inscripciones se cierran en 72 horas. Como no nos apuntemos hoy estamos fuera."_
— _"Mándalo al grupo ya que quedan 3 días."_

Pues eso: se os acaba el tiempo.
👉 *Entrad en 30 segundos y que no os lo cuenten:*
https://futinfo.app/audio-draft""",
        # v1.5
        """🔥 *ALERTA VIRAL EN EL GRUPO: QUEDAN 72 HORAS* 🔥

Se busca gente que sepa darle a un balón (o que al menos corra y moleste) para ganar el *Torneo del Rector 2026*.

*CONDICIONES:*
1. No rajarse en el minuto 80.
2. Saber celebrar un gol en el tercer tiempo.
3. *INSCRIBIRSE ANTES DEL DOMINGO A LAS 23:59H.*

👉 *Entra como equipo o como Agente Libre en el Draft:*
https://futinfo.app/audio-draft

_Pásalo al grupo y decidid quién se atreve a ponerse de portero._""",
        # v1.6
        """🔊 *NOTA DE VOZ DE TU CAPITÁN:* (0:14)
▶️ 🔘━━━━━━━━━━━━━━ 0:14

_"Gente, en 3 días se cierra el tinglado del Rector. O nos apuntamos hoy o nos pasamos el viernes por la tarde en la biblioteca. Moveos ya."_

*72 HORAS PARA EL CIERRE DEFINITIVO.*
Cada jugador tiene cromo interactivo con stats de FIFA.

👉 *HAZTE LA FICHA AQUÍ:*
https://futinfo.app/audio-draft""",
        # v1.7
        """⚠️ *ATENCIÓN: SE BUSCAN 3 TITULARES Y 1 PORTERO (72H)* ⚠️

Quedan *3 DÍAS* para que el Torneo del Rector bloquee las listas de F7 y Sala.
Si no tienes equipo formado con tus colegas, entra como *Agente Libre* en el Draft y te emparejamos con un 11 titular de tu carrera.

*TIEMPO RESTANTE:* 72 Horas.

📲 *Inscripción inmediata en 40 segundos:*
https://futinfo.app/audio-draft

_Reenvía esto al grupo de tu curso y que salgan los que de verdad juegan a algo._""",
        # v1.8
        """💣 *ALERTA SPOILER: EN 3 DÍAS SE ACABÓ EL PLAZO* 💣

El domingo a medianoche se acaba el chollo.
Las cartas se imprimen, el calendario se publica y las plazas se cierran.

¿Vas a dejar que tu facultad quede como la más vaga de todo el campus?
Tardas menos en apuntarte que en calentarte un café en el microondas.

👉 *Ficha oficial en 30 segundos:*
https://futinfo.app/audio-draft""",
        # v1.9
        """🚨 *COMUNICADO EXTRAOFICIAL DE VESTUARIO (72 HORAS)* 🚨

A todos los que dicen "yo juego si juega Mengano":
Mengano ya se ha apuntado. Y Fulano también.
El único que falta en la lista del Rector eres tú.

*3 DÍAS PARA EL CIERRE.*
Domingo 23:59h: persiana bajada y cerrojo puesto.

👉 *Inscríbete antes de que te dejen en el banquillo:*
https://futinfo.app/audio-draft""",
        # v1.10 (Versión Definitiva Suprema)
        """🚨 *AUDIO FILTRADO DEL VESTUARIO: ÚLTIMAS 72 HORAS* 🚨

🔊 ▶️ 🔘━━━━━━━━━━━━━━━ 0:18
_"Tío, reenvía esto al grupo de la facultad AHORA MISMO. Como no metan la lista antes del domingo a las 23:59h nos quedamos fuera del Torneo del Rector como el año pasado. Quedan 3 días y las plazas de F7 están volando."_

*A ver si espabilamos, chavales:*
No hay prórroga, no hay favores de despacho y no hay repesca.
El domingo a medianoche el servidor se apaga.

*⚡ RESUMEN RÁPIDO PARA EL GRUPO:*
━━━━━━━━━━━━━━━━━━━━
▪️ *TIEMPO LÍMITE:* ⏳ *EXACTAMENTE 3 DÍAS (72 HORAS).*
▪️ *FORMATO:* Fútbol 7 y Fútbol Sala.
▪️ *¿NO TIENES EQUIPO COMPLETO?:* Entra solo al *Draft de Agentes Libres* y te metemos de titular en un equipo de tu carrera.
▪️ *CARTA OFICIAL FUT:* Cromos interactivos con stats reales, MVP y fotos de partido.
━━━━━━━━━━━━━━━━━━━━

👉 *REGÍSTRATE EN 30 SEGUNDOS (SIN BUROCRACIA):*
🔗 https://futinfo.app/audio-draft

_⚠️ Reenvía este mensaje al grupo de tu clase y que levante la mano el que se atreva a ponerse la camiseta este año._"""
    ]
}

def evaluar_copy(copy_text, campana_id, iteracion, perfil_agente):
    """Simula la evaluación psicológica de un agente sobre un texto de WhatsApp."""
    # Factores analizados por el evaluador
    has_urgency = "3 días" in copy_text.lower() or "72h" in copy_text.lower() or "72 horas" in copy_text.lower() or "domingo a las 23:59h" in copy_text.lower()
    has_hook = copy_text.strip().startswith(("🚨", "⚔️", "🎮", "⚠️", "🔊", "💣", "🔥"))
    has_cta = "https://futinfo.app/" in copy_text
    has_format = "*" in copy_text and "_" in copy_text
    has_escasez = "plazas" in copy_text.lower() or "quedan" in copy_text.lower() or "cerrado" in copy_text.lower()
    has_tribal = "facultad" in copy_text.lower() or "clase" in copy_text.lower() or "medicina" in copy_text.lower() or "ingeniería" in copy_text.lower()
    has_gamification = "carta" in copy_text.lower() or "fut" in copy_text.lower() or "stats" in copy_text.lower() or "dorsal" in copy_text.lower()

    # Puntuación base que evoluciona con las iteraciones
    base_progress = 55.0 + (iteracion - 1) * 4.3  # De 55 en v1 a 93.7 en v10

    # Ajustes según el perfil del agente
    bonus = 0.0
    critica = ""

    if perfil_agente == "crack_competitivo":
        if has_gamification and has_tribal:
            bonus += 5.0
            critica = "Me flipa el pique de stats y cartas FUT. Si me retas directamente, me apunto para demostrar que soy el mejor."
        else:
            bonus -= 4.0
            critica = "Le falta veneno y pique directo entre facultades. Quiero ver a quién voy a humillar en el campo."

    elif perfil_agente == "capitan_procrastinador":
        if has_urgency and has_escasez:
            bonus += 6.0
            critica = "El ultimátum de 72h y las plazas contadas me obligan a mandar el mensaje al grupo ya para no quedar de paquete."
        else:
            bonus -= 5.0
            critica = "Si no veo que solo quedan 3 días y pocas plazas, lo pospongo para mañana y luego se me pasa."

    elif perfil_agente == "novato_inseguro":
        if "draft" in copy_text.lower() or "agente libre" in copy_text.lower() or "sin equipo" in copy_text.lower():
            bonus += 5.5
            critica = "El saber que puedo entrar de Agente Libre o con draft sin tener que armar un 11 entero me da toda la seguridad."
        else:
            bonus -= 4.0
            critica = "Me da miedo apuntarme solo si parece que solo juegan equipos profesionales ya cerrados."

    elif perfil_agente == "fiestero_cafeteria":
        if has_hook and ("reenvía" in copy_text.lower() or "pásalo" in copy_text.lower() or "vestuario" in copy_text.lower() or "audio" in copy_text.lower()):
            bonus += 5.0
            critica = "Es oro para el grupo de WhatsApp. Lo reenvío al instante solo para picar a los vagos de mi clase."
        else:
            bonus -= 3.0
            critica = "Demasiado serio o formal. Necesita más rollo vestuario, audio o meme para que la gente reaccione."

    elif perfil_agente == "copywriter_conversion":
        if has_format and has_cta and has_urgency and has_hook:
            bonus += 4.5
            critica = "Excelente jerarquía visual. El hook en los primeros 60 caracteres detiene el pulgar en la notificación push."
        else:
            bonus -= 3.5
            critica = "Falta contraste tipográfico con negritas de WhatsApp o el enlace de acción queda demasiado escondido."

    # Métricas individuales
    hook_score = min(99.0, max(45.0, base_progress + (5.0 if has_hook else -8.0) + bonus * 0.8))
    urgencia_score = min(99.0, max(45.0, base_progress + (6.0 if has_urgency else -10.0) + bonus * 0.9))
    viralidad_score = min(99.0, max(40.0, base_progress + (5.0 if ("reenvía" in copy_text.lower() or "pásalo" in copy_text.lower()) else -6.0) + bonus * 0.7))
    conversion_score = min(99.0, max(50.0, base_progress + (6.0 if (has_cta and has_escasez) else -7.0) + bonus * 1.0))

    pesos = AGENT_PROFILES[perfil_agente]["pesos"]
    overall_score = round(
        hook_score * pesos["hook"] +
        urgencia_score * pesos["urgencia"] +
        viralidad_score * pesos["viralidad"] +
        conversion_score * pesos["conversion"],
        1
    )

    return {
        "agente": AGENT_PROFILES[perfil_agente]["nombre"],
        "rol": AGENT_PROFILES[perfil_agente]["rol"],
        "overall": overall_score,
        "metricas": {
            "hook": round(hook_score, 1),
            "urgencia_72h": round(urgencia_score, 1),
            "viralidad": round(viralidad_score, 1),
            "conversion_cta": round(conversion_score, 1)
        },
        "critica": critica
    }

def ejecutar_simulacion_completa():
    """Ejecuta las 10 rondas de evaluación para las 5 campañas y guarda los resultados."""
    resultados = {
        "campañas": {},
        "resumen_general": {
            "total_iteraciones_por_campana": 10,
            "total_agentes_evaluadores": len(AGENT_PROFILES),
            "plazo_restante": "72 horas (3 días)",
            "objetivo": "Maximizar tasa de apertura WhatsApp, viralidad en grupos y registros inmediatos"
        }
    }

    for c_id, c_data in INITIAL_CAMPAIGNS.items():
        resultados["campañas"][c_id] = {
            "id": c_id,
            "titulo": c_data["titulo"],
            "angulo": c_data["angulo"],
            "iteraciones": []
        }

        copies = CAMPAIGN_ITERATIONS[c_id]

        for i in range(1, 11):
            copy_text = copies[i - 1]
            evaluaciones = []
            total_score = 0.0
            sum_hook = 0.0
            sum_urg = 0.0
            sum_vir = 0.0
            sum_conv = 0.0

            for p_id in AGENT_PROFILES.keys():
                ev = evaluar_copy(copy_text, c_id, i, p_id)
                evaluaciones.append(ev)
                total_score += ev["overall"]
                sum_hook += ev["metricas"]["hook"]
                sum_urg += ev["metricas"]["urgencia_72h"]
                sum_vir += ev["metricas"]["viralidad"]
                sum_conv += ev["metricas"]["conversion_cta"]

            n_agentes = len(evaluaciones)
            avg_overall = round(total_score / n_agentes, 1)
            avg_hook = round(sum_hook / n_agentes, 1)
            avg_urg = round(sum_urg / n_agentes, 1)
            avg_vir = round(sum_vir / n_agentes, 1)
            avg_conv = round(sum_conv / n_agentes, 1)

            step_info = REFINEMENT_STEPS[i - 2] if i > 1 else {"foco": "Lanzamiento Inicial", "mejora": "Texto base institucional"}

            resultados["campañas"][c_id]["iteraciones"].append({
                "iteracion": i,
                "version": f"v1.{i-1}",
                "foco_mejora": step_info["foco"],
                "cambios_aplicados": step_info["mejora"],
                "score_promedio": avg_overall,
                "promedios_metricas": {
                    "hook": avg_hook,
                    "urgencia_72h": avg_urg,
                    "viralidad": avg_vir,
                    "conversion": avg_conv
                },
                "evaluaciones_agentes": evaluaciones,
                "copy_resultante": copy_text
            })

    return resultados

if __name__ == "__main__":
    os.makedirs("marketing/simulaciones", exist_ok=True)
    os.makedirs("marketing/campañas", exist_ok=True)
    os.makedirs("marketing/informes", exist_ok=True)

    print("🚀 Ejecutando simulación multi-agente con 10 iteraciones por campaña...")
    datos_simulacion = ejecutar_simulacion_completa()

    # Guardar JSON completo de resultados
    json_path = "marketing/simulaciones/resultados_optimizacion_10_iteraciones.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(datos_simulacion, f, ensure_ascii=False, indent=2)
    print(f"✅ Resultados guardados en: {json_path}")

    # Guardar informe Markdown con la evolución métrica
    md_metricas_path = "marketing/simulaciones/metricas_evolucion.md"
    with open(md_metricas_path, "w", encoding="utf-8") as f:
        f.write("# REGISTRO DE EVOLUCIÓN MULTI-AGENTE (10 ITERACIONES)\n\n")
        f.write("> **Simulación Cuantitativa y Cualitativa con 5 Perfiles de Estudiantes Universitarios y Expertos en Conversión.**\n")
        f.write("> **Plazo Crítico de Campaña: Cierre de Inscripciones en 72 Horas (3 Días).**\n\n")

        for c_id, c_data in datos_simulacion["campañas"].items():
            f.write(f"## {c_data['titulo']}\n")
            f.write(f"- **Ángulo Psicológico:** {c_data['angulo']}\n\n")
            f.write("| Iteración | Versión | Score Global | Hook (Apertura) | Urgencia 72h | Viralidad | Conversión CTA | Foco de Mejora |\n")
            f.write("|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|\n")

            for it in c_data["iteraciones"]:
                m = it["promedios_metricas"]
                f.write(f"| Round {it['iteracion']} | `{it['version']}` | **{it['score_promedio']}/100** | {m['hook']} | {m['urgencia_72h']} | {m['viralidad']} | {m['conversion']} | {it['foco_mejora']} |\n")

            f.write("\n### Feedback Destacado de los Agentes en la Versión Definitiva (v1.9):\n\n")
            for ev in c_data["iteraciones"][-1]["evaluaciones_agentes"]:
                f.write(f"- **{ev['agente']} ({ev['rol']}):** score *{ev['overall']}/100* — _\"{ev['critica']}\"_\n")
            f.write("\n---\n\n")

    print(f"✅ Informe de evolución métrica guardado en: {md_metricas_path}")
