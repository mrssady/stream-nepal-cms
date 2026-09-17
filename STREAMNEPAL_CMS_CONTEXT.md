# Stream Nepal CMS Context

## Project Overview

Stream Nepal CMS is a professional Esports Tournament & Company Management System.

The project follows a Monorepo structure.

Package Manager:
- pnpm

Frontend:
- Next.js 16
- TypeScript
- TailwindCSS
- Axios
- React Hooks

Backend:
- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Role Based Authorization

---

# Working Rules

These rules must always be followed.

1. Always provide FULL replacement files.
2. Never provide partial code snippets.
3. Never say "add this" or "update this".
4. One step at a time.
5. Wait until I reply "Done".
6. Keep explanations very short.
7. Never change project architecture unless requested.

---

# Folder Structure

Root

- frontend
- backend

Frontend

src/
- app
- components
- hooks
- lib
- services
- store
- types
- utils

Backend

src/
- modules
- common
- prisma
- config

---

# Authentication

Completed

- JWT Login
- Protected API
- Axios Instance
- Token Storage
- Authorization Header
- Login Page

---

# Backend Completed

Authentication Module

- Login
- JWT Strategy
- JWT Guard
- Forgot Password (email reset link)
- Reset Password (expiring one-time token)
- Verify Email (expiring one-time token)
- Resend Verification
- Mail Module (SMTP / console fallback)

Users Module

- Create User
- Get Users
- Get User
- Update User
- Delete User

Role Guard

- OWNER
- ADMIN

Prisma Connected

Services Module

- CRUD
- Public API

Projects Module

- CRUD
- Public API

Events Module

- CRUD
- Event Photos
- Event Videos
- Event Timeline
- Public API

Event Series Module

- CRUD

Tournaments Module

- CRUD
- Public API
- Registrations
- Tournament Teams
- Matches
- Players

Media / Gallery Module

- CRUD

Team Members Module

- CRUD

Website Settings Module

- CRUD
- Public API

Sponsors Module

- CRUD
- Public API
- Tiers (TITLE / GOLD / SILVER / BRONZE / MEDIA_PARTNER / PARTNER)

Event Sponsors

- Link sponsors to events (event-scoped tier / featured / order)
- API: events/:eventId/sponsors
- Included in public event API

Live Match Engine (Phase 1 - Manual Scoring)

- Prisma models: LiveMatch, MatchEvent, ScoringRule
- Enums: LiveMatchStatus, MatchEventKind, MatchEventSource
- Team.shortName / Team.slotNumber / Player.slotNumber / Tournament.scoringRuleId
- Seeded default ScoringRules: PUBG Mobile Standard, Free Fire Standard
- Deterministic event-sourced scoring engine (replayable, no hidden state)
  - MATCH_READY roster, kills, eliminations, placements, winner, corrections, undo, lock/reopen
  - Auto team-slot roster from approved tournament registrations (POST /ready)
  - Placement auto-assigned by elimination order (PUBG-style), winner = 1st
  - Scoreboard: points desc, kills desc, placement asc
  - Duplicate kill fingerprint `${killerId}:${victimId}:${matchId}` (unique constraint)
  - In-memory state cache rebuilt from DB; per-match serialized appends
- Socket.IO gateway (namespace /live, room live:{matchId})
  - Instant `match:event` push + ~100ms debounced `match:state` push
  - `subscribe`/`unsubscribe` events with `match:init` snapshot
- Public (no-auth) endpoints for OBS overlay: GET /live-matches/:id/snapshot, /events
- Admin endpoints protected: CRUD = OWNER/ADMIN; control = OWNER/ADMIN/MANAGER
  - POST /live-matches, GET /live-matches?tournamentId=, GET/PATCH/DELETE /live-matches/:id
  - POST /live-matches/:id/{events,ready,undo,lock,reopen}, GET /:id/state

Live Match Engine Zone System (Phase 2 - broadcast prep)

- ScoringRule.zoneCount (default 8; seeded PUBG Mobile = 8, Free Fire = 6)
- Generated + applied migration add_zone_phase_events
- New MatchEventKind values: ZONE_STARTED (payload phase), ZONE_TIMER (payload seconds, optional phase)
- MatchState.zone = { phase, startedAt, timerSeconds, timerSetAt } + MatchState.zoneCount (from rule)
- Replay-safe: zone handled in pure computeState switch (UNDO naturally reverts it)
- Validation: phase int 1..zoneCount (rule-derived), seconds int 0..600
- Real-time `match:event` records now carry optional `derived` context for the client:
  - TEAM_ELIMINATED / PLACEMENT_SET / PLACEMENT_CONFIRMED / WINNER_DECLARED /
    MANUAL_CORRECTION -> { teamId, teamName, shortName, placement, placementPoints, isWinner }
  - PLAYER_KILLED -> { killerTeamId, victimTeamId, killerTeamShort, victimTeamShort }
- Derived is computed from the recomputed state at emit time only; stored payload is
  untouched so scoring stays deterministic on replay
- Public snapshot rule payload now includes zoneCount

---

# Frontend Completed

Dashboard

Users Page

Users Table

Users Service

Users Hook

DataTable Component

PageHeader Component

EmptyState Component

API Service

Authentication Service

Services Page (CRUD)

Projects Page (CRUD)

Events Page (CRUD + Detail)

- Event Detail tabs: Overview / Photos / Videos / Timeline / Sponsors
- Event Sponsors tab links existing sponsors to the event with a per-event tier

Event Series Page (CRUD)

Gallery Page (CRUD)

Settings Page (CRUD)

Sponsors Page (CRUD)

Sponsors Service

Sponsors Hook

Search + Pagination polish

- Shared SearchBar component (search icon, consistent styling)
- Shared Pagination component (results summary, ellipsis window)
- Search + pagination on all dashboard pages (Events, Users, Services, Sponsors, Gallery, Event Series, Projects)

Public Website

- Home Page
- Services Page
- Tournaments Page
- Portfolio Events (+ detail)
- Portfolio Projects (+ detail)
- Sponsors Section (home page)
- Event Sponsors Section (public event detail page)

Live Match Frontend (Phase 1)

- Live Matches Control Center (/live): list, status badges, create match, overlay URL copy
- Live Match Control Panel (/live/[matchId]): scoreboard, manual kill input, placement / eliminate /
  winner actions, manual kill correction, start / pause / resume / finish / cancel, lock / reopen,
  undo last event, kill feed, event log, socket connection indicator
- OBS Overlay (/live/overlay/[matchId]): public, chrome-free, live scoreboard + kill feed, LIVE badge
- Realtime via useLiveMatch hook + socket.io-client singleton (namespace /live)
- Sidebar "Live" entry added

Live Match Broadcast GFX (Phase 2 - frontend)

- Control panel (/live/[matchId]) "Zone / Broadcast GFX" section:
  - Current zone phase badge + per-phase buttons (1..zoneCount), "Next zone" shortcut
  - Zone timer presets (1:00 / 1:30 / 2:00 / 3:00 / 5:00) + custom seconds -> ZONE_TIMER
  - OBS overlay URL copy buttons + URL preview
- GFX overlays under /live/overlay/gfx/[matchId]/gfx/<name> (public, socket driven):
  - elimination - animated "TEAM ELIMINATED" card with shortName/team + ordinal placement +
    points, auto-dismiss ~6.5s (triggers: TEAM_ELIMINATED / PLACEMENT_SET / PLACEMENT_CONFIRMED)
  - winner - full-screen gold "BOOYAH! Winner" card, auto-dismiss ~12s (WINNER_DECLARED)
  - killfeed - slide-in kill rows with team short codes, auto-expire rows (PLAYER_KILLED / state)
  - zone - phase pips, big zone number + /zoneCount, live ticking countdown derived from
    ZONE_TIMER setAt anchor, "New zone" flash on ZONE_STARTED
  - preview - /live/overlay/gfx/preview: standalone demo to verify all animations in OBS
    without a live match (replays elimination, winner, kills, zone flash + countdown)
- Shared gfx.css keyframes (swipe-up / pop-in / slide-in-left / count flash / pulse ring) in
  a scoped layout (live/overlay/gfx/layout.tsx); shared components in src/components/live/gfx/
  (EliminationCard, WinnerCard, KillFeed, ZoneTimer, ZoneStartedFlash, useGfxMatch)

---

# Current Status

Working

✅ Login

✅ Forgot / Reset Password

✅ Email Verification (verify / resend)

✅ Dashboard

✅ Users API

✅ Users Listing

✅ Services CRUD

✅ Projects CRUD

✅ Events CRUD + Showcase

✅ Event Series CRUD

✅ Gallery CRUD

✅ Settings CRUD

✅ Sponsors CRUD + Public Display

✅ Public Website + Portfolio

✅ Search + Pagination polish (all dashboard pages)

✅ Live Match Engine (backend) - manual scoring, event sourcing, Socket.IO realtime, public snapshot

✅ Live Match Frontend - control center, control panel, OBS overlay, realtime hook

✅ Live Match Zone Engine (backend) - zone phases + timers, enriched realtime records, migration + seed

✅ Live Match Broadcast GFX (frontend) - panel zone controls + elimination/winner/killfeed/zone overlays + preview

✅ Live Match Zone OCR (backend + panel) - mock dry-run detector, OCR start/stop/status, auto ZONE_* emission

Current Screen

Phase 2 (broadcast) is feature-complete for the manual + GFX + OCR-dry-run flow:
Zone events (ZONE_STARTED / ZONE_TIMER) drive MatchState.zone + zoneCount via the
replay-safe engine, real-time records carry a `derived` context block (team names,
placements, kill team shorts), and the control panel now has zone phase/timer
controls with one-click GFX overlay URLs for OBS. Four animated overlays
(elimination, winner, killfeed, zone) plus a /gfx/preview playground are live.
Zone APIs + all GFX routes verified. Free Fire zoneCount = 6, PUBG = 8.
The OCR pipeline ships with a MOCK detector (dry-run) that simulates a HUD
countdown, debounces noisy readings, detects zone resets and emits SYSTEM
ZONE_STARTED / ZONE_TIMER events; panel has Start/Stop + live status. Video OCR
(real footage) is stubbed and returns 400 until an observer clip is provided to
calibrate ROI + install OCR deps. Next: player death overlay / point-pop extras.

---

# Next Tasks

1. Players Dashboard Page (backend exists)
2. Team Members Dashboard Page (backend exists)
3. Tournaments Admin Page (registrations/matches)
4. Roles Management
5. Media upload integration (Cloudinary / local uploads)
6. Organization switching
7. OCR / auto-capture pipeline (mock dry-run shipped; real footage calibration pending)

---

# Important Notes

Backend API

http://localhost:3001/api

Frontend

http://localhost:3000

Authentication

Bearer JWT

Package Manager

pnpm

Database

PostgreSQL

ORM

Prisma

---

# Git Workflow

After every completed feature

1. Test
2. Commit
3. Push
4. Update this document

---

# Current Git Milestone

Completed

- Authentication
- Users Listing
- Core CRUD Modules
- Public Website + Portfolio
- Sponsors CRUD + Public Display
- Route Cleanup
- Search + Pagination polish
- Live Match Engine (backend) - Phase 1
- Live Match Frontend (control center + control panel + OBS overlay) - Phase 1
- Live Match Zone Engine (backend) - zone phases/timers + enriched realtime, Phase 2 backend
- Live Match Broadcast GFX (frontend) - panel zone controls + animations + preview, Phase 2 frontend
- Live Match Zone OCR (backend + panel) - mock dry-run detector + panel controls, Phase 3 OCR scaffolding

Next Commit

Real video OCR calibration once observer footage is provided (ROI + tesseract/ffmpeg);
optional GFX extras (player death overlay, point pops)
