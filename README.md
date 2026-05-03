# LifeOs — Personal Productivity System

> "un outil personnel pour la productivité"

A personal productivity web app inspired by the concept of a "Life Operating System". Centralizes task management, goal tracking, habit building, and daily planning into one clean interface.

## Tech Stack

| Technology | Usage |
|---|---|
| TypeScript | Main language |
| Next.js | Framework & routing |
| React | UI components |
| Tailwind CSS | Styling |
| Supabase / LocalStorage | Data persistence |
| Framer Motion | Animations |

## Features

- **Task Manager** — Create, organize, and complete tasks
- **Goal Tracker** — Set long-term goals with milestones
- **Habit Tracker** — Build daily habits with streak tracking
- **Daily Planner** — Plan your day hour by hour
- **Dashboard** — Overview of all productivity metrics
- **Dark/Light Mode** — Theme toggle

## Project Structure

```
LifeOs/
├── app/
│   ├── page.tsx              # Dashboard home
│   ├── tasks/
│   ├── goals/
│   ├── habits/
│   └── planner/
├── components/
│   ├── TaskCard.tsx
│   ├── HabitCard.tsx
│   ├── GoalCard.tsx
│   └── Sidebar.tsx
├── lib/
│   └── store.ts              # State management
├── styles/
├── package.json
└── tsconfig.json
```

## Getting Started

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/cyberhacker1210/LifeOs
cd LifeOs
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Optional — with Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## Author

**cyberhacker1210** — [GitHub](https://github.com/cyberhacker1210)
