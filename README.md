# Stream Nepal CMS

Professional Content Management System for Stream Nepal.

## Tech Stack

- Frontend: Next.js 16 (Turbopack)
- Backend: NestJS 11 (API at http://localhost:3001/api)
- Database: PostgreSQL
- ORM: Prisma
- Realtime: Socket.IO (namespace `/live`)

## Status

✅ Project initialized
✅ Frontend setup
✅ Backend setup
✅ Database integration
✅ Live Match Engine + Broadcast GFX + Zone OCR (dry-run)
✅ OCR pipeline: profiles + ROI editor + analysis core + monitor/ROI overlay + review/wiring (spec phases 1-4)
✅ Players Dashboard: /players CRUD (list / create / edit / delete, search + pagination, tournament-grouped team select)

## Continuation Notes — READ THIS FIRST

Full working context lives in **`STREAMNEPAL_CMS_CONTEXT.md`** (repo root). Read it
before continuing, it keeps the current screen, phase status, next tasks, git
milestone, verified data, and working rules.

Where the OCR pipeline stands:

- Shipped (phases 1-4, all on `main`): ROI config + editor (`/live/ocr-profiles`),
  analysis core (detectors/temporal/confidence/fuzzy/dedup, dry-run
  `POST /:id/ocr/analyze`), frame monitor + ROI overlay + live analysis panel
  (`/live/[matchId]/ocr`), in-memory manual review queue with approve→live
  `SYSTEM` event wiring (`GET /:id/ocr/review` + approve/reject).
- Everything match-side is READ-ONLY by design (`suggestedOnly`). Approve only
  wires `ZONE_TIMER` / `ZONE_STARTED`, requires the match to be LIVE + unlocked.
- **Blocked next**: real video OCR calibration (tesseract/ffmpeg) and kill feed
  ROI confirmation once PUBG Mobile observer footage is provided. VIDEO mode is
  stubbed and returns 400 until then.

Fast leads:

- Backend dev: `backend/` on `pnpm dev` (port 3001); frontend: `frontend/` on
  port 3000. Frontend uses `FRONTEND_API_ORIGIN`/API at `http://localhost:3001/api`.
- Verify backend: `pnpm jest --silent` (52 tests), `pnpm build`;
  verify frontend: `npx tsc --noEmit`, `npm run build`.
- Lint: run TARGETED eslint on changed files only,
  `backend/src/modules/live-matches/**/*.ts` / changed frontend files. Repo-wide
  `pnpm lint` is baseline-failing (pre-existing) and its `--fix` auto-formats
  unrelated files — revert non-OCR side effects before committing.
- Session seed: OWNER account `sadab@example.com` / `12345678`; default PUBG OCR
  profile `ocr_pubg_default`; demo match used for verification
  `cmu5eo9or0003ecokdulc6sm0` (tournament `cmu5enzcp0000ecokus3rh8q5`).
- Demo env has no registered teams → `teamTags` empty → fuzzy team matching
  skipped, mock falls back to tag `777A`.