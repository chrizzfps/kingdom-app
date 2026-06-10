# Kingdom App

Internal platform for [Kingdom Media Hub](https://kingdommediahub.com) — manages proposals, CRM, invoicing, task boards, and team collaboration.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite |
| UI | Tailwind CSS v4, Radix UI, shadcn/ui |
| State | Zustand |
| Backend | Firebase (Auth, Firestore, Storage) |
| API | Laravel (PHP) |
| Animations | Framer Motion |

## Features

- **Proposal Builder** — modular drag-and-drop proposal editor with live public view
- **CRM** — clients, projects, tasks (Kanban + table views)
- **Finance** — invoice builder and management
- **Team Chat** — real-time channels with mentions
- **Whiteboard** — canvas-based collaboration tool
- **Admin** — user management, system settings, social center

## Getting Started

```bash
# Install dependencies
npm install

# Copy env template and fill in values
cp .env.example .env

# Start dev server
npm run dev
```

## Environment Variables

See [.env.example](.env.example) for required variables.

| Variable | Description |
|----------|-------------|
| `VITE_UPLOAD_ENDPOINT` | PHP upload endpoint URL |
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

## Project Structure

```
src/
├── components/
│   ├── admin/       # Admin panel components & editors
│   ├── crm/         # CRM components
│   ├── finance/     # Invoice components
│   ├── chat/        # Team chat
│   ├── public/      # Public proposal view modules
│   ├── tasks/       # Task management views
│   ├── whiteboard/  # Canvas whiteboard
│   └── ui/          # Shared UI primitives (shadcn)
├── pages/           # Route-level pages
├── hooks/           # Custom React hooks
├── lib/             # Utilities and Firebase config
├── store/           # Zustand stores
├── types/           # TypeScript types & schemas
└── templates/       # Proposal templates
api/                 # Laravel backend
```

## Scripts

```bash
npm run dev       # Start development server
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## License

Private — all rights reserved.
