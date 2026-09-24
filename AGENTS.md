# Velora Fine Jewelry Project Guidelines

## Overview
Velora Fine Jewelry is a luxury artificial jewelry storefront built with TanStack Start, React 19, TypeScript, and Tailwind CSS v4.

## Complete Project History & Architecture
- **Full Project Context**: Read [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md) for full chronological history, past user decisions, component maps, and technical details.

## Key Conventions
- **Routing**: File-based routing in `src/routes/` via `@tanstack/react-router`.
- **State**: Global store in `src/context/store-context.tsx` with localStorage persistence.
- **Admin**: Located at `/admin` with product management, catalog CRUD, and WhatsApp order lead tracking.
- **Styling**: Tailwind CSS v4 design tokens in `src/styles.css`. Keep typography (Cormorant Garamond + Jost) and luxury aesthetics consistent.
