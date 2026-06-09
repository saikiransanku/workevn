# Workevn

Monorepo-style workspace for Workevn:

- `workevn-api`: combined Node + Express + MongoDB backend
- `workevn-ui`: Vite + React + Tailwind public Workevn web app
- `workevn-worker-ui`: Vite + React + Tailwind worker app
- `workevn-admin-ui`: Vite + React + Tailwind admin app

## Run the API

```bash
cd workevn-api
cp .env.example .env
npm install
npm run seed:admin
npm run dev
```

## Run the UIs

Install and run each app separately:

```bash
cd workevn-ui
npm install
npm run dev
```

```bash
cd workevn-worker-ui
npm install
npm run dev
```

```bash
cd workevn-admin-ui
npm install
npm run dev
```

Default ports:

- Workevn UI: `http://localhost:5173`
- Worker UI: `http://localhost:5174`
- Admin UI: `http://localhost:5175`
- API: `http://localhost:5000`
