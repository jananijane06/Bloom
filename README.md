# 🌸 Bloom — Mindful Productivity & Life Flow

> **Grow your day with calm focus, intentional tasks, and reflective clarity.**

Bloom is an elegant, modern productivity and wellness web application built with **Next.js 14 App Router**, **TypeScript**, and **Tailwind CSS**. It blends task management, calendar scheduling, weekly time-blocking, mindful journaling, emotional mood tracking, and a smart AI copilot into a tranquil, glassmorphic interface.

---

## 🧭 Architecture & Directory Structure

```text
bloom/
│
├── app/
│   ├── layout.tsx             # Root layout with AppShell, ambient gradients, metadata
│   ├── page.tsx               # Redirect to /today
│   ├── globals.css            # Tailwind directives, animations & custom smooth scrollbars
│   │
│   ├── today/                 # Today dashboard (daily overview, progress ring, top intentions)
│   │   └── page.tsx
│   │
│   ├── calendar/              # Interactive month & agenda calendar view
│   │   └── page.tsx
│   │
│   ├── tasks/                 # Complete task manager with space & status filters
│   │   └── page.tsx
│   │
│   ├── timetable/             # Weekly visual timetable & recurring routine schedule
│   │   └── page.tsx
│   │
│   ├── journal/               # Mindful daily reflections with inspirational prompts
│   │   └── page.tsx
│   │
│   ├── mood/                  # Emotional pulse, energy levels & 4-7-8 breathing reset
│   │   └── page.tsx
│   │
│   ├── reminders/             # Mindful alerts, hydration & eye-rest intervals
│   │   └── page.tsx
│   │
│   ├── bloom-ai/              # Bloom AI mindful assistant & project breakdown companion
│   │   └── page.tsx
│   │
│   ├── spaces/                # Life spaces (Personal, Work, Knowledge, Mind & Wellness)
│   │   └── page.tsx
│   │
│   └── settings/              # Ambiance, profile, mantras, and local data export
│       └── page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx        # Navigation sidebar with active state & route badges
│   │   ├── Topbar.tsx         # Ambient header with greeting, theme switch, quick add
│   │   └── AppShell.tsx       # Responsive app shell container with ambient glow mesh
│   │
│   ├── ui/
│   │   ├── GlassCard.tsx      # Frosted glass card with glow & hover lift variants
│   │   ├── Button.tsx         # Polished button system with icon slots & variants
│   │   ├── Badge.tsx          # Status, priority & category pill indicators
│   │   ├── Modal.tsx          # Accessible dialog with blur backdrop & escape listener
│   │   └── ProgressRing.tsx   # Smooth SVG circular progress ring
│   │
│   ├── tasks/
│   │   ├── TaskCard.tsx       # Task item with priority dots, subtasks & complete toggle
│   │   ├── TaskList.tsx       # Filterable list (All, Pending, Done, search)
│   │   └── AddTask.tsx        # Task creator modal / inline form with estimated time
│   │
│   ├── calendar/
│   │   ├── CalendarView.tsx   # Interactive monthly calendar grid & day agenda
│   │   └── EventCard.tsx      # Scheduled session card with category badges
│   │
│   ├── spaces/
│   │   ├── SpaceSidebar.tsx   # Quick space switcher
│   │   ├── SpaceCard.tsx      # Life space card with completion progress
│   │   └── SpaceHeader.tsx    # Hero space banner with statistics
│   │
│   └── journal/
│       ├── JournalEditor.tsx  # Mindful reflection editor with mood tags & word count
│       ├── JournalCard.tsx    # Journal entry card with bookmarking
│       └── PromptCard.tsx     # Inspirational reflection cards
│
├── lib/
│   ├── utils.ts               # clsx + twMerge, ID generator, color mappings
│   ├── dates.ts               # Relative date calculations, monthly calendar generator
│   └── constants.ts           # Mock data for spaces, tasks, events, journal, prompts
│
├── types/
│   ├── task.ts                # Task, Priority, TaskStatus, SubTask types
│   ├── event.ts               # CalendarEvent, EventType types
│   ├── space.ts               # Space, SpaceColor types
│   └── journal.ts             # JournalEntry, MoodType, MoodLog types
│
├── public/
│   ├── images/
│   └── icons/
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## 🌿 Key Features

1. **Today Dashboard (`/today`)**: Daily intentions, progress ring, today's schedule, and mindful quotes.
2. **Tasks & Intentions (`/tasks`)**: Filter by life space, completion status, or search query.
3. **Calendar & Flow (`/calendar`)**: Month view with interactive day agenda and quick session scheduling.
4. **Weekly Timetable (`/timetable`)**: Visual routine blocks from morning rituals to focus sprints.
5. **Mindful Journal (`/journal`)**: Prompt-driven reflections with mood tagging and bookmarks.
6. **Mood & Vitality Pulse (`/mood`)**: Energy level tracking, emotion check-ins, and interactive breathing exercise.
7. **Mindful Reminders (`/reminders`)**: Hydration nudges, screen breaks, and focus locks.
8. **Bloom AI (`/bloom-ai`)**: Chat companion for mindful schedule optimization and project breakdowns.
9. **Life Spaces (`/spaces`)**: Separate personal, work, study, and wellness contexts.
10. **Sanctuary Settings (`/settings`)**: Dark/light mode, custom focus mantras, and JSON data export.
