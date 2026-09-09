# KinetiQ

KinetiQ is a full-stack fitness development platform for building a high-quality exercise library, designing reusable workout routines and training programs, recording completed workouts, and understanding training history through explainable analytics. Progression, recovery, and long-term coaching capabilities remain later-stage work.

The product milestone remains intentionally focused: a realistic single-developer MVP with controlled exercise data, muscle relationships, exercise profiles, authentication, user-owned routines, reusable and adopted training programs, workout performance history, and basic analytics. More advanced features such as progression recommendations, recovery tracking, coach workflows, nutrition, payments, and social features remain later phases.

## Planned Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- React Hook Form, Zod, TanStack Query
- NestJS, TypeScript, Better Auth
- Prisma ORM and PostgreSQL
- Vitest, React Testing Library, Jest, Supertest, Playwright where appropriate
- Docker, Docker Compose, Nginx, HTTPS with Certbot
- Oracle Cloud VPS deployment

## Repository Shape

The intended monorepo structure is:

```text
apps/
  web/
  api/

packages/
  shared-types/
  validation/
  eslint-config/
  tsconfig/
```

Shared packages should be added only when they carry stable contracts or remove real duplication. Frontend code should not depend on Prisma models or backend internals.

## MVP Scope

The first production MVP includes:

- Seeded muscle reference library
- Exercise library with detailed exercise records
- Optional Cloudinary-served exercise and muscle image URLs when approved assets are available
- Exercise-to-muscle relationships with role and involvement score
- Exercise capability and demand profiles
- Exercise filtering and search
- Authentication with Better Auth
- User-owned workout routines
- Routine exercise prescriptions
- Routine create, edit, duplicate, and delete workflows
- Reusable training-program templates and user-owned adopted-program execution
- Workout sessions with completed-set performance history
- Initial explainable, read-only analytics derived from completed workouts
- Responsive UI
- Backend and frontend tests
- Docker-based deployment

The MVP does not include image uploads or image-management workflows, advanced analytics or opaque recommendations, progression guidance, recovery/fatigue tracking, AI, nutrition, payments, coach organizations, social features, or calendar scheduling/synchronization.

## Implementation Plan

The detailed implementation plan lives in [docs/implementation-plan](docs/implementation-plan/README.md).

Start with:

1. [Project vision](docs/implementation-plan/00-project-vision.md)
2. [Scope and roadmap](docs/implementation-plan/01-scope-and-roadmap.md)
3. [Architecture](docs/implementation-plan/02-architecture.md)
4. [Domain model overview](docs/implementation-plan/03-domain-model-overview.md)
5. [Release plan](docs/implementation-plan/23-release-plan.md)

## Core Modeling Principles

KinetiQ separates exercise identity from related domain concepts:

- What an exercise is
- Which muscles it involves
- What physical qualities it may develop
- What technical and recovery demands it has
- How it loads the body
- How it is prescribed inside a routine
- What an athlete actually performs
- How the athlete responds over time

Exercise ratings are editorial classifications, not precise scientific measurements. Ordered comparative ratings use a consistent 0-5 scale.

## Current Status

The repository has implemented reference-library, routine, training-program, adopted-program, workout-session, and basic analytics slices. PostgreSQL runs through Docker Compose for local development; the API has Prisma migrations, validated configuration, Better Auth wiring, owner-scoped session and analytics queries, public muscle/exercise endpoints, and a database readiness endpoint; the web app has responsive pages, active-workout and program execution flows, analytics, and the shared application shell.

The next product slice is MVP hardening: complete authentication/admin acceptance, ownership/security verification, accessibility, observability, backups, and deployment readiness. Advanced analytics, progression, recovery, calendar scheduling, and coach workflows remain deferred according to the implementation plan.

### Local verification

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
docker compose up -d postgres
pnpm --filter api prisma:migrate:dev
pnpm --filter api prisma:seed
pnpm dev:api
pnpm dev:web
```

The API is available at `http://localhost:3000/api`, readiness is checked at `/api/health`, and development Swagger is available at `/api/docs`. Application containers are intentionally not part of the development Compose file; the API and web run directly from the workspace for fast iteration.

Run the repository checks with `pnpm check`.
