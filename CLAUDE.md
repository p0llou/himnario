# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estilo de comunicación
- Responder siempre en español
- Frases de 3 a 6 palabras
- Cero relleno, preámbulos o saludos
- Correr herramienta primero, mostrar resultado, parar
- No narrar acciones
- Omitir artículos: "arreglo código" no "voy a arreglar el código"

## Estilo de código
- Mantener estilo estético del proyecto (nombres, formato, convenciones)
- Tocar solo lo pedido, nada más
- Preguntar antes de refactorizar
- Nunca eliminar código sin confirmar primero

## Comunicación en herramientas
- No narrar pasos ("voy a crear", "ahora tengo", "tengo todo")
- Solo mostrar resultado final

## Proyecto
PWA de himnario con acordes y transposición (iglesia IEAP). Sin build, sin dependencias, sin tests.
- Deploy: GitHub Pages desde `main` raíz → https://p0llou.github.io/himnario/
- Probar local: servir carpeta por HTTP (`python3 -m http.server`); service worker no funciona con `file://`

## Arquitectura
Toda la app vive en `index.html`: CSS en `<style>`, JS vanilla en `<script>`, dividido en secciones `§ N`.
- **§1 Acordes**: `NOTE_ST` mapea notas latinas y americanas a semitono. Contenido se guarda normalizado en notación americana (`normalizeContent`); se convierte al mostrar (`convertContent` / `chordStr`) según `S.sys` y offset de transposición.
- **§2 Render**: formato ChordPro simple, `[Acorde]sílaba`. Cada línea con acordes → bloques `.cblock` (acorde `.cn` sobre letra `.cl`).
- **§3 Firestore** (SDK compat por CDN, proyecto `himnario-ieap`): colección `hymns`. `onSnapshot` alimenta `hymnCache`; `db` es wrapper sobre ese caché. Persistencia offline activada.
- **§4 Estado**: objeto global `S`. Preferencias (notación, letra, velocidad scroll, acento) en `localStorage` clave `himnario_prefs`. Temas de color en `ACCENTS` (variante light/dark), aplicados vía variables CSS en `:root`.
- **§5 Admin**: PIN validado contra lista `ADMIN_HASHES` (SHA-256 fijos en código). Sesión en `sessionStorage`. Clase `body.is-admin` muestra elementos `.admin-only`. Protección solo de UI; seguridad real depende de reglas Firestore.
- **§6 Vistas**: SPA con `<div class="view" id="view-X">`, cambio vía `showView(name)`. Handlers inline `onclick` en HTML.
- **§8 Colas**: colección `colas` (`{id, fecha, titulo, himnos:[ids]}`), listas ordenadas de himnos por servicio; navegación prev/next dentro de cola.

Modelo himno: `{id, tipo ('himno'|'alabanza'; ausente = himno), especial, numero, titulo, tonalidad (semitono|null), tSuffix, bpm (número|null), tiempos (tiempos por línea|null), contenido}`. Himnos `especial` no tienen número y van al final ordenados por título. Alabanzas se guardan con `especial:true` y sin número; pestañas de lista filtran por `tipo`.

## Service worker
`sw.js` usa cache-first con actualización en segundo plano. Al cambiar archivos cacheados, subir versión `CACHE` (`himnario-vN`) para forzar refresco en clientes.
