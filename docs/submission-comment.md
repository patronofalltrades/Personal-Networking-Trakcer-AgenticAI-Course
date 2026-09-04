Berkonnect is my submission for Assignment 1: Secure Networking Tracker.

Public GitHub repository:
https://github.com/patronofalltrades/Personal-Networking-Trakcer-AgenticAI-Course

Live application — Berkonnect on Vercel:
https://personal-networking-tracker-hanif.vercel.app

The application uses Next.js, Neon Managed Better Auth, the Neon Data API, and Neon Postgres. It supports sign-up, sign-in, sign-out, contact creation, viewing, editing, deletion, sorting, filtering, and persistent storage.

PostgreSQL row-level security limits each contact to its owner. A production test with two QA accounts confirmed that one account cannot read, update, or delete the other account's contact. PostgreSQL also rejects blank names and invalid priority values.

The repository includes eight passing automated tests. The README contains setup instructions, architecture, the complete database schema, the RLS explanation, test commands, deployment instructions, known limitations, and the required grading evidence.
