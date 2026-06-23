# Guía de despliegue — Vercel + Render

> Esta guía te lleva paso a paso desde el código local hasta tener la aplicación corriendo en internet con dominios públicos, **gratis**.

## Arquitectura del despliegue

```
                ┌─────────────────────────┐
                │   Usuario (navegador)   │
                └────────────┬────────────┘
                             │
              HTTPS          │           HTTPS
                             ▼
              ┌──────────────────────────┐
              │   Vercel (Frontend)      │
              │   pensum-tracker.vercel  │
              │   .app                   │
              │                          │
              │   React SPA estática     │
              └────────────┬─────────────┘
                           │
                           │  fetch POST /api/analyze
                           ▼
              ┌──────────────────────────┐
              │   Render (Backend)       │
              │   pensum-tracker-api     │
              │   .onrender.com          │
              │                          │
              │   FastAPI + pdfplumber   │
              └──────────────────────────┘
```

## ¿Por qué esta combinación?

| Plataforma | Por qué |
|------------|---------|
| **Vercel** (frontend) | El mejor host para React/Vite. Build automático, CDN global, HTTPS gratis. |
| **Render** (backend) | Soporta Python sin límite de bundle (Vercel Functions tiene 50 MB). Free tier suficiente para empezar. |

> **Único trade-off**: el plan free de Render **duerme tras 15 min de inactividad**. El primer request después de dormir tarda ~30 segundos (cold start), luego responde rápido. Para evitarlo, $7/mes pasa al plan starter.

---

## Prerrequisitos

Antes de empezar, necesitas:

- Cuenta de **GitHub** (gratis): https://github.com/signup
- Cuenta de **Vercel** (gratis): https://vercel.com/signup
- Cuenta de **Render** (gratis): https://render.com/register

> Tip: registra Vercel y Render usando "Continue with GitHub" para no manejar contraseñas adicionales.

---

## Paso 1 — Preparar el repositorio en GitHub

### 1.1 Crear repositorio nuevo

1. Ve a https://github.com/new
2. Nombre: `pensum-tracker` (o el que prefieras)
3. Visibilidad: **Public** (necesario para los free tiers) o Private
4. **NO** marques "Add a README" (ya existe)
5. Clic en "Create repository"

### 1.2 Conectar y subir el código

GitHub te mostrará comandos. Desde la carpeta `pensum-tracker/` ejecuta:

```bash
# Cambia el remote actual al nuevo repo
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/pensum-tracker.git

# Confirma todos los cambios pendientes
git add .
git commit -m "Production-ready setup for Vercel + Render"

# Sube a main
git branch -M main
git push -u origin main
```

> Si pide credenciales, usa un **Personal Access Token** de GitHub (no tu contraseña). Lo generas en https://github.com/settings/tokens

---

## Paso 2 — Desplegar el backend en Render

### 2.1 Crear el Web Service

1. Entra a https://dashboard.render.com
2. Clic en **"New +"** → **"Blueprint"** (esto detecta el `render.yaml` automáticamente)
3. Conecta tu cuenta de GitHub (si es la primera vez)
4. Selecciona el repo `pensum-tracker`
5. Render mostrará el servicio detectado del `render.yaml`. Confirma con **"Apply"**

> Si prefieres no usar Blueprint, alternativa manual:
>
> - **"New +"** → **"Web Service"** → conecta el repo
> - **Root Directory**: `backend`
> - **Runtime**: Python
> - **Build Command**: `pip install -r requirements.txt`
> - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
> - **Plan**: Free
> - Crear

### 2.2 Esperar el primer build

Toma **5-10 minutos**. Verás los logs en tiempo real. Cuando termine:

- Status: **Live** (verde)
- URL: algo como `https://pensum-tracker-api.onrender.com`

### 2.3 Verificar que funciona

Abre en el navegador:

```
https://pensum-tracker-api.onrender.com/api/health
```

Debes ver: `{"status":"ok"}`

> **Anota esta URL**, la necesitarás en el siguiente paso.

---

## Paso 3 — Desplegar el frontend en Vercel

### 3.1 Importar el proyecto

1. Entra a https://vercel.com/new
2. Clic en **"Import"** junto a tu repo `pensum-tracker`
3. En **"Configure Project"**:
   - **Framework Preset**: Vite (debería auto-detectarlo)
   - **Root Directory**: clic en "Edit" → selecciona `frontend`
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `dist` (auto)

### 3.2 Configurar variable de entorno

En la misma pantalla, expande **"Environment Variables"** y agrega:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://pensum-tracker-api.onrender.com` *(la URL del paso 2.2, sin barra al final)* |

### 3.3 Deploy

Clic en **"Deploy"**. Toma 1-2 minutos. Cuando termine:

- URL: algo como `https://pensum-tracker-xxxx.vercel.app`

---

## Paso 4 — Configurar CORS en el backend

Tu backend de Render todavía no acepta requests del dominio de Vercel. Hay que decirle.

### 4.1 Agregar la variable de entorno en Render

1. Ve a https://dashboard.render.com
2. Selecciona tu servicio `pensum-tracker-api`
3. En el menú izquierdo: **"Environment"**
4. Clic en **"Add Environment Variable"**
5. Agrega:

| Key | Value |
|-----|-------|
| `CORS_ORIGINS` | `https://pensum-tracker-xxxx.vercel.app` *(la URL exacta de Vercel del paso 3.3)* |

> Si vas a tener un dominio custom además, sepáralos por coma:
> `https://pensum-tracker.com,https://pensum-tracker-xxxx.vercel.app`

6. Clic en **"Save Changes"** → Render reiniciará el servicio (~30 segundos)

---

## Paso 5 — Verificación end-to-end

1. Abre tu URL de Vercel: `https://pensum-tracker-xxxx.vercel.app`
2. Sube los dos PDFs reales
3. Clic en **"Analizar mi pénsum"**
4. Debe procesar correctamente y mostrar el dashboard

> **Si el primer request tarda ~30 segundos**, es normal: Render despertó del sleep.

---

## Solución de problemas

### El frontend muestra "Sin conexión con el servidor"

**Causa probable**: la variable `VITE_API_URL` en Vercel está mal o falta.

**Solución**:
1. Vercel → tu proyecto → **Settings** → **Environment Variables**
2. Verifica que `VITE_API_URL` apunte exactamente a tu URL de Render (sin barra final)
3. Vercel → **Deployments** → menú "..." del último deploy → **"Redeploy"**

### El frontend muestra "CORS policy: No 'Access-Control-Allow-Origin'"

**Causa**: el backend no tiene listado el dominio de Vercel en CORS.

**Solución**: revisa el paso 4.1. La URL en `CORS_ORIGINS` debe ser **exactamente** la que aparece en tu app de Vercel (incluyendo `https://`, sin barra final).

### El primer request tarda ~30 segundos

**Causa**: cold start de Render (plan free duerme tras 15 min inactivo).

**Solución**:
- Aceptarlo (es lo esperado del free tier)
- O actualizar a Render Starter ($7/mes, siempre activo)
- O usar un servicio de "ping" externo cada 10 min (ej. cron-job.org)

### El build de Render falla por dependencias

**Causa**: a veces `cryptography` falla en builds nuevos.

**Solución**: en Render, **Settings** → fija `PYTHON_VERSION=3.11.4` en Environment Variables (ya viene en `render.yaml`).

### El build de Vercel falla con "Module not found"

**Causa**: el cache de npm está corrupto.

**Solución**: Vercel → tu proyecto → **Settings** → **General** → scroll hasta **"Build & Development Settings"** → desmarca "Use Build Cache" temporalmente → redeploy.

---

## Después del deploy

### Deploys automáticos

Cada `git push` a `main` reconstruye y despliega ambos servicios automáticamente. Para probar:

```bash
echo "<!-- deploy test -->" >> README.md
git add README.md
git commit -m "Test auto-deploy"
git push
```

En 2-5 minutos los cambios estarán live.

### Branches y previews

Vercel crea **preview deploys** para cada PR/branch automáticamente. Útiles para revisar cambios antes de mergear a main.

### Dominio custom (opcional)

Si compraste un dominio (Namecheap, Cloudflare, etc.):

**En Vercel**:
1. Settings → Domains → Add Domain
2. Sigue las instrucciones DNS (apuntar CNAME a `cname.vercel-dns.com`)

**En el backend (Render + CORS)**:
- Actualiza `CORS_ORIGINS` para incluir el nuevo dominio

### Métricas y logs

- **Vercel**: Analytics gratis en el dashboard (Real Experience Score, Web Vitals)
- **Render**: Logs en tiempo real en el dashboard del servicio

---

## Checklist final

- [ ] Repo en GitHub creado y código pusheado
- [ ] Render Web Service corriendo (`/api/health` responde OK)
- [ ] Vercel project corriendo (frontend carga)
- [ ] `VITE_API_URL` configurada en Vercel
- [ ] `CORS_ORIGINS` configurada en Render
- [ ] Flujo completo end-to-end: subes PDFs → ves dashboard
- [ ] (Opcional) Dominio custom configurado

---

## Costos

Ambos servicios son **$0/mes** en free tier. Si crece la audiencia:

| Plataforma | Free tier | Siguiente plan |
|------------|-----------|----------------|
| Vercel | 100 GB bandwidth/mes, builds ilimitados | $20/mes (Pro) |
| Render | 750 horas-instancia/mes, duerme tras 15 min | $7/mes (Starter, sin sleep) |

Para uso personal o universidad pequeña (<1000 usuarios/mes), el free tier es más que suficiente.
