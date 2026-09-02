# Berkeley Network

Berkeley Network is a private personal networking tracker for remembering the people, places, and conversation context that make thoughtful follow-ups easier. It is a responsive Next.js application backed by Neon Managed Better Auth, the Neon Data API, and PostgreSQL row-level security (RLS), so every signed-in user can access only their own contacts.

> **Live application:** Deployment URL will be added after the Neon project and Vercel production deployment are connected.

## Product walkthrough

1. Create an account or sign in with email and password.
2. Add a contact with their name, company, role, where you met, notes, and priority.
3. Search across contact details, filter by priority, or sort by name, priority, created date, or last update.
4. Edit or delete a contact. Data remains available after a refresh because Neon Postgres is the source of truth.
5. Sign out to end the authenticated session.

The desktop layout uses a sortable table; smaller screens receive touch-friendly contact cards and the same filtering and CRUD controls.

### Responsive preview

| Desktop | Mobile |
| --- | --- |
| ![Desktop networking tracker preview](docs/screenshots/setup-preview-desktop.png) | ![Mobile networking tracker preview](docs/screenshots/setup-preview-mobile.png) |

## Features

- Email/password sign-up, sign-in, session restoration, and sign-out through Neon Managed Better Auth
- Private per-user contact records protected by four explicit RLS policies
- Create, view, edit, and delete contacts
- Search name, company, role, meeting context, and notes
- Filter by high, medium, or low priority
- Sort by recent update, newest created, name, or priority
- Client-side and database-level validation with understandable errors
- Loading, empty, no-results, success, error, and delete-confirmation states
- Responsive desktop table and mobile card layouts

## Technology stack

| Layer | Technology | Why it is used |
| --- | --- | --- |
| Frontend | Next.js 16, React 19, TypeScript | Vercel-native application structure with strict types and accessible React UI |
| Design system | Tailwind CSS 4, shadcn/ui, Base UI, Lucide | Consistent, responsive, keyboard-accessible controls without a custom component framework |
| Forms | React Hook Form and Zod | Immediate, field-level feedback from one reusable contact schema |
| Data state | TanStack Query | Loading, caching, mutation state, retries, and refresh after writes |
| Table | TanStack Table | Search, filtering, and deterministic sorting |
| Auth and data | `@neondatabase/neon-js` | One typed client for Managed Better Auth and authenticated Data API requests |
| Database | Neon Postgres | Durable contact storage, constraints, and ownership enforcement |
| Tests | Vitest and an authenticated integration script | Fast validation coverage plus two-account RLS proof |
| Hosting | Vercel | Required deployment target and native Next.js hosting |

## Architecture and request flow

```mermaid
flowchart LR
  Browser[Next.js browser UI] -->|Sign up / sign in| Auth[Neon Managed Better Auth]
  Auth -->|JWT session| SDK[@neondatabase/neon-js]
  Browser --> SDK
  SDK -->|HTTPS + bearer token| API[Neon Data API]
  API -->|Authenticated role| DB[(Neon Postgres)]
  DB --> Constraints[CHECK constraints]
  DB --> RLS[Per-user RLS policies]
```

The browser receives only two public HTTPS endpoints. `@neondatabase/neon-js` attaches the signed-in user's token to Data API calls. The Data API supplies `auth.user_id()` to Postgres, and RLS compares that value with each row's `user_id`. The deployed application does not need or receive a PostgreSQL connection string.

## Local setup

Prerequisites:

- Node.js 20.19 or newer (Node.js 22 LTS recommended)
- npm
- A Neon project with Managed Better Auth and the Data API enabled

```bash
git clone https://github.com/patronofalltrades/Personal-Networking-Trakcer-AgenticAI-Course.git
cd Personal-Networking-Trakcer-AgenticAI-Course
npm install
cp .env.example .env.local
```

Fill in the two public Neon endpoint values, apply [`database/migrations/001_create_contacts.sql`](database/migrations/001_create_contacts.sql) using the Neon SQL Editor or a trusted migration connection, then start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_NEON_AUTH_URL` | Public | Neon Managed Better Auth HTTPS endpoint |
| `NEXT_PUBLIC_NEON_DATA_API_URL` | Public | Neon Data API `/rest/v1` HTTPS endpoint |
| `NEXT_PUBLIC_APP_URL` | Public | Canonical application URL for social metadata |
| `DATABASE_URL` | Local administration only | Optional trusted connection for schema tools; never expose or add to Vercel |
| `TEST_USER_A_EMAIL` / `TEST_USER_A_PASSWORD` | Local test only | First dedicated RLS test account |
| `TEST_USER_B_EMAIL` / `TEST_USER_B_PASSWORD` | Local test only | Second dedicated RLS test account |

Real values belong in `.env.local`, which is ignored by Git. `.env.example` contains placeholders only.

## Database schema

The complete, repeatable schema lives in [`database/migrations/001_create_contacts.sql`](database/migrations/001_create_contacts.sql).

| Column | Type | Rules |
| --- | --- | --- |
| `id` | `uuid` | Primary key; generated with `gen_random_uuid()` |
| `user_id` | `text` | Required; defaults to `auth.user_id()` |
| `name` | `text` | Required; trimmed value cannot be empty; maximum 120 characters |
| `company` | `text` | Optional; maximum 160 characters |
| `role` | `text` | Optional; maximum 160 characters |
| `where_met` | `text` | Optional; maximum 240 characters |
| `notes` | `text` | Optional; maximum 2,000 characters |
| `priority` | `text` | Required; only `high`, `medium`, or `low`; defaults to `medium` |
| `created_at` | `timestamptz` | Required; defaults to the current time |
| `updated_at` | `timestamptz` | Required; maintained by a database trigger |

An index on `(user_id, updated_at desc)` supports the default per-user list order.

## Authentication and row-level security

RLS is enabled on `public.contacts`, anonymous access is revoked, and the authenticated role receives only table-level CRUD grants. Four separate policies enforce ownership:

- `SELECT`: `auth.user_id() = user_id`
- `INSERT`: `WITH CHECK (auth.user_id() = user_id)`
- `UPDATE`: both `USING` and `WITH CHECK` require the signed-in user, preventing ownership transfer
- `DELETE`: `auth.user_id() = user_id`

Application inserts omit `user_id` so the database assigns the authenticated identity. Application updates never accept or send `user_id`. Even a hand-written browser request remains subject to the same constraints and RLS policies.

## Testing

Run the local checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The unit suite verifies valid contact normalization, whitespace-only name rejection, invalid priority rejection, and optional-text normalization.

Current unit output:

```text
Test Files  1 passed (1)
Tests       4 passed (4)
```

### Two-account security test

Create two dedicated accounts through the application, add their uncommitted credentials to `.env.local`, and run:

```bash
npm run test:integration
```

The script has User A create a unique contact and verifies that User B receives no row when attempting to read, update, or delete it. User A then confirms that the record is unchanged. The same test sends a blank name and invalid priority directly through the Data API and confirms that PostgreSQL rejects both before cleaning up its fixture.

## Deployment

1. Push the repository to GitHub and import it into Vercel as a Next.js project.
2. In Vercel, add `NEXT_PUBLIC_NEON_AUTH_URL`, `NEXT_PUBLIC_NEON_DATA_API_URL`, and `NEXT_PUBLIC_APP_URL` for Preview and Production.
3. Do **not** add `DATABASE_URL` or test-account credentials to the Vercel project.
4. Deploy, then add the production Vercel origin to Neon Auth's trusted origins.
5. Open the production URL in a private window and verify authentication, CRUD, refresh persistence, filters, sorting, invalid input, and sign-out.
6. Run the two-account integration test against the production endpoints.

## Grading evidence

| Requirement | Evidence |
| --- | --- |
| Automated validation | Four passing Vitest tests; command and output above |
| Sign-in and sign-out | Production screenshot/recording will be added after Neon and Vercel are connected |
| Create, edit, delete, and refresh | Production walkthrough screenshot/recording will be added after deployment |
| Invalid input fails safely | Zod tests plus database constraint integration test; production screenshot pending |
| Two-user isolation | `npm run test:integration`; production output pending account provisioning |
| Schema and ownership | Migration and RLS explanation above |
| No committed secrets | `.gitignore`, placeholder-only `.env.example`, and final tracked-file/history scan |

## Known limitations and next improvements

- The MVP supports email/password authentication only.
- Search and sorting run in the browser over the signed-in user's returned rows; pagination would be the next step for very large networks.
- Contact reminders, calendar integration, import/export, sharing, teams, and AI features are intentionally outside the assignment scope.
- A future version could add last-contacted and next-follow-up dates while keeping the same ownership policy.
