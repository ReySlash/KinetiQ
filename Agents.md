# AGENTS.md

## Project

Kinetiq is a fitness development platform built with:

- Next.js
- Tailwind CSS
- shadcn/ui
- NestJS
- Better Auth
- Prisma ORM
- PostgreSQL
- pnpm
- Docker

The repository uses a simple monorepo structure:

```text
apps/
  web/
  api/
```

Add shared packages only when real duplication or stable shared contracts justify them.

## Working Style

Act as a balanced coding assistant:

- Implement tasks efficiently.
- Explain important architectural, security, database, testing, and domain decisions.
- Keep explanations concise and relevant.
- For larger tasks, inspect the relevant code, state a short plan and assumptions, then proceed.
- Ask only when ambiguity could materially affect architecture, persistence, security, API contracts, or user experience.

Complete the requested scope without unnecessary expansion.

You may make changes directly required to complete the task. Before making any non-requested change:

1. Explain why it is needed.
2. Explain the impact of not making it.
3. Propose the smallest reasonable solution.
4. Wait for approval.

## Architecture

Follow standard Next.js and NestJS conventions while keeping implementations simple.

- Avoid premature abstractions and unnecessary layers.
- Prefer existing project patterns.
- Recommend architectural improvements when warranted, but ask before changing direction.
- Keep future roadmap features in mind without building speculative abstractions.
- Organize NestJS by domain feature, with shared infrastructure modules for concerns such as Prisma, authentication, configuration, and logging.
- Keep route-specific Next.js code colocated with routes and reusable domain code in feature folders.
- Use Server Components, direct fetching, and TanStack Query according to the feature’s interaction needs.
- Share only stable API contracts. Do not expose Prisma models or backend internals to the frontend.
- NestJS services may access Prisma directly for simple operations. Introduce repositories for complex, reused, or independently testable query logic.

## TypeScript and Code Quality

- Keep TypeScript strict.
- Do not use `any`, unsafe assertions, or type suppressions unless absolutely necessary and clearly justified.
- Prefer self-documenting code, clear names, and small focused functions.
- Add comments only for non-obvious business rules, constraints, or tradeoffs.
- Use ESLint and Prettier.
- Fix linting and formatting only in files touched by the task.
- Do not perform unrelated repository-wide formatting or cleanup.

## API and Validation

- The NestJS API is authoritative for validation and business rules.
- Use DTOs and structured validation.
- Maintain predictable API error shapes.
- Use centralized exception handling and user-friendly frontend error messages.
- Document API endpoints with Swagger/OpenAPI.
- Preserve existing API contracts by default.
- Ask before introducing breaking API changes.

## Authentication and Authorization

- Better Auth handles identity and sessions.
- NestJS handles authorization, ownership, roles, and permissions.
- Enforce ownership directly in Prisma queries when practical.
- Introduce policy or authorization abstractions only for complex permissions.
- Apply least privilege.
- Add tests for critical authentication and authorization behavior.
- Never trust user-provided ownership identifiers without verifying them against the authenticated user.

## Database

- Explain destructive migrations, relation redesigns, renames, or data-loss risks before proceeding.
- Always require approval before destructive actions.
- Use Prisma transactions when multiple related operations must succeed or fail together.
- Prefer archive states for important user-facing or historically referenced records.
- Hard-delete only records that have no meaningful historical impact.
- Audit critical actions involving authentication, ownership, permissions, exercise ratings, archival, and destructive operations.
- Do not manually edit generated Prisma files.
- Regenerate generated artifacts only when required.

## Exercise Domain

Treat exercise ratings as editorial heuristics, not objective scientific measurements.

- Separate factual attributes, enums, relations, and subjective ratings.
- Actual stimulus, fatigue, and training cost depend on prescription and athlete context, not only on the exercise record.
- Use domain terminology consistently.
- Do not invent exercise-science claims, ratings, or mappings without approval.
- Flag uncertain or ambiguous domain assumptions before encoding them into the schema.
- Treat exercise seed data as curated domain data and modify it only within the requested scope.
- Keep detailed domain definitions in dedicated documentation rather than expanding this file.

## Testing

Use risk-based testing.

Always prioritize tests for:

- Business logic
- Validation
- Authorization and ownership
- Prisma queries and transactions
- Exercise scoring and analytics
- Critical frontend interactions
- Important end-to-end flows

Every bug fix should include a regression test when practical.

Before declaring a task complete, run the relevant available categories:

- Lint
- Type checking
- Tests
- Build

Discover the exact commands from `package.json`.

If pre-existing failures are found:

- Distinguish them clearly from failures introduced by the task.
- Explain whether they affect the requested work.
- Ask before fixing unrelated failures.

## Dependencies

Never install, remove, or replace a dependency without approval.

Before proposing a dependency:

1. Explain the problem it solves.
2. Explain why existing tools are insufficient.
3. Mention maintenance, security, bundle-size, and architectural impact.
4. Propose the smallest suitable option.

Respect existing framework and package versions. Mention important unsupported or outdated dependencies, but ask before upgrading them.

## UI and Accessibility

- Use the existing design system and shadcn/ui components.
- Keep interfaces responsive and mobile-friendly.
- Ask before introducing a new visual direction or redesigning an existing flow.
- New UI must include semantic HTML, labels, keyboard support, focus management, meaningful errors, and reasonable contrast.
- Preserve established domain terminology.
- You may improve small labels and messages, but ask before renaming important domain concepts.

## Configuration, Security, and Logging

- Document every required environment variable in `.env.example`.
- Validate required configuration at startup.
- Never hardcode secrets.
- Ask before reading `.env` files, private keys, certificates, database dumps, or other sensitive files.
- Never expose secrets or sensitive user data in output or logs.
- Use structured logging with appropriate levels and useful context.
- Do not log credentials, tokens, sessions, private health-related data, or full sensitive payloads.
- Include health checks early.
- Add broader monitoring only when production needs justify it.

## Performance

Use sensible defaults without premature optimization.

- Avoid obvious N+1 queries.
- Use pagination for potentially large collections.
- Select only required database fields when appropriate.
- Avoid unnecessary Client Components and rerenders.
- Optimize further only when evidence shows a real bottleneck.

## Documentation

Update relevant documentation when a task changes:

- Setup instructions
- Environment variables
- API contracts
- Architecture
- Domain behavior
- Deployment requirements

Documentation and code are both sources of truth.

For low-risk inconsistencies, infer the intended behavior and report the discrepancy. Ask before resolving contradictions involving domain behavior, persistence, security, API contracts, or user data.

## Git and Files

- Preserve unrelated files and existing user changes.
- Modify only files required for the task.
- Ask before broad cleanup, restructuring, renaming, or deletion.
- Never edit generated files manually.
- Do not commit build output.
- You may inspect Git status and diffs.
- Create branches and commits only when requested.
- Never push or open a pull request without explicit approval.

## Docker and Deployment

Treat Docker and deployment configuration as production-critical.

- Keep changes minimal and documented.
- Verify them locally where practical.
- Ask before changes affecting ports, networking, volumes, persistent data, secrets, or production behavior.
- Never reset, delete, or replace persistent data without explicit approval and a rollback plan.

## Completion Report

At the end of a task, report:

1. What changed.
2. Important decisions or assumptions.
3. Tests and checks executed.
4. What passed or failed.
5. Any remaining risks or follow-up work.

Do not declare a task complete when relevant verification has not been run. State clearly when a check could not be executed.
