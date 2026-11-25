# IDS Colleges — Registrar Management System

A standalone Registrar module with a React/Vite frontend and an Express/PostgreSQL API. Its dashboard and navigation follow the visual system used by the IDS Colleges Library Management System: forest-green sidebar, light content canvas, white cards, compact data tables, and the same school logo sourced from the Library repository.

## Features

- Administrator sign-in (JWT; no public administrator registration)
- Dashboard counts and recent student registrations
- Student record management (create, view, update, delete)
- Faculty record management
- Course/program management
- Enrollment history and enrollment-status updates
- Summary reports
- Read-only, service-key-protected student API for the Library module

## Technology

- Frontend: React 18, Vite, React Router, Axios, Lucide icons
- Backend: Node.js, Express, PostgreSQL (`pg`)
- Authentication: bcrypt password hashing and JWT
- Module integration: REST/JSON with a dedicated service key

## Requirements

- Node.js 18 or later
- PostgreSQL 14 or later
- npm

## 1. Database setup

Create a PostgreSQL database named `simple_registrar`:

```sql
CREATE DATABASE simple_registrar;
```

## 2. Configure and start the backend

Open PowerShell in the project root:

```powershell
cd server
Copy-Item .env.example .env
npm install
```

Edit `server/.env` and set:

- `DATABASE_URL` to your PostgreSQL connection string
- `JWT_SECRET` to a long random secret (at least 32 characters)
- `ADMIN_PASSWORD` to a strong administrator password
- `REGISTRAR_SERVICE_KEY` to a separate long random service-to-service key

Then initialize the database, create the administrator, load fictional demo records, and start the API:

```powershell
npm run db:setup
npm run admin:init
npm run db:seed
npm run dev
```

The API listens on `http://localhost:5001`. Health check: `http://localhost:5001/health`.

The seed script inserts 20 fictional students, 10 fictional faculty members, five course programs, and one sample 2026–2027 first-semester enrollment record per student. It does not add real contact details. Existing IDs are not overwritten when the seed is run again.

## 3. Start the frontend

Open a second PowerShell terminal in the project root:

```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). Sign in using the administrator username/email and password configured in `server/.env`.

## 4. Library integration contract

The Library backend should call the Registrar backend. The Library frontend must not call the Registrar API directly.

- Registrar base URL: `http://localhost:5001/api`
- Student list: `GET /registrar/students`
- Student detail: `GET /registrar/students/:studentId`
- Required header: `X-Registrar-Service-Key: <shared service key>`

The integration endpoints return only `studentId`, `fullName`, `department`, `program`, `yearLevel`, `yearBlock`, and `enrollmentStatus`. They do not expose student email, phone number, address, date of birth, guardian information, or other private fields. See `docs/integration.md` for sample requests and response format.

For two laptops on the same network, configure the Library **backend** with the Registrar laptop's LAN IPv4 address and port `5001`; do not use `localhost` across laptops. Use HTTPS URLs and deployment environment variables for hosted environments.

## Important security notes

- Keep `.env` files and service keys out of Git.
- Never put `REGISTRAR_SERVICE_KEY` in frontend code.
- The student integration endpoints are read-only and return a server-side allowlisted projection.
- Registrar owns its database. Other modules must use the API rather than connect directly to the Registrar database.
- Use synthetic records for demos and testing, not real student personal information.
