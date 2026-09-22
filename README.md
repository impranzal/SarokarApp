# सरोकार · Sarokar

**E-Consultation Policy Feedback Analyzer** — a BSc CSIT project prototype for
Nepal's e-governance ecosystem.

## The problem this solves

Under the Digital Nepal Framework's e-Consultation push, government
departments are expected to collect public feedback on draft policies. In
practice that feedback arrives as scattered emails, PDFs, and notes from
physical hearings, and nobody reads all of it closely enough to summarize it
for a decision-maker. Sarokar is a working prototype of the alternative:
citizens submit structured feedback, the system auto-categorizes and
sentiment-scores it on arrival, and policy officers get a live dashboard
instead of a stack of unread comments.

## How the architecture reflects e-governance concepts

| Concept | Where it lives in the code |
|---|---|
| **Transparency** | `GET /api/consultations/:id/transparency` + the `Transparency.jsx` page publish an aggregate summary and the department's official response once a consultation closes — the public sees the same numbers the officer dashboard shows, not a curated excerpt. |
| **Citizen participation** | The feedback flow (`FeedbackForm.jsx` → `POST /api/feedback`) is deliberately a 2–3 field form: stance, optional clause, comment. No account gymnastics, no CAPTCHA maze. |
| **Data-driven governance** | `utils/nlp.js` runs every submission through categorization, sentiment scoring and duplicate detection *before* it ever reaches a human — the dashboard aggregates (`dashboardController.js`) are computed straight from that structured data, not from anyone manually tagging comments. |
| **Interoperability-readiness** | The API is a plain REST/JSON service with JWT auth and role-based access, decoupled from any specific frontend — a future integration (SMS gateway, a different department's portal) could consume the same `/api/*` endpoints. |
| **Accountability** | `AuditLog.js` + `utils/auditLog.js` record every publish/close/response action against the officer who took it. |
| **Grievance redressal** | The Grievance Portal (`GrievancePortal.jsx` / `GrievanceQueue.jsx`, `grievanceController.js`) gives citizens a separate channel for administrative complaints distinct from policy feedback, tracked to resolution by the responsible department. |
| **Legal grounding & scope** | The `About.jsx` page states the constitutional and policy basis for the platform (Article 27 right to information; the Digital Nepal Framework's e-Consultation initiative) and is explicit that not every policy is eligible for public consultation. |

## Tech stack

- **Frontend:** React (Vite) + Tailwind CSS, React Router, Recharts, Axios
- **Backend:** Node.js + Express, MongoDB (Mongoose), JWT auth (bcrypt-hashed
  passwords)
- **NLP/analysis:** self-hosted, no paid API required —
  [`sentiment`](https://www.npmjs.com/package/sentiment) for AFINN-style
  scoring, [`compromise`](https://www.npmjs.com/package/compromise) for
  keyword/noun-phrase extraction, a small keyword dictionary for
  categorization, and Jaccard similarity for duplicate/spam detection.

## Project layout

```
sarokar/
├── server/               Express API
│   ├── models/           User, Consultation, Feedback, AuditLog
│   ├── controllers/      auth, users, consultations, feedback, dashboard, export
│   ├── routes/           one router per resource, mounted under /api
│   ├── middleware/       auth (JWT + RBAC), central error handler
│   ├── utils/            nlp.js (the analysis pipeline), jwt.js, auditLog.js
│   ├── seed/seed.js      demo data: 3 policies, 50+ feedback entries
│   └── server.js         app entry point
└── client/               React app
    └── src/
        ├── pages/         Home, Login, Register, ConsultationList/Detail,
        │                  Transparency, OfficerDesk, CreateConsultation, Dashboard
        ├── components/    Navbar, FeedbackForm, Badges, ProtectedRoute
        ├── context/       AuthContext
        └── api/client.js  Axios instance with JWT interceptor
```

## Running it locally

### 1. Backend

```bash
cd server
cp .env.example .env      # then set MONGO_URI and a real JWT_SECRET
npm install
npm run seed               # optional but recommended - populates demo data
npm run dev                # starts on http://localhost:5000
```

You need a MongoDB instance reachable at `MONGO_URI` — either a local
`mongod` or a free MongoDB Atlas cluster.

Demo logins after seeding (password for all: `Password123!`):

- `admin@sarokar.gov.np` — admin
- `officer.finance@sarokar.gov.np` — officer, Ministry of Finance
- `officer.environment@sarokar.gov.np` — officer, Ministry of Environment
- `citizen1@example.com` … `citizen20@example.com` — citizens

### 2. Frontend

```bash
cd client
cp .env.example .env       # points VITE_API_URL at the backend above
npm install
npm run dev                 # starts on http://localhost:5173
```

Open `http://localhost:5173`. Log in as an officer to reach **Officer
Desk → Dashboard**, or browse `/consultations` as a citizen to submit
feedback on the seeded "Small Business Tax Relief" or "Forest and Wetland
Protection" consultations.

## Deployment

The recommended production path is **MongoDB Atlas** for the database,
**Render** for the API container, and **Vercel** for the Vite static build.
Create an Atlas database user and allow the API host's outbound IPs, then set
these Render environment variables from `server/.env.example`:
`NODE_ENV=production`, `MONGO_URI`, a long random `JWT_SECRET`,
`JWT_EXPIRES_IN=7d`, `CLIENT_ORIGIN=https://<your-vercel-domain>`, and
`LOG_LEVEL=info`. Deploy `server/` as a Docker web service using its
`Dockerfile`; Render should use `GET /api/health` as its health check.
Deploy `client/` to Vercel with `VITE_API_URL=https://<your-render-api>/api`.
The client Dockerfile is also available for a container-only environment.

For local or staging containers:

```bash
cp server/.env.example server/.env
# set a real JWT_SECRET in server/.env
docker compose up --build
```

CI runs server tests and client lint/tests/build on every push and pull
request through [.github/workflows/ci.yml](.github/workflows/ci.yml).
The health endpoint returns HTTP 503 until MongoDB is connected, so platform
readiness checks do not send traffic to an unready API. Production errors are
logged as structured JSON and never include stack traces in responses.

Implemented end-to-end: registration/login with expiry handling, role-based
access, consultation CRUD and lifecycle, feedback with self-hosted NLP and
duplicate detection, dashboards with a weighted keyword cloud and PDF/CSV
exports, the admin user-management screen, transparency summaries, audit
logging, request validation, production hardening, automated tests, Docker
configuration, and deployment documentation.
