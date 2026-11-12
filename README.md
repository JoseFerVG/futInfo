# futInfo - Torneo del Rector 2026 (FIFA FUT Hub)

> **Ecosistema de competición universitaria con interfaz interactiva EA Sports FIFA Ultimate Team y división estratégica de captación masiva.**

---

## 🗂️ ESTRUCTURA DEL PROYECTO

El proyecto está organizado en dos divisiones principales para separar el desarrollo de la aplicación web y la estrategia de marketing y captación:

```
futInfo/
├── index.html                    # Redirección automática a /repo/index.html
├── README.md                     # Documentación principal del espacio de trabajo
│
├── repo/                         # CÓDIGO FUENTE DE LA APLICACIÓN WEB
│   ├── index.html                # HUD Consola Broadcast 16:9 interactivo
│   ├── assets/                   # Fondos de estadio nocturno, texturas y assets FIFA
│   ├── css/                      # broadcast.css (HUD TV) y styles.css (cartas FUT)
│   ├── js/                       # app.js, store.js, audio.js, auth.js, firebase-config.js
│   ├── ReferenciasFifa/          # Capturas de referencia de interfaz FIFA de consola
│   └── README.md                 # Documentación técnica de la plataforma
│
└── marketing/                    # CAMPAÑAS DE CAPTACIÓN POR WHATSAPP (PLAZO: 72H)
    ├── campañas/                 # Los 5 copys definitivos optimizados tras 10 iteraciones
    │   ├── 01_DRAFT_CALLOUT_PERSONAL.md
    │   ├── 02_GUERRA_FACULTADES.md
    │   ├── 03_CARTA_FUT_GAMIFICACION.md
    │   ├── 04_ULTIMATUM_72H_CAPITANES.md
    │   └── 05_AUDIO_GUERRILLA_MEME.md
    ├── scripts/                  # evaluador_campanas.py (Motor de simulación multi-agente)
    ├── simulaciones/             # metricas_evolucion.md y resultados_optimizacion_10_iteraciones.json
    └── informes/                 # INFORME_ESTRATEGIA_WHATSAPP_72H.md (Manual operativo)
```

---

## 🚀 CÓMO EJECUTAR LA APLICACIÓN

1. Iniciar un servidor HTTP local en el puerto deseado:
   ```bash
   npx http-server -p 8085 -c-1
   ```
2. Abrir en el navegador:
   `http://127.0.0.1:8085/repo/index.html` (o `http://127.0.0.1:8085/` para redirección automática).

---

## 📢 CAMPAÑAS DE MARKETING WHATSAPP (72 HORAS PARA CIERRE)
Las 5 campañas de marketing disruptivo han sido evaluadas por un panel de 5 agentes simulados a lo largo de 10 rondas de optimización, logrando un score promedio de **98.3 / 100**.
Consulta las campañas listas para enviar en [marketing/campañas](file:///C:/Users/josef/Desktop/futInfo/marketing/campa%C3%B1as/) y el calendario de difusión en [marketing/informes/INFORME_ESTRATEGIA_WHATSAPP_72H.md](file:///C:/Users/josef/Desktop/futInfo/marketing/informes/INFORME_ESTRATEGIA_WHATSAPP_72H.md).
