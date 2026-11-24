# Comunicación digital UGT FeSMC Canarias

Herramienta de trabajo del equipo de comunicación digital de la federación. La interfaz está en español de España. En el navegador sigue funcionando sin red: la guía, el checklist y la última copia de la mesa viven en el dispositivo (IndexedDB y service worker). Los datos compartidos del equipo están en Postgres.

No hay contraseñas ni secretos en el repositorio. Los nombres de la semilla son ficticios.

## Qué se puede hacer

- Enviar la ficha breve y moverla por el circuito, según el rol.
- Calendario editorial. Diciembre de 2026 llega solo si se carga la semilla de demostración.
- Registro por isla y sector, sin rankings, y métricas mensuales volcadas a mano.
- Guía de tono y checklist de seguridad, también sin conexión.
- Copiar o compartir el texto para las cuentas insulares.

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena los valores. `.env.local` no se sube.

| Variable | Obligatoria | Para qué |
| --- | --- | --- |
| `DATABASE_URL` | Sí, en la app | Postgres. En Neon o Supabase, la URL del pooler. |
| `DATABASE_URL_UNPOOLED` | Recomendada | Conexión directa para las migraciones. Si falta, se usa `DATABASE_URL`. |
| `SESSION_SECRET` | Sí, en la app | Firma la cookie de sesión. Mínimo 16 caracteres. |
| `DEMO_PASSWORD` | Solo la semilla | Clave de las cuentas de demostración. |
| `ALLOW_DEMO_SEED` | No | En producción la semilla se niega salvo que valga `1`. |
| `USUARIO_NOMBRE`, `USUARIO_EMAIL`, `USUARIO_CLAVE`, `USUARIO_ROL` | Solo al crear una cuenta | `npm run db:usuario`. |
| `USUARIO_ISLA`, `USUARIO_SECTOR` | Según el rol | Isla si el rol es `insular`. Sector si es `sectorial`. |

Roles válidos: `coordinacion`, `gestor`, `insular`, `sectorial`, `juridico`.

La cookie de sesión es `HttpOnly` y `SameSite=Lax`. En producción, o si la petición llega por HTTPS, también es `Secure`.

## Base de datos en Neon, desde Vercel

1. Entra en el proyecto de Vercel, pestaña **Storage** (o **Integrations**).
2. Abre **Marketplace** y elige **Neon**.
3. Crea una base y conéctala al proyecto. Vercel rellena `DATABASE_URL` (pooler) y `DATABASE_URL_UNPOOLED` (directa).
4. En **Settings → Environment Variables** añade `SESSION_SECRET`. Genera una cadena larga, por ejemplo con `openssl rand -base64 32`. Márcala para Production, Preview y Development si vas a usar los tres.
5. No pongas `DEMO_PASSWORD` en Vercel salvo que vayas a cargar la demostración a propósito.

Supabase sirve igual: en **Project Settings → Database** copia la URI del pooler (puerto 6543, modo transaction) en `DATABASE_URL` y la URI directa (puerto 5432) en `DATABASE_URL_UNPOOLED`. Añade `?sslmode=require` si no viene. El resto de los pasos es el mismo.

## Migraciones

Desde tu máquina, con el código y las variables apuntando a esa base:

```bash
npm install
npm run db:migrate
```

El script lee `.env.local` si existe y no pisa variables que ya estén en el entorno. Aplica los SQL de `migrations/` en orden y anota los que ya pasó en `schema_migrations`. Se puede lanzar otra vez: no repite lo aplicado.

No está enganchado al build. Vercel no la ejecuta solo.

## Semilla de demostración, opcional

No se ejecuta al arrancar ni al desplegar. Carga cuentas, fichas, el calendario de diciembre de 2026 y unas cifras inventadas. Todas las filas quedan marcadas como ejemplo.

```bash
DEMO_PASSWORD='una-clave-solo-para-la-demo' npm run db:seed
```

Si `NODE_ENV=production`, se niega. Para forzarla en una base de producción:

```bash
NODE_ENV=production ALLOW_DEMO_SEED=1 DEMO_PASSWORD='una-clave-solo-para-la-demo' npm run db:seed
```

No lo hagas si ya hay cuentas reales: el script se detiene. Si la demostración ya estaba cargada, no duplica nada. La clave no se imprime ni se guarda en el repositorio. En la pantalla de entrada solo aparecen los correos, para rellenar el campo; la clave hay que escribirla.

Correos de esa semilla, todos con la misma `DEMO_PASSWORD`:

- coordinacion@demo.ugt-fesmc.local
- gestion@demo.ugt-fesmc.local
- lanzarote@demo.ugt-fesmc.local
- tenerife@demo.ugt-fesmc.local
- grancanaria@demo.ugt-fesmc.local
- hosteleria@demo.ugt-fesmc.local
- juridico@demo.ugt-fesmc.local

## Cuentas reales

Con la base ya migrada:

```bash
USUARIO_NOMBRE="Nombre Apellido" \
USUARIO_EMAIL="persona@ugt.ejemplo" \
USUARIO_CLAVE="una-clave-larga" \
USUARIO_ROL="gestor" \
npm run db:usuario
```

`USUARIO_CLAVE` tiene que tener al menos 8 caracteres. Para una isla: `USUARIO_ROL=insular` y `USUARIO_ISLA=tenerife` (u otra del plan: lanzarote, fuerteventura, gran_canaria, la_gomera, la_palma, el_hierro). Para un sector: `USUARIO_ROL=sectorial` y `USUARIO_SECTOR=hosteleria` (u otro de la lista del código, en `src/lib/dominio.ts`). La cuenta se guarda con `ejemplo=false`.

## Desplegar en Vercel

1. Importa el repositorio. El marco es Next.js; el comando de build es `npm run build`. No añadas la semilla ni las migraciones al build.
2. Confirma que `DATABASE_URL` y `SESSION_SECRET` están en el entorno de Production.
3. Lanza las migraciones desde tu máquina, con esas mismas URLs, antes de dar la aplicación por buena.
4. Crea las cuentas reales con `npm run db:usuario`. La semilla, solo si quieres el calendario y las fichas de ejemplo.
5. Abre el despliegue por HTTPS. La cookie saldrá `Secure`. En el móvil, el navegador puede instalar la aplicación; la guía sigue disponible sin red después de abrirla una vez.

Para probar en local hace falta la misma pareja de variables (puede ser la base de Neon o un Postgres en tu máquina; en localhost no se fuerza SSL):

```bash
npm install
npm run db:migrate
npm run dev
```

La aplicación escucha en [http://127.0.0.1:4179](http://127.0.0.1:4179). `npm run build` y `npm start` sirven la versión que se instala.

## Comprobaciones

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Sin conexión

El service worker y la copia en IndexedDB no dependen de la base. Hace falta haber entrado una vez con red. Los cambios hechos sin red se encolan y se envían cuando vuelve.
