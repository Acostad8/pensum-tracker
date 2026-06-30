# Pensum Tracker — UFPSO

> Sistema web que permite a los estudiantes de la **Universidad Francisco de Paula Santander Ocaña** visualizar su avance académico de forma gráfica e interactiva, calcular cuántos semestres les faltan para graduarse, simular escenarios futuros y recibir recomendaciones inteligentes del próximo semestre, **a partir de los PDFs oficiales del portal SIA**.

---

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Backend](#5-backend)
6. [Frontend](#6-frontend)
7. [Flujo de datos completo](#7-flujo-de-datos-completo)
8. [Funcionalidades implementadas](#8-funcionalidades-implementadas)
9. [Algoritmos clave](#9-algoritmos-clave)
10. [Instalación y ejecución](#10-instalación-y-ejecución)
11. [Privacidad y seguridad](#11-privacidad-y-seguridad)
12. [Limitaciones conocidas](#12-limitaciones-conocidas)
13. [Roadmap futuro](#13-roadmap-futuro)

---

## 1. Visión general

### El problema

El portal académico **SIA** de la UFPSO permite a los estudiantes descargar dos documentos en PDF:

- El **pénsum** completo de su carrera (10 semestres, materias obligatorias y electivas, prerrequisitos).
- El **reporte de notas acumuladas** (materias cursadas, créditos aprobados, promedio).

Sin embargo, no existe ninguna herramienta que cruce ambos documentos automáticamente para mostrar al estudiante:

- Qué materias puede cursar ahora mismo (prerrequisitos satisfechos).
- Cuántos créditos le faltan para graduarse.
- Una estimación de semestres restantes a su ritmo actual.
- Qué materias se desbloquean si aprueba ciertas pendientes (simulación).
- Una sugerencia ponderada del próximo semestre óptimo.
- Qué promedio necesita mantener para alcanzar una meta de PAPA.

### La solución

Una aplicación web que **procesa los dos PDFs en memoria** (sin almacenar nada en servidor), cruza la información y entrega un dashboard completo con visualización tipo grid y tipo grafo de dependencias, además de herramientas de planificación académica.

---

## 2. Arquitectura del sistema

El sistema está diseñado siguiendo una **arquitectura cliente-servidor desacoplada** con clara separación de responsabilidades.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                     │
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐    │
│   │              Frontend SPA (React + Vite)              │    │
│   │                                                       │    │
│   │   ┌──────────┐    ┌──────────┐    ┌──────────────┐   │    │
│   │   │   Home   │    │Dashboard │    │ Componentes  │   │    │
│   │   │ (upload) │    │ (vista)  │    │ reutilizables│   │    │
│   │   └──────────┘    └──────────┘    └──────────────┘   │    │
│   │                                                       │    │
│   │   ┌──────────────────┐  ┌──────────────────────────┐  │    │
│   │   │ Services (API,   │  │ Hooks (usePersistent     │  │    │
│   │   │ cache, theme,    │  │ State) + State local     │  │    │
│   │   │ simulation,      │  │ (useState/useMemo)       │  │    │
│   │   │ recommender)     │  │                          │  │    │
│   │   └──────────────────┘  └──────────────────────────┘  │    │
│   └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
                                      │ HTTP (FormData con PDFs)
                                      │ JSON response
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CAPA DE APLICACIÓN                        │
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐    │
│   │              Backend REST (FastAPI + Python)          │    │
│   │                                                       │    │
│   │   ┌──────────┐    ┌──────────┐    ┌──────────────┐   │    │
│   │   │ Routers  │ →  │ Services │ →  │   Models     │   │    │
│   │   │ (HTTP)   │    │ (lógica) │    │ (Pydantic)   │   │    │
│   │   └──────────┘    └──────────┘    └──────────────┘   │    │
│   │                        │                              │    │
│   │                        ▼                              │    │
│   │              ┌────────────────────┐                   │    │
│   │              │      Parsers       │                   │    │
│   │              │ (pdfplumber + regex│                   │    │
│   │              │  + filtro fuentes) │                   │    │
│   │              └────────────────────┘                   │    │
│   └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Principios arquitectónicos aplicados

| Principio | Cómo se aplica |
|-----------|---------------|
| **Separation of Concerns** | Backend: parsers ↔ servicios ↔ routers. Frontend: páginas ↔ componentes ↔ servicios ↔ hooks. |
| **Stateless backend** | El servidor no guarda nada entre requests. Cada `POST /api/analyze` es independiente. |
| **Single Source of Truth** | Los modelos Pydantic son la única definición del shape de los datos en el backend. El frontend confía en el contrato JSON. |
| **Composición sobre herencia** | Componentes React pequeños que se componen (`SubjectCard` dentro de `PensumGrid` dentro de `Dashboard`). |
| **Privacy by design** | Procesamiento en memoria, sin BD, sin tracking. Solo localStorage del lado del cliente. |
| **Progressive enhancement** | Funciona sin JavaScript (servidor) y degrada bien en móvil (vista accordion). |

---

## 3. Stack tecnológico

### Backend

| Categoría | Tecnología | Versión | Propósito |
|-----------|-----------|---------|-----------|
| Lenguaje | Python | 3.11 | Runtime con buen ecosistema de procesamiento de PDFs |
| Framework | FastAPI | 0.115.0 | API REST moderna, async, con docs automáticos |
| Servidor ASGI | Uvicorn | 0.32.0 | Servidor HTTP de alto rendimiento |
| Parsing de PDF | pdfplumber | 0.11.4 | Extracción de tablas y texto con coordenadas |
| Validación | Pydantic | 2.9.2 | Modelos tipados con validación automática |
| Upload multipart | python-multipart | 0.0.12 | Manejo de `multipart/form-data` |

### Frontend

| Categoría | Tecnología | Versión | Propósito |
|-----------|-----------|---------|-----------|
| Framework UI | React | 18.x | Biblioteca declarativa de componentes |
| Bundler | Vite | 8.x | Build tool ultra rápido con HMR |
| Estilos | TailwindCSS | 3.x | Utility-first CSS con dark mode `class` |
| Drag & Drop | react-dropzone | última | Zonas de subida de archivos |
| Grafo interactivo | React Flow | última | Visualización del grafo de prerrequisitos |
| Exportar imagen | html-to-image | última | Captura DOM → PNG |
| Exportar PDF | jsPDF | última | Generación de documentos PDF |

### Convenciones de código

- **Backend**: Type hints en todas las funciones, modelos Pydantic para validar entrada/salida, docstrings en español.
- **Frontend**: Componentes funcionales con hooks, sin TypeScript (decisión consciente para velocidad de iteración del MVP), nombres en español de dominio (`materia`, `pensum`, `papa`).
- **Naming**: Backend en español de dominio (`analizar`, `pensum`, `materias`), código de infra en inglés (`router`, `parser`, `cache`).

---

## 4. Estructura del proyecto

```
pensum-tracker/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                       # Entry point FastAPI, CORS, mounting de routers
│   │   │
│   │   ├── models/
│   │   │   └── schemas.py                # 9 modelos Pydantic (Materia, Pensum, etc.)
│   │   │
│   │   ├── parsers/
│   │   │   ├── pensum_parser.py          # Extrae 10 semestres del PDF de pénsum
│   │   │   └── historial_parser.py       # Extrae notas/créditos del reporte SIA
│   │   │
│   │   ├── services/
│   │   │   ├── calculator.py             # Cruce pensum × historial → análisis
│   │   │   └── pdf_detector.py           # Detecta tipo de PDF (pensum o historial)
│   │   │
│   │   └── routers/
│   │       └── upload.py                 # POST /api/analyze, GET /api/health
│   │
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── main.jsx                      # React root, monta <App />
    │   ├── App.jsx                       # Estado global: theme, analysis, cache
    │   ├── index.css                     # Tailwind + transiciones globales
    │   │
    │   ├── pages/
    │   │   ├── Home.jsx                  # Upload de los 2 PDFs
    │   │   └── Dashboard.jsx             # Vista completa del avance
    │   │
    │   ├── components/
    │   │   ├── FileDropzone.jsx          # Drag & drop con react-dropzone
    │   │   ├── StatsCards.jsx            # 4 tarjetas de métricas principales
    │   │   ├── ProgressBar.jsx           # Barra de progreso de créditos
    │   │   ├── PensumGrid.jsx            # Grid 10 columnas + accordion móvil
    │   │   ├── SubjectCard.jsx           # Card individual de materia
    │   │   ├── PrerequisitesGraph.jsx    # Grafo interactivo con React Flow
    │   │   ├── GpaCalculator.jsx         # Calculadora de PAPA objetivo
    │   │   ├── Recommender.jsx           # Sugerencia del próximo semestre
    │   │   ├── SimulationBanner.jsx      # Banner del modo simulación
    │   │   ├── FiltersBar.jsx            # Chips de filtro + búsqueda
    │   │   ├── ViewSwitcher.jsx          # Toggle Grid ↔ Grafo
    │   │   ├── ExportMenu.jsx            # Menú de exportar PNG/PDF
    │   │   ├── ThemeToggle.jsx           # Toggle modo claro/oscuro
    │   │   ├── HelpHint.jsx              # Tooltip accesible (?)
    │   │   ├── WelcomeNotice.jsx         # Onboarding para nuevos
    │   │   ├── MobileGraphNotice.jsx     # Aviso móvil del grafo
    │   │   ├── ErrorBanner.jsx           # Banner de error amigable
    │   │   └── DashboardSkeleton.jsx     # Loading state animado
    │   │
    │   ├── hooks/
    │   │   └── usePersistentState.js     # useState ↔ localStorage
    │   │
    │   └── services/
    │       ├── api.js                    # Cliente HTTP para /api/analyze
    │       ├── cache.js                  # Persistencia versionada del análisis
    │       ├── theme.js                  # Dark mode + preferencia del SO
    │       ├── simulation.js             # Recálculo de stats con simuladas
    │       ├── recommender.js            # Algoritmo greedy de recomendación
    │       ├── errorMessages.js          # Mapeo errores backend → amigables
    │       └── exporter.js               # Captura DOM → PNG/PDF
    │
    ├── tailwind.config.js                # Paleta UFPSO (rojo) + dark mode
    ├── postcss.config.js
    ├── vite.config.js
    ├── index.html
    └── package.json
```

---

## 5. Backend

### 5.1 Modelos de datos (Pydantic)

Toda la información que viaja por el sistema está tipada con Pydantic v2, lo que da validación automática, documentación OpenAPI gratis y serialización JSON sin esfuerzo.

```python
# app/models/schemas.py (resumen)

class MateriaPensum(BaseModel):
    codigo: str
    nombre: str
    creditos: int
    semestre: int = Field(ge=1, le=10)
    tipo: Literal["OBLIGATORIA", "ELECTIVA"]
    prerrequisitos: list[str]
    simultaneas: list[str]

class MateriaCursada(BaseModel):
    codigo: str
    nombre: str
    creditos: int
    nota_definitiva: float
    estado: Literal["APROBADA", "PENDIENTE", "EN_CURSO", "REPROBADA"]
    periodo_cursado: str  # "2023-2"

class MateriaEstado(BaseModel):
    """Materia del pensum enriquecida con estado del estudiante."""
    codigo: str
    nombre: str
    creditos: int
    semestre: int
    tipo: TipoMateria
    estado: EstadoMateria
    nota: float | None
    puede_cursar: bool  # True si prerrequisitos satisfechos

class AnalisisCompleto(BaseModel):
    pensum_carrera: str
    estadisticas: EstadisticasEstudiante
    materias_por_semestre: dict[int, list[MateriaEstado]]
```

### 5.2 Parsers

El sistema tiene **dos parsers especializados**, uno por cada tipo de PDF:

#### `pensum_parser.py`

El PDF del pénsum tiene tablas bien estructuradas. Usamos `pdfplumber.extract_tables()` y aplicamos validación de filas por código (debe ser un código de 7 dígitos):

```python
def _is_data_row(row: list) -> bool:
    codigo = (row[1] or "").strip()
    return bool(re.fullmatch(r"\d{7}", codigo))
```

Las electivas se detectan por el flag `ELEC` en la columna TIPO. Los prerrequisitos vienen como CSV (`"0193203,0193204"`) y se parsean a lista.

#### `historial_parser.py`

El PDF del historial tiene una **marca de agua diagonal** ("Reporte NO válido como certificado") que se mezcla con los datos. La estrategia trivial (`extract_tables`) falla porque las celdas contienen texto basura interleaved.

**Solución:** descubrimos que la marca de agua usa la fuente `Helvetica-Bold` mientras que los datos reales usan `Helvetica` regular. Filtramos por `fontname`:

```python
DATA_FONTS = {"Helvetica", "Helvetica-Oblique"}

def _extract_data_lines(pdf):
    for page in pdf.pages:
        words = page.extract_words(extra_attrs=["fontname"])
        data_words = [w for w in words if w["fontname"] in DATA_FONTS]
        # Agrupar por coordenada Y para reconstruir líneas
        ...
```

Esto eliminó el 100% de la marca de agua sin falsos positivos. **29/29 materias extraídas correctamente, 85/85 créditos coinciden con el PDF original.**

### 5.3 Servicios

#### `calculator.py` — El corazón del sistema

Cruza pensum × historial y produce el `AnalisisCompleto`. Implementa tres reglas no triviales:

1. **Match directo por código**: si una materia del pensum aparece en el historial, hereda su estado.
2. **Satisfacción de slots de electiva**: si el estudiante aprobó `0193207 Mantenimiento de Computadores (ELECTIVA TÉCNICA I)`, marca también `0193206 Electiva Técnica I` (el slot obligatorio) como aprobada.
3. **Detección de homologaciones por similitud de nombre**: si el estudiante tomó `0181315 Electromagnetismo` (de otra facultad) y el pensum tiene `0193304 Electromagnetismo`, se reconoce como equivalente comparando nombres normalizados con `difflib.SequenceMatcher` (umbral 82% + créditos iguales).

#### `pdf_detector.py`

Valida que el usuario no haya invertido los PDFs. Lee la primera página y busca palabras clave:

```python
if "reporte de notas" in text or "promedio acumulado" in text:
    return "historial"
if "pénsum" in text and ("requisito" in text or "simultanea" in text):
    return "pensum"
```

### 5.4 API REST

```
POST /api/analyze
  Content-Type: multipart/form-data
  Body:
    - pensum:    archivo PDF (pénsum oficial)
    - historial: archivo PDF (reporte de notas acumuladas)
  Response 200: AnalisisCompleto (JSON)
  Errores posibles:
    400 — archivos invertidos / archivo equivocado por zona
    415 — el archivo no es un PDF
    422 — no se pudo parsear (PDF dañado o formato desconocido)

GET /api/health
  Response 200: { "status": "ok" }
```

La documentación interactiva se autogenera en `http://127.0.0.1:8000/docs` (gracias a FastAPI + Pydantic).

---

## 6. Frontend

### 6.1 Estructura

La aplicación tiene **dos vistas principales** intercambiadas por el componente raíz `App.jsx`:

- **Home** — Subida de los 2 PDFs
- **Dashboard** — Visualización completa del análisis

No hay router (React Router) porque el flujo es lineal: subir → ver dashboard. El estado en `App.jsx` decide qué renderizar.

### 6.2 State Management

Decisión consciente: **no usar Redux ni Zustand**. Para el tamaño del MVP, `useState` + `useMemo` + un hook custom (`usePersistentState`) son suficientes y mantienen el código simple.

Estado por capa:

| Estado | Ubicación | Persistencia |
|--------|-----------|--------------|
| `analysis` (resultado del backend) | `App.jsx` | localStorage (versionado) |
| `theme` (claro/oscuro) | `App.jsx` | localStorage + preferencia del SO |
| `filter`, `search`, `view` | `Dashboard.jsx` (vía `usePersistentState`) | localStorage |
| `simulatedCodes` (Set) | `Dashboard.jsx` | En memoria (sesión) |
| `isExporting` (transitorio) | `Dashboard.jsx` | En memoria |
| `loading` | `App.jsx` | En memoria |

### 6.3 Componentes principales

#### `Dashboard.jsx`

Orquestador principal. Compone:

```
Dashboard
├── Header (logo, nombre, ThemeToggle, ExportMenu, botón reset)
├── Cache banner (si aplica)
├── WelcomeNotice (si estudiante nuevo)
├── SimulationBanner (si hay simulación activa)
├── StatsCards (4 tarjetas con HelpHints)
├── ProgressBar (barra animada)
├── Sección Herramientas
│   ├── GpaCalculator
│   └── Recommender
└── Sección Pensum
    ├── Header con ViewSwitcher (Grid/Grafo)
    ├── FiltersBar (cuando view === "grid")
    └── PensumGrid o PrerequisitesGraph
```

Calcula derivados con `useMemo` (counts, materiasFiltradas) y aplica simulación con `buildSimulatedData`.

#### `PensumGrid.jsx`

Responsive por design. Internamente decide:

- **Desktop (md+)**: Grid horizontal scrollable con 10 columnas (una por semestre).
- **Móvil**: Accordion vertical, expandible por semestre.
- **Modo exportación** (`forceDesktop`): siempre desktop layout para que el PNG/PDF salga bien aunque el usuario esté en móvil.

#### `PrerequisitesGraph.jsx`

Usa **React Flow** con:
- Nodos custom (`SubjectNode`) coloreados por estado.
- Posicionamiento manual: X por semestre, Y por orden dentro del semestre.
- Aristas `smoothstep` animadas cuando vienen de una materia aprobada o simulada.
- Controles de zoom, pan y bloqueo (controlado, bloquea TODO incluido pan/zoom).
- MiniMap con colores por estado.

### 6.4 Hooks personalizados

#### `usePersistentState(key, defaultValue)`

```javascript
const [filter, setFilter] = usePersistentState("pensum-tracker:filter", "all");
```

Reemplazo drop-in de `useState` que sincroniza con localStorage. Resiste cache corrupto (try/catch + default).

---

## 7. Flujo de datos completo

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  USUARIO                                                             │
│     │                                                                │
│     │ 1. Sube Pensum.pdf + Historial.pdf                             │
│     ▼                                                                │
│  ┌───────────────┐                                                   │
│  │   Home.jsx    │                                                   │
│  │ (2 dropzones) │                                                   │
│  └───────┬───────┘                                                   │
│          │ 2. POST /api/analyze (FormData)                           │
│          ▼                                                           │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Backend: app/routers/upload.py                                │  │
│  │                                                                │  │
│  │  ├─► _validate_pdf  (content-type check)                       │  │
│  │  ├─► _validate_pdf_types  (no invertidos)                      │  │
│  │  ├─► parse_pensum(bytes)                                       │  │
│  │  │     └─► pdfplumber.extract_tables() → 95 MateriaPensum      │  │
│  │  ├─► parse_historial(bytes)                                    │  │
│  │  │     └─► extract_words(fontname=Helvetica) → 29 MateriaCursada│ │
│  │  └─► analizar(pensum, historial)                               │  │
│  │        ├─► slot satisfactions (electivas → slots)              │  │
│  │        ├─► homologations (nombre similar + créditos iguales)   │  │
│  │        ├─► para cada MateriaPensum: puede_cursar?              │  │
│  │        └─► EstadisticasEstudiante + materias_por_semestre      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│          │ 3. Response: AnalisisCompleto (JSON)                      │
│          ▼                                                           │
│  ┌──────────────────────────────────────┐                            │
│  │  App.jsx                             │                            │
│  │  ├─► saveAnalysis(data) → localStorage│                           │
│  │  └─► setAnalysis(data) → render Dashboard                        │
│  └──────────────────────────────────────┘                            │
│          │                                                           │
│          ▼                                                           │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Dashboard.jsx                                               │    │
│  │  ├─► useMemo: counts, materiasFiltradas, simulation          │    │
│  │  ├─► usePersistentState: filter, search, view                │    │
│  │  └─► Renderiza Stats, Progress, Calc, Recommender, Pensum    │    │
│  └──────────────────────────────────────────────────────────────┘    │
│          │                                                           │
│          ▼                                                           │
│  USUARIO ve: avance, semestres restantes, qué cursar                 │
│              + puede simular, filtrar, exportar, cambiar tema        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 8. Funcionalidades implementadas

### Núcleo

- [x] Subida drag & drop de los 2 PDFs
- [x] Parsing robusto del pénsum (95 materias en 10 semestres)
- [x] Parsing del historial filtrando marca de agua (100% precisión)
- [x] Detección de archivos invertidos
- [x] Cálculo de créditos, % de avance, semestres restantes estimados
- [x] Estado de cada materia: aprobada / disponible / bloqueada / reprobada
- [x] Identificación de electivas que satisfacen slots obligatorios
- [x] Detección automática de homologaciones por similitud de nombre

### Visualización

- [x] Vista Grid responsive (desktop columnas, móvil accordion)
- [x] Vista Grafo interactivo con React Flow (nodos, aristas, zoom, bloqueo)
- [x] Código de colores por estado (verde, azul, gris, naranja, morado)
- [x] Barra de progreso animada
- [x] 4 tarjetas de stats con tooltips explicativos
- [x] Filtros: Todas / Aprobadas / Disponibles / Bloqueadas / Electivas
- [x] Búsqueda en tiempo real por código o nombre
- [x] Leyenda visible siempre

### Herramientas de planificación

- [x] **Calculadora de PAPA** — Promedio mínimo necesario para alcanzar una meta
- [x] **Simulador** — Marca materias como "aprobadas hipotéticamente" y recalcula stats
- [x] **Recomendador** — Sugiere materias para el próximo semestre (greedy con score)

### UX/UI

- [x] Modo oscuro con toggle, respeta preferencia del SO
- [x] Loading skeleton animado mientras procesa
- [x] Cache local (30 días, versionado)
- [x] Mensajes de error amigables (no técnicos)
- [x] Empty states con onboarding
- [x] Tooltips (?) en métricas clave
- [x] Transiciones suaves de tema
- [x] Respeta `prefers-reduced-motion`
- [x] Persistencia de filtros, vista y búsqueda
- [x] Mobile-first con vistas adaptadas

### Exportación

- [x] Descarga del dashboard como PNG (alta resolución 2×)
- [x] Descarga del dashboard como PDF
- [x] En móvil fuerza layout desktop durante captura

### Accesibilidad

- [x] ARIA labels, roles (toolbar, radiogroup, menu, tooltip)
- [x] `aria-pressed`, `aria-checked`, `aria-expanded`
- [x] Focus visible en todos los interactivos
- [x] Decoraciones SVG marcadas `aria-hidden`
- [x] Texto alternativo en iconos significativos

---

## 9. Algoritmos clave

### 9.1 Detección de homologaciones

**Problema**: el estudiante puede aprobar materias con código distinto al del pensum (típicamente porque las cursó en otra facultad o son homologadas).

**Algoritmo**:
```
Para cada materia del historial NO en el pensum:
    Mejor match = None, mejor similarity = 0
    Para cada materia OBLIGATORIA del pensum (no electiva):
        Si créditos coinciden:
            Calcular similarity de nombres (SequenceMatcher)
            Si similarity >= 0.82 y > mejor similarity:
                Actualizar mejor match
    Si encontró match:
        Marcar materia del pensum como APROBADA con la nota del historial
```

**Normalización de nombres** previa: quitar paréntesis, tildes, caracteres especiales, lowercase, colapsar espacios.

### 9.2 Simulación

**Problema**: "¿qué pasa si apruebo X e Y el próximo semestre?"

**Algoritmo** (`services/simulation.js`):
```
Dado: análisis original + Set de códigos simulados
1. Para cada materia simulada: marcarla como APROBADA, calcular crédito extra
2. Construir nuevo Set de códigos aprobados (real + simulados)
3. Para cada materia restante: recalcular `puede_cursar` con el Set extendido
4. Recalcular stats: créditos, %, semestres restantes con el nuevo total
5. Retornar nuevo objeto inmutable + flag hasSimulation
```

El cálculo es 100% en cliente, instantáneo, sin tocar el backend.

### 9.3 Recomendador del próximo semestre

**Algoritmo greedy con score** (`services/recommender.js`):

**Score por materia disponible**:
```
score = (transitiveDependents * 3)
      + (5 if OBLIGATORIA else 0)
      - (semestre * 0.5)
      + (4 if semestre cercano al próximo del estudiante)
```

**Algoritmo de selección**:
```
1. Ordenar candidatas por score descendente
2. Iterar y tomar mientras:
   - No exceda target ± 2 créditos (carga ligera/normal/pesada)
   - No más de 2 electivas en total
   - No 2 electivas del mismo "slot" semestre
3. Retornar selección + razón humana de cada inclusión
```

**Razón humana**: "Desbloquea 3 materias · Es del semestre 5 · Obligatoria".

### 9.4 Calculadora de PAPA

**Fórmula matemática** (`components/GpaCalculator.jsx`):

```
PAPA_final = (PAPA_actual × créditos_aprobados + promedio_restante × créditos_restantes)
             / (créditos_aprobados + créditos_restantes)

Despejando promedio_restante para alcanzar un objetivo:

promedio_restante = (target × créditos_totales − PAPA_actual × créditos_aprobados)
                    / créditos_restantes
```

**Clasificación** del resultado:
- `> 5.0` → **Matemáticamente imposible**
- `≥ 4.5` → **Muy exigente**
- `≥ 3.5` → **Exigente**
- `≥ 3.0` → **Alcanzable**
- `< 3.0` → **Muy alcanzable** (solo necesita aprobar)

---

## 10. Instalación y ejecución

### Prerrequisitos

- Python 3.11+
- Node.js 18+ (recomendado 20+)
- npm 9+

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```

El backend queda en `http://127.0.0.1:8000`. La documentación interactiva en `/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend queda en `http://localhost:5173`. CORS ya configurado para esta URL.

### Build de producción

```bash
cd frontend
npm run build      # Genera /dist
npm run preview    # Sirve /dist para validar
```

### Tests

```bash
# Backend (94 tests: calculator, parsers, detector, router, multi-carrera)
cd backend
pip install -r requirements-dev.txt
python -m pytest

# Frontend (53 tests: recommender, simulation, cache, theme, api, hook)
cd frontend
npm test
```

---

## 11. Privacidad y seguridad

- **Sin almacenamiento server-side**: los PDFs se procesan en memoria y se descartan al terminar la request.
- **Sin tracking**: no hay Google Analytics, Hotjar ni telemetría de ningún tipo.
- **Sin cookies de sesión**: el cache local usa `localStorage` y nunca se transmite.
- **CORS restrictivo**: solo el origen del frontend está autorizado.
- **Validación de tipo MIME**: solo se aceptan archivos `application/pdf`.
- **Validación de contenido**: el detector de PDF rechaza archivos que no parezcan los esperados.

### Recomendaciones para producción

- **Rate limiting**: ya integrado con `slowapi` (10 req/min por IP por defecto, configurable con `ANALYZE_RATE_LIMIT`). Para múltiples instancias, configurar `RATELIMIT_STORAGE_URI` con Redis.
- **Tamaño de upload**: límite de 10 MB por archivo, validado en streaming (chunks de 64 KB) para evitar cargar payloads enormes en RAM.
- Logs estructurados con `structlog` o similar para debug remoto.
- Sentry o equivalente para tracking de errores.

---

## 12. Limitaciones conocidas

| Limitación | Impacto | Workaround |
|------------|---------|------------|
| Solo probado con PDFs de Ingeniería de Sistemas | Otras carreras podrían tener formato distinto | Validar con PDFs de prueba de otras carreras antes de generalizar |
| El cálculo del PAPA simulado usa solo notas reales | Si simulas, el promedio mostrado no cambia | Banner avisa explícitamente al usuario |
| Sin login ni cuentas | No se puede sincronizar entre dispositivos | Cache local de 30 días mitiga parcialmente |
| El recomendador no considera ofertas reales del semestre | Una materia puede no abrirse ese semestre | Usuario decide al final, es una sugerencia |
| Bundle del frontend grande (~860 KB) | First load lento en conexiones lentas | Code splitting de React Flow / jsPDF pendiente |

---

## 13. Roadmap futuro

### Corto plazo

- Code splitting para reducir bundle inicial
- Deploy: Vercel (frontend) + Render (backend)

### Mediano plazo

- Sistema de cuentas (Supabase Auth) para sincronizar entre dispositivos
- Base de datos para pénsums oficiales por carrera (no resubir cada vez)
- Histórico de avance: "hace 6 meses ibas en X%"
- Plan multi-semestre (no solo el próximo)

### Largo plazo

- Soporte para otras universidades colombianas
- Sistema de reseñas de materias por estudiantes
- Mapa de profesores por materia (histórico)
- Recomendador con afinidad de perfil (rama de TI, redes, datos, etc.)

---

## Créditos

Construido como proyecto personal con foco en mostrar:

- Procesamiento real de documentos del mundo real (PDFs con marca de agua).
- Arquitectura cliente-servidor desacoplada con buenas prácticas.
- React moderno con hooks, sin frameworks pesados de estado.
- UX cuidada: dark mode, a11y, responsive, persistencia, exportación.
- Algoritmos prácticos: matching difuso, greedy scoring, simulación reactiva.

**Universidad Francisco de Paula Santander Ocaña** — Ingeniería de Sistemas.
