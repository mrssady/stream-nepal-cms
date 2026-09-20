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

Players Page (CRUD) - /players

- List: player avatar/name + IGN + slot, team name, game UID, role badge, active/inactive badge, created date
- Create / Edit dialog: team select (grouped by tournament name), full name, IGN, game UID, role (CAPTAIN/PLAYER/SUBSTITUTE/COACH/MANAGER), country, nationality, slot number, profile image upload, active toggle
- Search (name / IGN / UID / team / role) + pagination (10 per page)
- Delete confirmation dialog; duplicates blocked by backend (team + gameUID 409 surfaced in form)
- Teams dropdown loads from /tournament-teams + /tournaments; friendly empty state when no teams exist
- Backend already existed (/players CRUD, OWNER/ADMIN)

Team Members Page (CRUD) - /team-members

- Card grid: profile photo/initial avatar, name + nickname + position, department badge, active/inactive badge, edit/delete actions
- Create / Edit modal: full name, nickname, position (12 options), department (6 options), bio, profile image upload, phone/email, social links (Facebook/Instagram/YouTube/Discord), display order, active toggle
- Search (name / nickname / position / department) + pagination (9 per page)
- Delete confirmation
- Backend already existed (/team CRUD on TeamMember, OWNER/ADMIN)

Tournaments Admin Page (CRUD + Detail) - /dashboard/tournaments

- List: banner or initial avatar, name + slug, game badge, status badge (DRAFT/PUBLISHED/REGISTRATION_OPEN/REGISTRATION_CLOSED/LIVE/COMPLETED/CANCELLED), teams current/max, start date, Manage/Edit/Delete, Create Tournament modal
- Create / Edit modal (TournamentFormModal): name, slug, game, organizer, registration fee, prize pool, max/current teams, featured + isPublic toggles, 4 datetime-local schedule dates (registration open/close, tournament start/end), links (Discord/WhatsApp/Stream/Website), media upload (logo + banner via ImageUpload), description + rules textareas
- Search (name / slug / organizer / game) + pagination (9 per page) via shared SearchBar + Pagination
- Backend already existed (/tournaments CRUD, OWNER/ADMIN); reuse existing services/tournaments.ts + new useTournaments hook

Tournament Detail Page - /dashboard/tournaments/[id]

- Tabs: Overview / Registrations / Matches
- Header: banner, status + game + featured badges, name/slug, description, dates, teams, entry fee, prize pool, stats (registrations / approved / matches)
- Overview tab: schedule, competition (organizer/game/max+current teams/fee/prize), availability (public/featured), rules, external links
- Registrations tab: table (team logo+name+manager, captain email, IGN/UID, registration status, payment status), quick Approve/Reject on PENDING, Add/Edit via RegistrationModal, delete confirm
  - RegistrationModal fields: team name, team logo upload, captain (name/email/phone), manager (name/phone), game UID/IGN, roster size, discord username, registration status, payment status, remarks
- Matches tab: table (title+round, home vs away with scores, match type, scheduledAt, status), Add/Edit via MatchModal, delete confirm
  - MatchModal fields: title, round, match type (BO1/BO3/BO5/CUSTOM), status (SCHEDULED/LIVE/COMPLETED/CANCELLED), scheduledAt datetime-local, home/away team selects (from /tournament-teams), winner select, home/away score, notes
- Data via useRegistrations + useMatches hooks (filtered client-side by tournamentId) + getTournamentTeams from /services/players.ts
- Backend already existed (/registrations, /matches, /tournament-teams CRUD, OWNER/ADMIN)
- Sidebar "Tournaments" entry (Swords icon) added to Content menu; route is /dashboard/tournaments (public site owns /tournaments)

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

✅ OCR Profiles - backend CRUD + default seed + frontend management page (calibration-ready config)

✅ OCR Spectator Layout - PUBG Mobile 1920x1080 ROI config model + scaling + structured ROI editor

✅ OCR Analysis Core - provider interface, ROI preprocessor, detectors, normalization + fuzzy team matching, temporal validation, duplicate protection, confidence tiers, dry-run analyze endpoint (read-only, suggestedOnly events) + 36 unit tests

✅ OCR Monitor + ROI Overlay - dry-run tick-loop monitor (start/stop/status/latest + live socket analysis), mock spectator scene w/ deterministic seeded PRNG, ROI debug overlay endpoint, live analysis panel with ROI readouts, suggested events + review flags (read-only; kill feed ROI ships disabled, minimap CV-only)

✅ OCR Review + Wiring (backend) - in-memory per-match candidate queue from confirmed suggestions, GET /ocr/review + approve/reject endpoints; approve is LIVE+unlocked gated, ZONE_TIMER/ZONE_STARTED only, dedupes per fingerprint and wires via SYSTEM match event (spec 20/21/30) + 10 unit tests

✅ Players Dashboard Page - /players CRUD (list / create / edit / delete, search + pagination, tournament-grouped team select) on top of existing backend

✅ Team Members Dashboard Page - /team-members CRUD (card grid / create / edit / delete, search + pagination) on top of existing backend

✅ Tournaments Admin - /dashboard/tournaments CRUD (list + create/edit modal, search + pagination) + detail page with Overview / Registrations / Matches tabs (registration approve/reject + payment status, match fixtures) on top of existing backend

Public Tournament Detail + Registration - /tournaments/[slug] (frontend + backend)

- Backend: GET /api/public/tournaments/:slug (public detail: tournament + approved
  registrations with team slot/shortName/status + match fixtures with team refs +
  latest live match), POST /api/public/tournaments/:slug/register (public team
  registration: validates tournament exists/isPublic, status not closed, open/close
  window, team limit, duplicate teamName -> ConflictException; creates PENDING/UNPAID
  registration; DTO CreatePublicRegistrationDto with class-validator)
- Frontend: service funcs getPublicTournamentBySlug + submitPublicTournamentRegistration
  in src/services/public.ts (GET + POST via fetch, unwraps {success,...} envelope)
- /tournaments/[slug] page: dark hero (game/featured/status badges, organizer,
  prize pool, entry fee, teams count, external links, banner/logo), Schedule card,
  Tournament Rules, Matches fixture list, Registered Teams card (slot badges)
- Registration form (TournamentRegistrationForm, client): team name, captain
  name/email/phone, game UID/IGN, roster size (1-10), optional manager + discord;
  success confirmation panel; blocked state when not accepting (not open/closed/
  filled/cancelled/completed/draft)

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

OCR Profiles (Phase 3 groundwork - profile management)

- Prisma model: OcrProfile (game / name / width / height / config JSON / isDefault)
  + migration add_ocr_profiles, unique [game, name], index [game], [isDefault]
- Backend CRUD: GET/POST /api/ocr-profiles, GET/PATCH/DELETE /:id, POST /:id/default
  - OWNER/ADMIN manage; MANAGER read-only
  - Auto-first-default on create; transactional set-default per game
  - Guards: unique name per game, cannot delete the last default per game
- Seed: default profiles for PUBG Mobile + Free Fire (1920x1080, resolution /
  rois / preprocessing config stub)
- Frontend: /live/ocr-profiles dashboard page (sidebar + control-panel link):
  - Game filter, cards with resolution + ROI count + default badge
  - Create/edit forms (game, name, width, height, JSON config editor),
    set-default, delete
- Config shape reserved for calibration: { resolution, rois[], preprocessing{} }

OCR Spectator Layout (Phase 3 - PUBG Mobile 1920x1080 ROI foundation)

- Spec: STREAM NEPAL PUBG Mobile spectator OCR layout (reference 1920x1080)
- ocr/ocr-config.ts: typed OcrProfileConfig = { resolution, rois{name}, preprocessing }
  - INITIAL_ROIS template: matchHeader, teamEliminations, observerPlayerList,
    killFeed (disabled), minimap (CV/disabled), zoneInfo, currentTeam, playerStats
  - each ROI: x/y/width/height/enabled/ocr/label/purpose/preprocessing
  - normalizeOcrConfig(): coerces/clamps, merges template, drops malformed
  - scaleRois(): scaleX = width/1920, scaleY = height/1080 (any resolution)
- OcrProfilesService: normalizes config on create/update; getScaledRois(id, target)
- New endpoint: GET /api/ocr-profiles/:id/rois?width=&height= (scaled layout)
- Seed updated to the full spectator ROI layout for PUBG + Free Fire
- Frontend ROI editor: structured table (X/Y/W/H, enabled, OCR, per-ROI
  preprocessing: scale/grayscale/contrast/threshold/denoise) + reset-to-template
  + live config JSON preview; replaces the raw-JSON-only editor
- Kill feed ROI ships disabled per spec until confirmed on real footage
- Minimap is CV-only (not OCR) and ignored for MVP
- Next OCR phases: monitors/panel + real footage calibration (analysis core shipped - see below)

OCR Analysis Core (Phase 4 - pure-logic engine, footage-independent)

- ocr/ocr-types.ts: DetectionKind, RoiReading, OcrDetection, confidence tiers,
  SuggestedEvent (always suggestedOnly), UncertainSignal, FrameAnalysis,
  AnalyzeResult, OcrProvider interface
- ocr/ocr-confidence.ts: tiers >=0.90 HIGH, 0.70-0.89 REVIEW, <0.70 REJECT
- ocr/ocr-normalize.ts: text normalization (0->O, 1->I, 5->S, 8->B, @/@->A/S)
  applied BEFORE stripping non-alphanumerics (so DR$ -> DRS); duration mm:ss
  parser (not whole-string anchored); integer extraction; stable value token
- ocr/ocr-fuzzy.ts: Levenshtein similarity + matchTeamTag (minScore 0.8,
  ambiguity when a 2nd tag within 0.2 -> { ambiguous } for manual review)
- ocr/ocr-preprocessor.ts: prepareRois() -> scaled CropBox + normalized
  PreprocessPipeline per ROI (crop clamped to frame); ocr flag = enabled && ocr
- ocr/ocr-temporal.ts: TemporalTracker - N consecutive identical tokens confirm;
  >= 2N seen without confirmation -> UNCERTAIN (alternating readings)
- ocr/ocr-dedup.ts: fingerprint = roiKey:kind:stableValueJSON + DedupCache window;
  duplicate event protection (same visual event on many frames = one emission)
- ocr/ocr-detectors.ts: per-ROI parsers (matchHeader, teamEliminations,
  observerPlayerList, zoneInfo, currentTeam, playerStats); partial parses
  down-weighted x0.8/0.85/0.9; minimap/unknown -> no detection
- ocr/ocr-event-normalizer.ts: ZONE_INFO -> suggestedOnly ZONE_TIMER event;
  everything else requires human validation (kill feed etc.) -> no suggestion
- ocr/ocr-engine.ts: OcrAnalysisEngine.processFrame(config, provider, frame) ->
  parse -> tier gate -> temporal -> dedup -> FrameAnalysis (frameNumber++
  on each processFrame call); REVIEW-tier confirms also flag a
  REVIEW_CONFIDENCE uncertain signal; AMBIGUOUS_TEAM/ALTERNATING_READINGS too
- ocr/mock-spectator-provider.ts: deterministic (seed) spectator feed simulator
  producing realistic readings for all enabled OCR ROIs. frameIndex advances
  per readFrame -> timestamps spaced 1s apart to exercise temporal/dedup logic
- OcrProfilesService.resolveDefaultForGame(game): default profile id for a game
- DTO analyze-ocr.dto.ts + POST /api/live-matches/:id/ocr/analyze (OWNER/ADMIN/
  MANAGER) - dry-run: loads default or given profile, runs engine for N frames
  (default 5) against the match roster team tags, returns unique confirmed
  detections + uncertain signals + suggestedOnly events. NEVER writes match
  events or scores. Roles: read-only result, suggestedOnly flag on events
- Unit tests: 36 passing across normalize/fuzzy/confidence/temporal/dedup/
  detectors/preprocessor specs (pnpm jest); backend build + eslint clean
- Verified via API: default profile -> 6 confirmed detections (matchHeader,
  teamEliminations, observerPlayerList REVIEW, zoneInfo, currentTeam,
  playerStats) + ZONE_TIMER suggestion (phase 1, 229s); noise mode kept stable

OCR Monitor + ROI Overlay (Phase 5 - frame input, debug, review panel)

- ocr/ocr-monitor-scene.ts: PURE buildMonitorScene(tick, teamTags) - live-scene
  progression for the dry-run; values step every 6 ticks via
  cycle = floor(tick/6) % 24 (remainingPlayers 75-cycle min 10, zoneTimer
  229-cycle*5 min 1s, team/player eliminations cycle patterns, damage
  325+cycle*11, assists min(9,cycle), currentTeamTag rotates fallback['777A'])
  + spec (42 tests total now)
- ocr/ocr-temporal.ts REWRITTEN: sliding window of confirmations*2; CONFIRMED
  when last N identical, UNCERTAIN when window full without a streak (real
  alternation), PENDING otherwise; one-time stat changes (old 0 -> new 1)
  flag UNCERTAIN for review then re-confirm (spec 30); regression test added
- dto/start-ocr-monitor.dto.ts: intervalMs(100-10000, dft 1000), confirmations
  (1-8, dft 3), dedupWindowMs, noise, progress, seed, confidenceBase
- live-match-ocr-monitor.service.ts: per-match monitor session (engine +
  provider + interval), tick() -> scene -> processFrame -> gateway broadcast
  match:ocr:analysis; accumulate counters; stop/status/latest + GET
  /:id/ocr/overlay (width/height or profile resolution, reference
  1920x1080) -> PreparedRoi[] + activeOcr; onModuleDestroy clears intervals
- REST: POST /:id/ocr/monitor/start, POST /:id/ocr/monitor/stop,
  GET /:id/ocr/monitor/status, GET /:id/ocr/monitor/latest,
  GET /:id/ocr/overlay (OWNER/ADMIN/MANAGER; read-only, suggestedOnly)
- Frontend /live/[matchId]/ocr: monitor controls (interval/confirmations/
  progress/noise), status stats, SVG ROI overlay colored by enabled/ocr +
  detection tier, last confirmed readouts per ROI, suggested events list,
  needs-review signals; useLiveMatch now surfaces match:ocr:analysis frames
- Verified via API: monitor 16 frames -> 96 readings, review flags on
  transitions, flat confirmations on stable scene; overlay 1280x720 ->
  activeOcr 6, 8 rois (kill feed + minimap excluded)

OCR Review + Wiring (Phase 6 backend - candidate -> manual review -> event wiring)

- ocr/ocr-review.ts: ReviewCandidate (id/matchId/roiKey/detectionKind/kind/
  payload/confidence/rawText/reason/status/createdAt/decidedAt/
  emittedEventId/fingerprint), WIREABLE_KINDS = {ZONE_TIMER, ZONE_STARTED},
  buildCandidate(matchId, detection) from suggestedOnly events (seconds
  clamped to integer), candidateFingerprint via valueToken (key-order
  stable), hasOpenCandidate blocks dupes (PENDING or APPROVED)
- live-match-ocr-monitor.service.ts: reviews Map<matchId, ReviewCandidate[]>
  (survives monitor stop, capped at 100, oldest decided dropped), enqueue()
  on tick for wireable suggestions; review()/approve()/reject() + status
  counts pending/approved/rejected
- approve(): guarded against double-approve (in-flight set), match must be
  unlocked + status LIVE, ZONE_STARTED phase must be ahead of state.zone.phase
  (no backwards zone progression - spec 30), then eventsService.append as
  SYSTEM event with actor attribution + ocr:true payload; candidate marked
  APPROVED with emittedEventId. reject(): local REJECTED mark
- REST: GET /:id/ocr/review, POST /:id/ocr/review/:candidateId/approve,
  POST /:id/ocr/review/:candidateId/reject (OWNER/ADMIN/MANAGER)
- Unit tests: ocr-review.spec.ts (10 cases) -> 52 total backend tests
- Verified via API: monitor ran 13 frames -> 3 pending ZONE_TIMER candidates;
  approve(219s) wired ZONE_TIMER seq=2 src=SYSTEM conf=0.98 payload
  {ocr:true,phase:1,seconds:219}+actor, dedupe held (one APPROVED per
  fingerprint), reject(224s) stayed local, queue persisted after stop
  (22 pending / 1 approved / 1 rejected)

---

# Next Tasks

1. Roles Management
2. Media upload integration (Cloudinary / local uploads)
3. Organization switching
4. OCR / real video calibration (mock dry-run + profiles + analysis core + monitor/overlay + review panel UI all shipped; blocked on PUBG Mobile observer footage for ROI calibration / kill feed confirmation)

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
- OCR Profiles (backend + seed + frontend) - per-game calibration profile CRUD, Phase 3 OCR grounding
- OCR Spectator Layout (config model + scaling + structured ROI editor) - PUBG Mobile 1920x1080 ROI foundation
- OCR Analysis Core (backend) - provider interface, ROI preprocessor, detectors, normalization + fuzzy team matching, temporal validation, duplicate protection, confidence tiers, dry-run analyze endpoint + 36 unit tests
- OCR Monitor + ROI Overlay (backend + frontend) - dry-run tick-loop monitor (start/stop/status/latest + match:ocr:analysis socket), mock spectator scene, ROI debug overlay endpoint + SVG layout, live analysis panel, /live/[matchId]/ocr route + 42 unit tests
- OCR Review + Wiring (backend) - in-memory candidate queue, approve/reject endpoints, LIVE-gated ZONE_* wiring to SYSTEM match events + 10 unit tests
- OCR Review Panel UI (frontend) - approve/reject pending candidates on /live/[matchId]/ocr wired to backend
- Players Dashboard Page (frontend) - /players CRUD (list / create / edit / delete, search + pagination, tournament-grouped team select)
- Team Members Dashboard Page (frontend) - /team-members CRUD (card grid / create / edit / delete, search + pagination)
- Tournaments Admin (frontend) - /dashboard/tournaments CRUD (list + create/edit modal, search + pagination) + detail page (Overview / Registrations / Matches tabs, quick approve/reject, fixtures) + Sidebar entry
- Public Tournament Detail + Registration (frontend + backend) - GET/POST /api/public/tournaments/:slug endpoints, /tournaments/[slug] public page with fixtures/teams/links + team registration form

Next Commit

Roles Management. Media upload integration (Cloudinary / local uploads) and
organization switching follow. Kill feed ROI confirmation on real footage + real
video OCR calibration remain blocked until PUBG Mobile observer footage is
provided (tesseract/ffmpeg).
