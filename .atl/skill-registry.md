# Skill Registry

Generated: 2026-04-08
Project: portafoliov2jss

## Skills

### User-Level Skills

| Skill | Location | Triggers |
|-------|----------|----------|
| `code-auditor` | `~/.config/opencode/skills/code-auditor/SKILL.md` | Seguridad, APIs, integraciones, testing, code review, auditoría |
| `react-19` | `~/.config/opencode/skills/react-19/SKILL.md` | React components, React Compiler |
| `typescript` | `~/.config/opencode/skills/typescript/SKILL.md` | TypeScript code, types, interfaces, generics |
| `nextjs-15` | `~/.config/opencode/skills/nextjs-15/SKILL.md` | Next.js, routing, Server Actions, data fetching |
| `playwright` | `~/.config/opencode/skills/playwright/SKILL.md` | E2E tests, Page Objects, selectors |
| `skill-creator` | `~/.config/opencode/skills/skill-creator/SKILL.md` | Create new AI agent skills |
| `branch-pr` | `~/.config/opencode/skills/branch-pr/SKILL.md` | PR creation workflow |
| `issue-creation` | `~/.config/opencode/skills/issue-creation/SKILL.md` | GitHub issue creation |
| `judgment-day` | `~/.config/opencode/skills/judgment-day/SKILL.md` | Parallel adversarial review |
| `go-testing` | `~/.config/opencode/skills/go-testing/SKILL.md` | Go testing patterns |

### Project-Level Skills

None detected.

## Project Conventions

### Files Scanned
- `DEVELOPMENT_PLAN.md` — Contains architecture decisions, tech stack, and development phases
- `README.md` — Project overview
- `F0_FOUNDATION_PLAN.md` — Foundation phase details
- `TECHNICAL_SPEC_UPDATED.md` — Technical specifications

### Detected Conventions

#### Tech Stack
- **Monorepo**: pnpm workspaces
- **API**: Express 4.21 + TypeScript 5.7 + Prisma 6.3 + Zod 3.24
- **Shared**: Zod schemas built with tsup
- **Frontends**: React 19 + Vite 6 + TypeScript + React Router 7 + TanStack React Query 5
- **Admin-specific**: TipTap for rich text editing

#### Architecture Patterns
- Monorepo with clear separation: API, shared schemas, frontend apps
- API follows Express + Prisma pattern (Controllers → Services → Prisma)
- Frontends use React 19 with Vite
- Shared Zod schemas for validation across packages
- Workspace dependencies linked via `workspace:*`

#### Code Conventions
- TypeScript strict mode enabled (`tsconfig strict: true`)
- ESNext modules with bundler resolution
- No linter configuration files found (eslint script exists but no config)
- No formatter configured
- No test framework installed (jest script exists but not in dependencies)

#### Development Workflow
- Node.js >=20 required
- pnpm >=9 required
- Docker Compose available for PostgreSQL
- Environment variables managed via `.env` files

## Usage Notes

- **Skills Usage**: Load relevant skill when working with its trigger topic
- **Testing**: Jest script defined but not installed; need to add jest to dependencies
- **Linting**: ESLint script defined but not installed; need to add eslint config
- **Type Checking**: Available via `tsc --noEmit` scripts in each package