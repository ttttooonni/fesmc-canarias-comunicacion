# Comunicación digital UGT FeSMC Canarias

Redacción del equipo, en el teléfono. No hay servidor ni base de datos: las fichas viven en el dispositivo y el circuito se mueve por WhatsApp. La guía y el checklist siguen disponibles sin cobertura.

## Publicar en GitHub Pages

El repositorio debe llamarse `fesmc-canarias-comunicacion`. El flujo de `.github/workflows/pages.yml` publica la rama `main`.

1. Sube esta rama a `main` del repositorio.
2. En GitHub: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. El flujo ejecuta `npm run build` con `NEXT_PUBLIC_BASE_PATH=/fesmc-canarias-comunicacion` y publica la carpeta `out`.
4. La dirección queda en `https://<usuario>.github.io/fesmc-canarias-comunicacion/`.

## Publicar en Vercel, solo archivos estáticos

1. Importa el repositorio. El marco es Next.js.
2. No hace falta ninguna variable de entorno. Si la dejas vacía, la aplicación se sirve en la raíz del dominio.
3. El comando de build es `npm run build`. Vercel publica el resultado estático. No hay funciones de servidor.

## Probarla en local

```bash
npm install
npm run build
npx serve out -l 4179
```

También vale `npm run dev` en [http://127.0.0.1:4179](http://127.0.0.1:4179).

## Instalarla en el móvil

Ábrela por HTTPS (o en localhost). En la portada está **Instalar / Descargar app**.

- Android y Chrome: un toque en «Instalar ahora» cuando el navegador lo permite.
- iPhone: Compartir, «Añadir a pantalla de inicio», Añadir.

Cuando ya está instalada, ese bloque desaparece.

## Cómo circula una ficha

1. Quien la vive escribe la ficha breve y pulsa **Enviar propuesta**. Se abre WhatsApp con el resumen, el estado y un enlace.
2. Quien recibe abre el enlace en el mismo móvil. La ficha entra en su aplicación.
3. Siguen igual: pedir revisión, revisión legal, aprobar o devolver con cambios, y marcar publicada. Cada paso vuelve a abrir WhatsApp.

El enlace tiene esta forma: `#/importar?d=...`. Los datos van en el fragmento del mensaje. No hay un servidor que los reciba.

El tutorial de la primera apertura, y Más → Cómo funciona, lo cuenta con calma. También está en `TUTORIAL.md`.

## Copias y ejemplo

En Inicio: **Cargar ejemplo** mete fichas, el calendario de diciembre de 2026 y un episodio de ejemplo de Sindi y Cato, marcados como ejemplo. **Descargar copia** e **Importar copia** mueven un JSON entre teléfonos, incluida el área de la serie.

## Sindi y Cato

La sección `/sindi-cato/` es el área de creación y administración de la serie. El panel (personajes, episodios, producción, documentación, revisión y publicaciones) se guarda en el mismo dispositivo. Desde Revisión, **Compartir por WhatsApp** envía un enlace `#/importar-sindi?d=...` que importa el episodio.

No hay contraseñas.

## Comprobaciones

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```
