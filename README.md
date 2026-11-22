# Comunicación digital UGT FeSMC Canarias

Herramienta de trabajo del equipo de comunicación digital de la federación. Sirve para ejecutar el ritmo del plan: la ficha breve que envían islas y sectores, el circuito de publicación, el calendario editorial y el panel mensual de métricas.

La interfaz está en español de España. Los nombres, hechos y cifras que trae de serie son de demostración: no hay datos personales reales ni estadísticas de las cuentas oficiales.

## Qué se puede hacer

- Enviar la ficha breve: qué ocurrió, isla, cuándo, sector, fuentes, material autorizado, contacto del equipo y marca de contenido sensible.
- Mover cada pieza por el circuito: recibido, comprobado, redacción, revisión jurídica e imagen, autorización de supervisión si es sensible, programado, publicado y difundido a las cuentas insulares.
- Entrar con el rol que toca: coordinación y supervisión, compañero gestor, responsable insular, responsable sectorial o referente jurídico.
- Ver el calendario. Diciembre de 2026 llega precargado como ejemplo del primer mes, con el ritmo del plan: lunes de derechos, miércoles de actividad, viernes de actualidad y participación. Incluye la sección «Sindi y Cato te lo cuentan».
- Consultar el registro de lo recibido, publicado y compartido, por isla y por sector, sin rankings.
- Volcar a mano las métricas mensuales de Instagram, Facebook y TikTok, y ver el aviso de islas o sectores sin presencia.
- Leer sin conexión la guía de tono y el checklist de seguridad y datos.
- Copiar o compartir el texto sugerido para las cuentas insulares.

## Requisitos

- Node.js 22 o superior
- npm

## Ejecutar en local

```bash
npm install
npm run dev
```

Abre [http://127.0.0.1:4179](http://127.0.0.1:4179).

Para la versión que se puede instalar y funciona offline, usa la compilación de producción:

```bash
npm run build
npm start
```

La misma dirección sirve la aplicación. En el móvil o en el escritorio, el navegador ofrecerá instalarla (Chrome, Edge o Safari: Compartir y «Añadir a pantalla de inicio»). Fuera de localhost hace falta HTTPS.

## Cuentas de demostración

La clave de todas es `canarias-demo`.

| Correo | Rol |
| --- | --- |
| coordinacion@demo.ugt-fesmc.local | Coordinación y supervisión |
| gestion@demo.ugt-fesmc.local | Compañero gestor |
| lanzarote@demo.ugt-fesmc.local | Responsable insular de Lanzarote |
| tenerife@demo.ugt-fesmc.local | Responsable insular de Tenerife |
| grancanaria@demo.ugt-fesmc.local | Responsable insular de Gran Canaria |
| hosteleria@demo.ugt-fesmc.local | Responsable sectorial de hostelería y turismo |
| juridico@demo.ugt-fesmc.local | Referente jurídico |

En la pantalla de entrada se pueden rellenar con un toque. No uses estas cuentas para información real.

## Datos y offline

El servidor guarda el trabajo del equipo en `data/store.json`. Ese archivo se crea al arrancar, no se versiona y se puede borrar para volver a la semilla de ejemplo.

El navegador guarda una copia en IndexedDB. Si se corta la red:

- la guía y el checklist siguen disponibles;
- se puede seguir consultando la última copia de fichas, calendario y métricas;
- los cambios se encolan en el dispositivo y se envían al recuperar la conexión.

La primera entrada en un dispositivo nuevo necesita red, porque la sesión vive en una cookie.

## Cómo conectar otro backend

La lógica de negocio no depende del archivo JSON. Está en `src/lib` (`fichas.ts`, `circuito.ts`, `calendario-logica.ts`, `metricas-logica.ts`) y la usan tanto el cliente como las rutas.

Hoy las rutas de `src/app/api` leen y escriben con `src/server/store.ts`. Para compartir los datos en un servidor de verdad:

1. Sustituye `leer` y `guardar` por Postgres, SQLite u otro almacén.
2. Mantén las mismas respuestas JSON: `usuario`, `fichas`, `calendario`, `metricas`, y los objetos `ficha`, `hueco` y `metrica`.
3. Conserva la cookie `ugt_com_sesion` o cambia `src/server/sesion.ts` y el cliente en `src/components/proveedor.tsx`, que es la única capa que llama a `/api`.
4. No guardes datos personales reales en la semilla. Las cuentas de ejemplo tienen que desaparecer antes de un uso interno de verdad, y las contraseñas tienen que salir de un gestor, no del código.

Variable opcional: `DATA_FILE` apunta a otra ruta del JSON mientras sigas con el almacén de archivo.

## Desplegar

Hace falta un proceso Node persistente y un volumen para `data/store.json`. Un ejemplo:

```bash
npm ci
npm run build
npm start
```

Pon la aplicación detrás de HTTPS (Caddy, nginx o el proxy de la plataforma). Sin HTTPS el navegador no la instala, salvo en localhost.

La cookie de sesión se marca `Secure` solo si la petición llega como HTTPS o con `X-Forwarded-Proto: https`.

No está pensada para un entorno serverless en el que el disco se borra en cada invocación. Si el destino es de ese tipo, cambia el almacén antes de desplegar.

## Comprobaciones

```bash
npm test
npm run lint
npm run build
```

## Identidad

Rojo `#E30613`, blanco y gris oscuro `#1C1C1C`. La marca de la aplicación es una pieza tipográfica propia para esta herramienta, no el logotipo oficial.
