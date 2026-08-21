# 📁 Documentación del Proyecto

Estructura organizada de documentos del proyecto J Soft Solutions Portafolio v2.0.

> **Nota**: `openspec/` (en la raíz del repo) es la **fuente activa de planificación**. Ahí viven
> los artefactos SDD (Spec-Driven Development): `openspec/specs/` (especificaciones por dominio)
> y `openspec/changes/` (cambios activos y archivados). Esta carpeta `docs/` contiene
> documentación histórica y de referencia.

## 📂 Estructura

```
docs/
├── plans/              ← Planes de desarrollo y tareas
│   ├── DEVELOPMENT_PLAN.md
│   ├── F0_FOUNDATION_PLAN.md
│   └── tasks-implement-frontends.md
│
├── specs/              ← Especificaciones técnicas
│   └── TECHNICAL_SPEC_UPDATED.md
│
├── analysis/           ← Análisis de arquitectura del sistema
│   └── SYSTEM_ARCHITECTURE.md
│
├── pdfs/               ← Documentos originales en PDF
│   ├── JSoft_Portafolio_v2_Especificacion_Tecnica.pdf
│   └── j_soft_solutions.pdf
│
├── archive/            ← Documentos obsoletos o archivados
└── WORKFLOWS.md        ← Flujos de trabajo (WF-01..WF-15) para verificación manual
```

## 📋 Descripción de Archivos

### Plans (Planes de Desarrollo)

| Archivo | Descripción |
|---------|-------------|
| `DEVELOPMENT_PLAN.md` | Plan maestro de desarrollo por fases (F0-F7) |
| `F0_FOUNDATION_PLAN.md` | Plan detallado de la Fase 0 (Foundation API) |
| `tasks-implement-frontends.md` | Tareas desglosadas para implementación de frontends |

### Specs (Especificaciones)

| Archivo | Descripción |
|---------|-------------|
| `TECHNICAL_SPEC_UPDATED.md` | Especificación técnica actualizada v1.1 |

### Analysis (Análisis)

| Archivo | Descripción |
|---------|-------------|
| `SYSTEM_ARCHITECTURE.md` | Análisis de la arquitectura del sistema |

### Workflows (Flujos de prueba manual)

| Archivo | Descripción |
|---------|-------------|
| `WORKFLOWS.md` | 15 flujos (WF-01..WF-15) para verificar funcionalidad en local |

### PDFs (Documentos Originales)

| Archivo | Descripción |
|---------|-------------|
| `JSoft_Portafolio_v2_Especificacion_Tecnica.pdf` | Espec técnica original del proyecto |
| `j_soft_solutions.pdf` | Wireframes y diseño inicial |

## 🔗 Enlaces Rápidos

- [Plan de Desarrollo](./plans/DEVELOPMENT_PLAN.md)
- [Especificación Técnica](./specs/TECHNICAL_SPEC_UPDATED.md)
- [Arquitectura del Sistema](./analysis/SYSTEM_ARCHITECTURE.md)
- [Workflows de prueba](./WORKFLOWS.md)
- [Tareas Frontends](./plans/tasks-implement-frontends.md)
- **SDD (fuente activa):** [`openspec/specs/`](../openspec/specs/) y [`openspec/changes/`](../openspec/changes/)