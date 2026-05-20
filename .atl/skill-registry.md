# Skill Registry

Generated: 2026-05-20
Project: portafoliov2jss

## Skills

### User-Level Skills

| Skill | Location | Triggers |
|-------|----------|----------|
| `code-auditor` | `~/.config/opencode/skills/code-auditor/SKILL.md` | Seguridad, APIs, integraciones, testing, code review, auditoría |
| `design-critic` | `~/.config/opencode/skills/design-critic/SKILL.md` | Crítico de diseño: cuestiona decisiones, identifica suposiciones, detecta huecos |
| `react-19` | `~/.config/opencode/skills/react-19/SKILL.md` | React components, React Compiler |
| `typescript` | `~/.config/opencode/skills/typescript/SKILL.md` | TypeScript code, types, interfaces, generics |
| `nextjs-15` | `~/.config/opencode/skills/nextjs-15/SKILL.md` | Next.js, routing, Server Actions, data fetching (NOT used in this project) |
| `playwright` | `~/.config/opencode/skills/playwright/SKILL.md` | E2E tests, Page Objects, selectors |
| `skill-creator` | `~/.config/opencode/skills/skill-creator/SKILL.md` | Create new AI agent skills |
| `branch-pr` | `~/.config/opencode/skills/branch-pr/SKILL.md` | PR creation workflow |
| `issue-creation` | `~/.config/opencode/skills/issue-creation/SKILL.md` | GitHub issue creation |
| `judgment-day` | `~/.config/opencode/skills/judgment-day/SKILL.md` | Parallel adversarial review |
| `go-testing` | `~/.config/opencode/skills/go-testing/SKILL.md` | Go testing patterns (NOT used in this project) |
| `vertical-slices` | `~/.config/opencode/skills/vertical-slices/SKILL.md` | Monolito Modular + Vertical Slices + API-First |
| `sdd-workflow` | `~/.agents/skills/sdd-workflow/SKILL.md` | Spec-Driven Development workflow |
| `engram-memory` | `~/.agents/skills/engram-memory/SKILL.md` | Engram persistent memory integration |

### Project-Level Skills

| Skill | Location | Triggers |
|-------|----------|----------|
| `sdd-init` | `~/.config/opencode/skills/sdd-init/SKILL.md` | SDD initialization |
| `sdd-explore` | `~/.config/opencode/skills/sdd-explore/SKILL.md` | SDD exploration |
| `sdd-propose` | `~/.config/opencode/skills/sdd-propose/SKILL.md` | SDD proposal creation |
| `sdd-spec` | `~/.config/opencode/skills/sdd-spec/SKILL.md` | SDD specification writing |
| `sdd-design` | `~/.config/opencode/skills/sdd-design/SKILL.md` | SDD technical design |
| `sdd-tasks` | `~/.config/opencode/skills/sdd-tasks/SKILL.md` | SDD task breakdown |
| `sdd-apply` | `~/.config/opencode/skills/sdd-apply/SKILL.md` | SDD implementation |
| `sdd-verify` | `~/.config/opencode/skills/sdd-verify/SKILL.md` | SDD verification |
| `sdd-archive` | `~/.config/opencode/skills/sdd-archive/SKILL.md` | SDD archiving |
| `sdd-onboard` | `~/.config/opencode/skills/sdd-onboard/SKILL.md` | SDD onboarding walkthrough |

## Project Conventions

### Files Scanned
- `README.md` — Project overview
- `docs/specs/TECHNICAL_SPEC_UPDATED.md` — Technical specifications (473 lines, v1.1)
- `SECURITY.md` — Security policy
- `.github/workflows/ci.yml` — CI pipeline
- `.github/workflows/deploy.yml` — Deploy workflow
- `docker-compose.yml` — PostgreSQL 15 Alpine

### Detected Conventions

#### Tech Stack
- **Monorepo**: pnpm workspaces (pnpm 9.15.0)
- **API** (`@jsoft/api`): Express 4.21 + TypeScript 5.7 + Prisma 6.3 + Zod 3.24 + Jest 30 + ts-jest
- **Shared** (`@jsoft/shared`): Zod schemas, TypeScript types, API client, reusable UI components, built with tsup
- **Frontends**: React 19 + Vite 6 + TypeScript 5.7 + React Router 7
- **Client Site** (`@jsoft/client-site`): TanStack Query 5 + Embla Carousel
- **Recruiter Site** (`@jsoft/recruiter-site`): TanStack Query 5 + Embla Carousel + DOMPurify
- **Admin Panel** (`@jsoft/admin-panel`): TanStack Query 5 + TipTap rich text + Axios + jwt-decode + slugify
- **Database**: PostgreSQL 15 via Docker Compose
- **Auth**: JWT with bcrypt

#### Architecture Patterns
- API-First design with shared Zod schemas validated across packages
- API follows Express pattern: routes → controllers → services → Prisma ORM
- Soft-delete pattern (`deletedAt` nullable DateTime) on all content entities
- Manual ordering via `order` field + `featured` boolean for content control
- Frontends use hooks pattern with TanStack Query for data fetching
- Shared package provides: Zod schemas, TypeScript types, API client, UI components (`Button`, `Input`, `Card`, `Loading`, `ErrorMessage`, `Modal`, `ProtectedRoute`)
- CSS variables via `@jsoft/shared` design tokens

#### Database Models (7 models)
- `User` — Admin authentication
- `Service` — Services with `order`, `featured`, soft-delete
- `Product` — Products with `order`, `featured`, soft-delete
- `Tool` — Tools with `order`, `featured`, soft-delete, `requiresInstall`
- `SuccessCase` — Success stories with media support, soft-delete
- `BlogPost` — Blog with `PostStatus` enum (DRAFT/PUBLISHED/PRIVATE/ARCHIVED), soft-delete
- `ContactForm` — Contact submissions with `FormOrigin` enum (CLIENT/RECRUITER)

#### Code Conventions
- TypeScript strict mode enabled (`strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`)
- ESNext modules with bundler resolution
- Target ES2022
- No ESLint/Prettier config files found (linter scripts defined but not configured)
- File naming: `*.service.ts`, `*.routes.ts`, `*.middleware.ts`, `*.schema.ts`, `*.test.ts`

#### Testing
- **API only**: Jest 30.3.0 + ts-jest, 6 test files (service-level), 70% coverage threshold
- **Frontends**: No testing framework installed
- **CI**: `pnpm -r run typecheck` + `pnpm -r run build` in CI pipeline
- No E2E testing framework installed

#### Development Workflow
- Node.js >=20, pnpm >=9 required
- `pnpm install` for dependencies
- `pnpm -F @jsoft/api dev` for API (port 3000)
- `pnpm -F @jsoft/client-site dev` for client site
- `pnpm -r run typecheck` for type checking all packages
- `pnpm -r run build` for building all packages
- `pnpm --filter @jsoft/api test` for running API tests
- Docker Compose for local PostgreSQL (port 5434)
- Prisma for migrations and client generation
- JWT_SECRET, DATABASE_URL required in .env

#### Existing SDD Artifacts
- `openspec/config.yaml` — SDD configuration (created by sdd-init)
- `openspec/specs/` — 5 recruiter site specs (layout, home, blog, projects, contact)
- `openspec/changes/implement-admin-panel/` — Active change with full SDD lifecycle
- `openspec/changes/archive/2026-05-19-implement-recruiter-site/` — Archived change

## SDD Context (2026-05-20)

### Metodología SDD Habilitada
- **Fases**: proposal → specs → design → tasks → apply → verify → archive
- **Persistencia**: hybrid (openspec + engram)
- **Strict TDD**: ✅ Enabled (API tests only)

### Testing Capabilities
| Layer | Available | Tool |
|-------|-----------|------|
| Unit (api) | ✅ | Jest 30.3.0 + ts-jest |
| Unit (frontends) | ❌ | No instalado |
| Integration | ❌ | No instalado |
| E2E | ❌ | No instalado |

## Usage Notes

- **Skills Usage**: Load relevant skill when working with its trigger topic
- **Testing**: Tests exist only in API (`pnpm --filter @jsoft/api test`). No tests for frontends.
- **Linting**: ESLint script defined but not configured; consider adding eslint config
- **Type Checking**: Available per package via `tsc --noEmit` scripts (all packages)
- **Formatting**: No formatter configured
