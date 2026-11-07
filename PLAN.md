# Manara Rihla: build plan

Stack: Vite + React + Tailwind + React Router + react-leaflet + framer-motion. No backend: localStorage + `storage` event.
Visual spec and mockup: open `plan.html`.

## Shared contract (frozen after feat/foundation)
- `src/store.js`: `getState`, `subscribe`, `reset`; actions `signUp login logout checkIn connect sendMessage createEvent inviteCoHost linkCampuses logActivity`; selectors `visibleUsers(viewer)` (only place gender filter lives), `sameGender`, `levelOf`, `strength`.
- `src/data/seed.js`: 25 campuses, 6 linked pairs, 20 students (10 brothers/10 sisters), 4 leaders, 1 admin, 12 events.
- `src/theme.css`, `src/lib/motion.js`.
- Need a change to shared files? Small PR to `main`, both rebase.

## Branches (each owns its own files)
| # | Branch | Owner | Files | After |
|---|--------|-------|-------|-------|
| 0 | `feat/foundation` | You | scaffold, store, seed, route shells, Navbar, GenderPill, theme | none (blocks all) |
| 1 | `feat/landing-signup` | Partner | `pages/Landing.jsx`, `pages/Signup.jsx`, `components/landing/*` | 0 |
| 2 | `feat/student-passport` | You | `pages/Student.jsx`, `Passport`, `ProfileCard`, `EventsTab`, `LevelUpModal` | 0 |
| 3 | `feat/admin-map` | Partner | `pages/Admin.jsx`, `NetworkMap`, `StatsCards`, `ActivityFeed` | 0 |
| 4 | `feat/connect-chat` | You | `ConnectList`, `Chat` | 2 |
| 5 | `feat/campus-events` | Partner | `pages/Campus.jsx`, `EventForm`, `CoHostInvite` | 1 or 3 |
| 6 | polish/demo | Both | transitions, mobile, rehearsal | all |

Merge order: foundation → landing-signup + student-passport + admin-map → connect-chat → campus-events → polish.

## Git
```bash
git checkout main && git pull
git checkout -b feat/<name>
git fetch && git rebase origin/main   # before every PR
```

## Cut order if behind
group chats → suggestions → co-host invite flow → certificates. Never cut: passport, gender separation, live map.

## Time (3:15 build → 7:15 freeze)
Judge office hours 4:00–5:30; Maghrib break 5:15. Timeline bars in `plan.html`.
