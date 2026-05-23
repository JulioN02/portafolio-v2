# Skill Registry

Generated: 2026-05-22
Project: portafolio-v2 (portafoliov2jss)

## Skills

### User-Level Skills

| Skill | Location | Triggers |
|-------|----------|----------|
| `code-auditor` | `~/.config/opencode/skills/code-auditor/SKILL.md` | Seguridad, APIs, integraciones, testing, code review, auditoría |
| `design-critic` | `~/.config/opencode/skills/design-critic/SKILL.md` | Crítico de diseño: cuestiona decisiones, identifica suposiciones, detecta huecos |
| `react-19` | `~/.config/opencode/skills/react-19/SKILL.md` | React components, React Compiler |
| `typescript` | `~/.config/opencode/skills/typescript/SKILL.md` | TypeScript code, types, interfaces, generics |
| `nextjs-15` | `~/.config/opencode/skills/nextjs-15/SKILL.md` | Next.js routing, Server Actions (NOT used in this project) |
| `playwright` | `~/.config/opencode/skills/playwright/SKILL.md` | E2E tests, Page Objects, selectors |
| `skill-creator` | `~/.config/opencode/skills/skill-creator/SKILL.md` | Create new AI agent skills |
| `branch-pr` | `~/.config/opencode/skills/branch-pr/SKILL.md` | PR creation workflow |
| `issue-creation` | `~/.config/opencode/skills/issue-creation/SKILL.md` | GitHub issue creation |
| `judgment-day` | `~/.config/opencode/skills/judgment-day/SKILL.md` | Parallel adversarial review |
| `go-testing` | `~/.config/opencode/skills/go-testing/SKILL.md` | Go testing patterns (NOT used in this project) |
| `vertical-slices` | `~/.config/opencode/skills/vertical-slices/SKILL.md` | Monolito Modular + Vertical Slices + API-First |
| `sdd-workflow` | `~/.agents/skills/sdd-workflow/SKILL.md` | Spec-Driven Development workflow |
| `engram-memory` | `~/.agents/skills/engram-memory/SKILL.md` | Engram persistent memory integration |
| `playwright-cli` | `~/.claude/skills/playwright-cli/SKILL.md` | Browser automation, web testing |

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
| `skill-registry` | `~/.config/opencode/skills/skill-registry/SKILL.md` | Update skill registry |
| `customize-opencode` | (built-in) | Edit opencode configuration |

## Project Conventions

### Tech Stack
- **Monorepo**: pnpm workspaces (pnpm 9.15.0)
- **API** (`@jsoft/api`): Express 4.21 + TypeScript 5.7 + Prisma 6.3 + Zod 3.24 + Jest 30 + ts-jest
- **Shared** (`@jsoft/shared`): Zod schemas, TypeScript types, API client, reusable UI components, built with tsup
- **Frontends**: React 19 + Vite 6 + TypeScript 5.7 + React Router 7
- **Client Site** (`@jsoft/client-site`): TanStack Query 5 + Embla Carousel
- **Recruiter Site** (`@jsoft/recruiter-site`): TanStack Query 5 + Embla Carousel + DOMPurify
- **Admin Panel** (`@jsoft/admin-panel`): TanStack Query 5 + TipTap rich text + Axios + jwt-decode + slugify
- **Database**: PostgreSQL 15 via Docker Compose
- **Auth**: JWT with bcrypt

### Architecture Patterns
- API-First design with shared Zod schemas validated across packages
- Express pattern: routes → controllers → services → Prisma ORM
- Soft-delete pattern (`deletedAt` nullable DateTime) on all content entities
- Manual ordering via `order` field + `featured` boolean
- Frontends use hooks pattern with TanStack Query for data fetching
- Shared package: Zod schemas, TypeScript types, API client, UI components (`Button`, `Input`, `Card`, `Loading`, `ErrorMessage`, `Modal`, `ProtectedRoute`)
- CSS variables via `@jsoft/shared` design tokens

### Database Models (7)
- `User` — Admin authentication
- `Service` — with `order`, `featured`, soft-delete
- `Product` — with `order`, `featured`, soft-delete
- `Tool` — with `order`, `featured`, soft-delete, `requiresInstall`
- `SuccessCase` — with media support, soft-delete
- `BlogPost` — with `PostStatus` enum (DRAFT/PUBLISHED/PRIVATE/ARCHIVED), soft-delete
- `ContactForm` — with `FormOrigin` enum (CLIENT/RECRUITER)

### Code Conventions
- TypeScript strict mode (`strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`)
- ESNext modules with bundler resolution, target ES2022
- ESLint config exists for frontends only (jsx-a11y plugin)
- No formatter configured
- File naming: `*.service.ts`, `*.routes.ts`, `*.middleware.ts`, `*.schema.ts`, `*.test.ts`

### Testing
- **API only**: Jest 30.3.0 + ts-jest, 62 tests across 6 service-level test files, 70% coverage threshold
- **Frontends**: No testing framework installed
- **CI**: `pnpm -r run typecheck` + `pnpm -r run build` in CI pipeline
- **E2E**: Not installed

### Development Workflow
- Node.js >=20, pnpm >=9
- `pnpm install` for dependencies
- `pnpm -F @jsoft/api dev` for API (port 3000)
- `pnpm -F @jsoft/client-site dev` for client site
- `pnpm -F @jsoft/recruiter-site dev` for recruiter site
- `pnpm -F @jsoft/admin-panel dev` for admin panel
- `pnpm -r run typecheck` for type checking (0 errors across all packages)
- `pnpm --filter @jsoft/api test` for API tests (62/62 passing)
- Docker Compose for local PostgreSQL (port 5434)
- Prisma for migrations and client generation

## SDD Context (2026-05-22)

### Metodología SDD Habilitada
- **Fases**: proposal → specs → design → tasks → apply → verify → archive
- **Persistencia solicitada**: engram (openspec/ already exists — populated with artifacts)
- **Strict TDD**: ✅ Enabled (API tests only)

### Existing SDD Artifacts
- `openspec/config.yaml` — Full configuration
- `openspec/specs/` — 5 recruiter site specs
- `openspec/changes/implement-admin-panel/` — Active change
- `openspec/changes/polish-2/` — Active change (quality pass)
- `openspec/changes/archive/2026-05-19-implement-recruiter-site/` — Archived change

### Testing Capabilities
| Layer | Available | Tool |
|-------|-----------|------|
| Unit (api) | ✅ | Jest 30.3.0 + ts-jest (62 tests) |
| Unit (frontends) | ❌ | No instalado |
| Integration | ❌ | No instalado |
| E2E | ❌ | No instalado |

### Quality Tools
| Tool | Available | Command |
|------|-----------|---------|
| Linter | ⚠️ Partial | ESLint jsx-a11y on frontends only |
| Type checker | ✅ | tsc --noEmit (0 errors across 5 packages) |
| Formatter | ❌ | None |

## Usage Notes

- **Skills Usage**: Load relevant skill when working with its trigger topic
- **Testing**: Tests exist only in API (`pnpm --filter @jsoft/api test`). No tests for frontends.
- **Linting**: ESLint only has jsx-a11y plugin in frontends; no full eslint config
- **Type Checking**: Available per package via `tsc --noEmit` — all pass with 0 errors
- **Formatting**: No formatter configured
