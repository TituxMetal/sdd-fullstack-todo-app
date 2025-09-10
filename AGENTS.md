# AGENTS.md

## Build/Lint/Test Commands

**Root commands:**

- `yarn dev` - Start all apps (API:3000, Web:4321)
- `yarn build` - Build all workspaces
- `yarn test` - Run all tests
- `yarn lint` - Lint with auto-fix
- `yarn typecheck` - Type check all TypeScript

**Single test commands:**

- API: `yarn workspace @app/api test -- <file>` or `yarn workspace @app/api test:watch -- <file>`
- Web: `yarn workspace @app/web test -- <file>` or `yarn workspace @app/web test:watch -- <file>`

## Code Style Guidelines

**Imports:** Group by [builtin, external, internal, parent, sibling], alphabetize, separate type
imports **Formatting:** Single quotes, no semicolons, 2-space tabs, 100-char width, trailing comma
none **Naming:** PascalCase for classes/types, camelCase for variables/functions, kebab-case for
files **Types:** Strict TypeScript, prefer type imports, use interfaces for contracts **Error
handling:** Custom exceptions in domain layer, descriptive error messages **Architecture:** Clean
Architecture (domain → application → infrastructure layers)
