# SalesPulse

A real-time Sales CRM dashboard for managing deals, contacts, and team performance. Built with the MERN stack and WebSockets for live updates.

**Live Demo:** [salespulse-crm-tau.vercel.app](https://salespulse-crm-tau.vercel.app)

**Demo Credentials:** `admin@salespulse.com` / `password123`

## Features

- **Sales Pipeline** - Drag-and-drop Kanban board with 6 stages (Lead, Qualified, Proposal, Negotiation, Won, Lost)
- **Live Dashboard** - Revenue over time, deals by stage, win rate, team leaderboard, all updating in real-time via WebSocket
- **JWT Auth** - Access + refresh token rotation, auto-refresh on expiry, secure logout
- **Contacts Management** - Add, search, and manage contacts with company and notes
- **Team Admin** - Admin can add/remove sales team members with role-based access
- **Real-Time Activity Feed** - Deal changes broadcast instantly to all connected users via Socket.io
- **Mobile Responsive** - Hamburger sidebar, swipeable pipeline, stacked forms on mobile
- **Rate Limiting** - API endpoints protected against abuse

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Charts | Recharts |
| Drag & Drop | @hello-pangea/dnd |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Real-Time | Socket.io |
| Auth | JWT (access + refresh token rotation) |
| Deployment | Vercel (frontend) + Render (backend) |

## Architecture

```
server/
  config/         # MongoDB connection
  middleware/     # JWT auth, validation, rate limiting
  models/         # User, Deal, Contact, Activity schemas
  routes/         # REST API endpoints
  sockets/        # Socket.io event handlers
  seeds/          # Database seed script
  server.js       # Express + Socket.io entry point

client/
  src/
    components/   # Layout (sidebar, mobile header)
    context/      # Auth context with token management
    hooks/        # useSocket custom hook
    pages/        # Dashboard, Pipeline, Contacts, Team, Login
    services/     # Axios API layer with auto-refresh
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in, returns tokens |
| POST | `/api/auth/refresh` | Rotate refresh token |
| GET | `/api/deals` | List deals (filterable by stage) |
| GET | `/api/deals/stats` | Pipeline stats + win rate |
| GET | `/api/deals/revenue-over-time` | Monthly revenue data |
| GET | `/api/deals/leaderboard` | Top performers by revenue |
| POST | `/api/deals` | Create deal |
| PUT | `/api/deals/:id` | Update deal (triggers WebSocket) |
| DELETE | `/api/deals/:id` | Delete deal |
| GET | `/api/contacts` | List contacts (searchable) |
| POST | `/api/contacts` | Add contact |
| GET | `/api/activities` | Recent activity feed |
| GET | `/api/users` | List team members |
| POST | `/api/users` | Admin: add team member |

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Server
```bash
cd server
cp .env.example .env    # Edit with your MongoDB URI and secrets
npm install
npm run seed            # Populate with demo data
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`

## WebSocket Events

| Event | Direction | Description |
|---|---|---|
| `deal:created` | Server -> Client | New deal added |
| `deal:updated` | Server -> Client | Deal stage or details changed |
| `deal:deleted` | Server -> Client | Deal removed |
| `activity:new` | Server -> Client | New activity logged |

## Screenshots

<!-- Add screenshots after deployment -->
| Dashboard | Pipeline | Mobile |
|---|---|---|
| ![Dashboard](screenshots/dashboard.png) | ![Pipeline](screenshots/pipeline.png) | ![Mobile](screenshots/mobile.png) |

## License

MIT
