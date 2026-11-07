# Manara Rihla: goals, features, and full spec

Built for the MTC × Replit × Manara West Buildathon at UCSD (Fri Nov 6, Triton Arena).
Build split and branches: [PLAN.md](PLAN.md). Visual plan and mockup: `plan.html`.

## The idea

Manara Rihla is a passport and professional network for Muslim students across Manara West's 65 campuses. Rihla (رحلة) is the Islamic tradition of traveling to seek knowledge. Every student gets a Rihla Passport that works like a LinkedIn profile: your journey, badges, and progress are your profile, and you use it to connect and chat with other Muslim students, mentors, and MSA leaders across campuses. The network has separate spaces for brothers and sisters, so there is no free mixing. MSAs can co-host events across campuses, and Manara admins get a live map they can use to link MSAs together.

> "Your Rihla Passport is your journey, your profile, and your network: built for Muslim students, connecting all 65 campuses, with Islamic values built in."

## Hackathon context

- Tracks: **Track 1 Bridging Campuses (The Manara Network)** and **Track 2 Deen & Dunya (Reimagining the Muslim Student Experience)**. Rihla targets both.
- Rule: consult at least two judges and show how their feedback shaped the prototype.
- Judge feedback we built in: **"No free mixing."** Separate brothers/sisters spaces are in every feature.
- Schedule: check-in 2:30, building 3:15, judge office hours 4:00–5:30, Maghrib break ~5:15, code freeze, judging expo, awards.
- Prizes: $500 / $300 / $200. Judged on impact, creativity, execution, demo.

## The problem it solves

- **No way in, no reason to stay.** Manara programs have no sign-up path, and nothing a student does shows up anywhere or adds up to anything.
- **Muslim students cannot find each other across campuses.** No place to meet a student two campuses over, or someone who already made the transfer you are planning.
- **Mainstream platforms ignore Islamic boundaries.** LinkedIn, Discord, and GroupMe mix men and women by default.
- **MSAs work in silos.** Community college and 4-year MSAs rarely plan together; small MSAs struggle alone.
- **Manara cannot see or strengthen its network.** No live view of which campuses are connected and which are fading.

## Vision

- Every Muslim student has a journey and a network: first event to career, connected across every campus.
- A Muslim-centered alternative to LinkedIn: professional and social, built around faith, boundaries designed in from the start.
- The 65 campuses work as one network: MSAs co-host, community colleges and universities support each other, Manara sees and strengthens every connection.
- Long term: Rihla becomes Manara West's official digital home, the "Manara Connect" its website already promises.

## Goals for this weekend

1. A working, demoable app that shows the whole story in 3 minutes.
2. Passport feels like the real product: stamps, badges, levels, celebration.
3. Gender separation is provably enforced everywhere (one helper, one test).
4. Admin map updates live across browser tabs.
5. A design that wins on polish: navy + gold, Apple-style spring motion, Islamic geometric accents.

## Priority order (time split)

| # | Feature | Share |
|---|---------|-------|
| 1 | Passport + profile (the main feature) | ~35% |
| 2 | Connect + chat | ~25% |
| 3 | Admin map + linking MSAs | ~25% |
| 4 | Campus event co-hosting | ~10% |
| 5 | Polish + demo rehearsal | ~5% |

Cut order if behind: group chats → suggested connections → co-host invite flow (show co-hosted events from seed data) → certificates.
**Never cut:** the passport, the brothers/sisters separation, the live map.
Mentors and the Starter Kit are passport tracks with pre-filled data, not separate features.

## Features

### 1. Rihla Passport + profile (student dashboard, main feature)
- Journey tracks: **Career, Leadership, Transfer, Deen** (Founder optional). Five milestones each.
- Stamps, stars, badges, and levels: **Explorer (0–4) → Traveler (5–9) → Navigator (10–14) → Manara Fellow (15+)** for attending events, visiting other campuses, meeting mentors, leading projects.
- Passport is the profile: campus, major, transfer goal, badges, completed tracks, gender label.
- Front Door quiz sets the first track on join.
- Check-in: enter an event code, get that event's stamp, with confetti and a badge popup. Journey timeline of stamps with campus names.
- Deen progress is **private to the student**. Career, Leadership, and Transfer badges can show publicly.
- Follow-up polish: real travel-passport look, stamp graphics per campus, flip-card badges, animated level-up modal, gold stars.

### 2. Connect and chat (separate spaces for brothers and sisters)
- Search and connect by name, campus, major, transfer path, or track.
- 1:1 chat with connections (live between open tabs). Group chats per campus and track are stretch.
- You only see and message people in your own space. Mentors are matched within the same space.
- Suggested connections: "3 brothers transferred from Mesa to UCSD in CS."
- Report and block, with MSA and admin moderation.

### 3. Admin dashboard: live map and MSA linking
- Leaflet map of all campuses: community colleges teal, 4-year schools gold.
- Link two MSAs (e.g., community college + 4-year as sister campuses). Each link is a line.
- Line thickness grows with cross-campus activity: check-ins, connections between the two campuses' students, co-hosted events.
- Live pulse when a student checks in or connects.
- Connection strength score (0–100) per campus; campuses inactive 60+ days get a red ring and appear in a "Fading MSAs" list.
- Stats: students, stamps, connections, events, co-hosted events, each with brothers/sisters breakdown. Live activity feed. "Simulate activity" toggle for demos.

### 4. Campus Leader dashboard: event collaboration
- Create an event: title, date, location, audience (Brothers / Sisters / Everyone), track + stamp awarded, auto-generated 6-char check-in code.
- Co-hosting: invite another MSA; the event appears on both campuses and both get credit. Suggested co-hosts: sister campus and nearby MSAs.
- Campus event list with attendance counts. Leader profile with position (President, VP, Events Chair, ...).

## User flow

1. **Landing page** → Sign Up. There is no login: the only way in is the Front Door quiz. Students whose college is not in the Manara list pick "My college isn't listed" and type it; admins see those colleges as invite targets.
2. **Front Door quiz**
   - Step 1: role: Student / Campus Leader / Admin
   - Step 2: Brother or Sister
   - Step 3: name and campus
   - Step 4 (students): community college or 4-year, transferring?, target campus, major, interests → "Your Rihla Plan" (suggested first track, nearest sister campus, 3 events, 3 same-gender connections)
   - Step 4 (campus leaders): position
3. **Role dashboards:** `/student`, `/campus`, `/admin`.

## Gender separation rules

- Every user has `gender: "brother" | "sister"`. Events have `audience: "brothers" | "sisters" | "everyone"`.
- **One helper enforces it everywhere**: profiles, search, suggestions, connections, chat, mentors.
- Labels everywhere it matters: blue 🟦 Brothers or purple 🟪 Sisters pills on profiles, chat headers, connection cards; Brothers / Sisters / Everyone on events.
- Admin sees combined totals with a brothers/sisters breakdown.
- Test helper: a brother account must never see a sister profile, and vice versa.

## Tech

- Vite + React + Tailwind + React Router + react-leaflet + framer-motion.
- Express + SQLite (`node:sqlite`) API in `server/`. The server filters every response by the viewer's space (brothers/sisters), hides event codes from students and other people's Deen stamps. Live updates over Server-Sent Events, so the map pulses and chat updates across open tabs. Client identity is a username in sessionStorage.
- Structure: `src/store.js`, `src/data/seed.js`, `src/pages/{Landing,Signup,Student,Campus,Admin}.jsx`, `src/components/` (Navbar, Passport, ProfileCard, ConnectList, Chat, EventForm, NetworkMap, StatsCards, ActivityFeed, GenderPill). "Reset demo data" button in the navbar.

## Seed data

25 West Coast campuses with lat/lng and type (UCSD, UCLA, UC Berkeley, UC Irvine, UC Riverside, UC Davis, SDSU, CSU Long Beach, Cal Poly Pomona, San Jose State, San Diego Mesa, Miramar, Santa Monica College, De Anza, Mt. San Antonio, Orange Coast, Riverside City, El Camino, Foothill, Diablo Valley, Fresno City, Fresno State, Sacramento State, SF State, USC). 6 pre-linked sister pairs: Mesa–UCSD, De Anza–SJSU, Santa Monica–UCLA, Riverside City–UCR, Orange Coast–UCI, Diablo Valley–UC Berkeley. 20 students (10 brothers, 10 sisters), 4 campus leaders, 1 admin, 12 events with codes, some connections and chats, activity history with 2–3 campuses inactive 60+ days.

## Design direction

Navy + gold lighthouse-at-night, Islamic geometric accents, Instrument Serif display, Geist UI, Amiri for Arabic. Spring motion (stiffness ~380, damping ~32), transform/opacity only, press scale 0.96, reduced-motion respected. 21st.dev components to copy in: spotlight card, animated beam, text scramble, bento grid, animated tabs, number ticker, marquee. Details in `plan.html`.

## Demo script (3 minutes)

1. A brother at Mesa takes the quiz and gets a Transfer Track passport.
2. He checks in at a UCSD event co-hosted with Mesa: stamp, badge, level up.
3. He connects and messages a brother who transferred Mesa → UCSD. Point out he only sees brothers.
4. Admin tab: map pulses, Mesa–UCSD line thickens, admin links a fading MSA to a sister campus.
5. Judge feedback slide: "You told us no free mixing, so separate spaces are built into every feature."
6. Close with the one-liner.

Rehearse with two tabs side by side: student left, admin right.

## Claude Code build prompt (reference)

Build "Manara Rihla" with Vite + React + Tailwind + React Router + react-leaflet, no backend, all state in localStorage via one store module with cross-tab `storage` sync. Routes: `/` landing with Demo login; `/signup` Front Door quiz; `/student` (Passport, Profile, Connect, Chat, Events tabs); `/campus` (profile, create event, co-host invite, event list); `/admin` (Leaflet map, link MSAs, strength scores, stats, activity feed, simulate toggle). Enforce gender rules in one helper. Seed per the section above. Build order: landing + signup + routing → student passport → connect + chat → admin map → campus events → two-tab demo rehearsal.

Follow-ups: "Make the Passport look like a real travel passport…", "Debug cross-tab sync: check-in on /student must pulse that campus on /admin within 1 second", "Audit every list, search, and chat for gender filtering and add a test helper."
