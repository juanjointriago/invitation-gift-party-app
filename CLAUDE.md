# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (port 5174)
npm run build      # TypeScript compile + Vite production build
npm run preview    # Preview production build locally
npm run lint       # ESLint analysis
```

No test framework is configured — validation is manual/integration only.

## Environment Setup

Copy `.env.example` to `.env` and fill in Firebase config values:
- `VITE_APIKEY`, `VITE_AUTHDOMAIN`, `VITE_PROJECTID`, `VITE_STORAGEBUCKET`, `VITE_MESSAGINGSENDERID`, `VITE_APPID`
- `VITE_COLLECTION_USERS`, `VITE_COLLECTION_PARTIES`, `VITE_COLLECTION_PARTY_ASSISTANCE`

## Architecture Overview

Party/event management SPA where **Hosts** create events with gift registries and custom RSVP questions, and **Guests** RSVP, answer questions, and select gifts in real-time. Three roles: `anfitrion` (host), `administrator`, and guests (authenticated users without a specific role).

### Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 + TypeScript strict mode |
| Build | Vite 7 with manual chunk splitting |
| Routing | React Router v7 (lazy-loaded pages) |
| State | Zustand 5 (stores in `src/stores/`) |
| Forms | React Hook Form + Zod v4 |
| Styling | Tailwind CSS v4 (dark mode via `class` strategy) |
| Backend | Firebase 12 (Auth + Firestore + Storage) |
| Animations | Framer Motion |
| Tables | TanStack Table v8 |

### Data Layer

**Firebase initialization:** `src/db/initialize.ts` — exports `db`, `auth`, `storage`, `googleProvider`.

**Low-level Firestore helpers:** `src/db/fb.helper.ts` — `setItem`, `updateItem`, `deleteItem`, `getItemById`, `getDocsFromCollection`, `getDocsFromCollectionQuery`, and a real-time `onSnapshot` wrapper.

**Services** in `src/services/` wrap the helpers with business logic:
- `party.service.ts` — CRUD + real-time listener for parties
- `auth.service.ts` — email/password, Google OAuth, registration with Firestore profile
- `party-assistance.service.ts` — RSVP records, gift selection, question answers
- `imageUpload.service.ts` — compressed uploads to Firebase Storage

**Firestore collections** (names come from env vars):
- `users` — `uid` as document ID; fields: `email`, `name`, `role`, `isActive`, `createdAt`, `lastLogin`
- `parties` — `party_uuid` (UUID) as document ID; contains nested `giftList[]`, `questions[]`, `themeConfig`
- `partyAssistanceGift` — composite ID `${partyUuid}_${guestUserId}`; stores RSVP answers, selected gift, attendance

### State Management

Zustand stores follow a consistent pattern using `createAsyncAction` from `src/utils/store.utils.ts` to wrap async operations with `loading`/`error` state. All stores use `devtools` middleware; some persist to `localStorage` via `persist`.

Key stores: `auth.store`, `party.store`, `party-gifts.store`, `party-questions.store`, `theme.store`, `notification.store`.

### Routing

Routes are defined in `src/routes/routes.config.tsx` using `React.lazy()` + `<Suspense>`. Role-based access is enforced by `<ProtectedRoute requiredRoles={[...]}>`.

```
/                   → public landing (MainLayout)
/auth/login|register|reset-password  → AuthLayout
/public-invitation  → public invitation viewer (no auth)
/party/:partyUuid   → guest RSVP flow (PartyGuestLayout)
/host/*             → host dashboard (requiredRoles: ['anfitrion'])
/admin/*            → admin panel (requiredRoles: ['administrator'])
```

### Key Patterns

- **UUID public links:** Parties use `party_uuid` (not the Firestore document auto-ID) for shareable URLs. Generated with the `uuid` package at creation time.
- **Real-time sync:** `party.service.ts` exposes `listenPartyByUuid()` that wraps Firestore `onSnapshot`. A `SyncStatusIndicator` component shows connection state.
- **Gift filtering:** Multi-choice RSVP questions can be configured to filter the gift list per guest — logic in `party-assistance.service.ts` and the gifts store.
- **Map integration:** `src/utils/map.utils.ts` generates embedded map links from event location strings.
- **i18n:** `src/i18n/translations.ts` + `useTranslation` hook — currently Spanish primary.
- **Vite manual chunks:** Firebase, forms, framer-motion, TanStack Table, Zustand, and UI icons are each split into their own chunk to optimize loading.
- **Tailwind dark mode:** Toggle stored in `theme.store` and applied as a `class` on `<html>`. Custom purple palette (`#8b5cf6`) defined in `tailwind.config.ts`.

---

## Venue Planner Feature (Plano del Salón)

Hosts can build a drag-and-drop venue map and assign guests to specific seats. Guests can search their name and find their seat visually.

### Data Model (`src/types/venue.types.ts`)

```typescript
VenueLayout  // document ID = partyUuid, stored in Firestore collection `venueLayouts`
  ├── items: VenueItem[]
  │     ├── type: VenueItemType  // 'table-round' | 'table-rect' | 'stage' | 'dance-floor' | 'bar' | 'dj-booth' | 'entrance' | 'exit' | 'decoration'
  │     ├── x, y, rotation, width, height
  │     ├── capacity: number     // 4–12 (round) or 4–20 (rect)
  │     └── seats: VenueSeat[]   // fixed seats with seatNumber 1..capacity
  └── isPublished: boolean       // controls guest visibility
```

### Files

| File | Purpose |
|------|---------|
| `src/types/venue.types.ts` | All types + `PALETTE_ITEMS` + `CANVAS_WIDTH/HEIGHT` + helpers (`getTableRadius`, `getItemColor`) |
| `src/services/venue.service.ts` | Firestore CRUD (`getLayout`, `saveLayout`, `createEmptyLayout`, `updateLayout`, `searchGuest`) |
| `src/stores/venue.store.ts` | Zustand store — editor state, item CRUD, drag, seats |
| `src/components/venue/VenueEditor.tsx` | Host editor: toolbar + palette + canvas + seat modal |
| `src/components/venue/VenueCanvas.tsx` | Drag-and-drop canvas using Pointer Events API (works on mouse + touch). Scale-aware. |
| `src/components/venue/RoundTableItem.tsx` | Round table with seats at trigonometric positions around perimeter |
| `src/components/venue/RectTableItem.tsx` | Rectangular table with seats on top/bottom edges |
| `src/components/venue/VenueCanvasItem.tsx` | Non-table items (stage, bar, etc.) |
| `src/components/venue/VenueItemPalette.tsx` | Sidebar palette — click to add item to canvas center |
| `src/components/venue/SeatAssignmentModal.tsx` | Assign guest names to seats; capacity control (4–12/20); auto-assign from confirmed attendees |
| `src/components/venue/VenueViewer.tsx` | Read-only viewer for guests with highlight and print button |
| `src/pages/host/VenueEditorPage.tsx` | Route wrapper for host editor, loads confirmed guests |
| `src/pages/party/SeatingPage.tsx` | Guest search page: type name → see highlighted seat on map |

### Routes

```
/host/party/:partyUuid/venue     → VenueEditorPage (requiredRoles: anfitrion)
/party/:partyUuid/seating        → SeatingPage (public, only shows if isPublished=true)
```

### Canvas Drag Implementation

Uses `onPointerDown` with `setPointerCapture` on each item div — works for both mouse and touch (`touchAction: 'none'` required). Scale factor (`containerWidth / 1200`) is applied when computing drag deltas so drag feels natural at any zoom level. Grid snapping: 10px.

### Seat Positioning (Round Tables)

```typescript
angle = (2 * PI * seatIndex / capacity) - PI/2  // start from top
x = center + cos(angle) * orbitRadius
y = center + sin(angle) * orbitRadius
```

### Environment Variable

Add `VITE_COLLECTION_VENUES=venueLayouts` to `.env` (defaults to `'venueLayouts'` if omitted).
