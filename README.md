# Fasal AI

Agricultural early intelligence network for India.

This is **Phase 0**: a frontend-only foundation. There is no database, login, or Gemini API yet.

## What you need

- [Node.js](https://nodejs.org/) version 20 or newer
- A terminal (PowerShell on Windows is fine)

## How to run the project

1. Open a terminal.
2. Go to this folder:

```bash
cd C:\Users\POORNITHA\OneDrive\Documents\fasal-ai
```

3. Install packages (only needed the first time, or after dependencies change):

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open this URL in your browser:

**http://localhost:3000**

You should see a dark design-system screen titled “Agricultural early intelligence”, not a full website yet.

## Stop the server

In the same terminal, press `Ctrl + C`.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the app locally for development |
| `npm run build` | Creates a production build |
| `npm run start` | Serves the production build (run `build` first) |

## Project folders

```text
src/
  app/                 Pages and global styles
  components/brand/    Logo / wordmark
  components/layout/   Shared page chrome (header)
  lib/                 Small shared helpers
  types/               Shared TypeScript types
public/                Static files (icons, later maps)
```

## Notes

- No API keys are required in Phase 0.
- shadcn/ui is not installed yet, to keep setup simple.
- The home page is a design foundation only. The landing page comes in a later phase.
