# J Soft Solutions — Portafolio Web v2.0

Portfolio web profesional para J Soft Solutions.

## Stack

- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Frontend**: React 19 + Vite + TypeScript
- **Monorepo**: pnpm workspaces

## Estructura

```
├── api/              # API REST
├── client-site/      # Sitio público (clientes)
├── recruiter-site/   # Sitio público (reclutadores)
├── admin-panel/      # Panel administrativo
└── packages/shared/  # Componentes y tipos compartidos
```

## Inicio Rápido

```bash
# Instalar dependencias
pnpm install

# Desarrollo
pnpm -F @jsoft/api dev        # API (puerto 3000)
pnpm -F @jsoft/client-site dev # Cliente (puerto 5173)
```

## Licencia

Privado — J Soft Solutions
