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

Public Website

- Home Page
- Services Page
- Tournaments Page
- Portfolio Events (+ detail)
- Portfolio Projects (+ detail)
- Sponsors Section (home page)
- Event Sponsors Section (public event detail page)

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

Current Screen

Sponsors dashboard page displays and manages sponsors successfully.

Public website home page shows the sponsors section.

---

# Next Tasks

1. Players Dashboard Page (backend exists)
2. Team Members Dashboard Page (backend exists)
3. Tournaments Admin Page (registrations/matches)
4. Search + Pagination polish
5. Roles Management
6. Media upload integration (Cloudinary / local uploads)
7. Organization switching

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

Next Commit

Sponsors feature
