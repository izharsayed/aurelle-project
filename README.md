# Velora Fine Jewelry — Luxury Jewelry Storefront

Velora Fine Jewelry is an e-commerce web application for a luxury artificial jewelry brand, featuring warm gold aesthetics, direct WhatsApp concierge ordering, full product browsing, and an integrated Admin Portal.

---

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) with Nitro SSR
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **UI & Components**: React 19, TypeScript, Radix UI Primitives, Lucide Icons
- **Styling**: Tailwind CSS v4 with custom OKLCH tokens and design typography (*Cormorant Garamond* & *Jost*)
- **State**: React Context with LocalStorage persistence

---

## Getting Started

### 1. Install Dependencies
```sh
npm install
```

### 2. Start Development Server
```sh
npm run dev
```

The application runs locally at:  
👉 **http://localhost:8080**

### 3. Admin Portal
- URL: **http://localhost:8080/admin**
- Default PIN: `1234`
- Features: Product management, live stock toggles, image gallery & uploads, WhatsApp concierge settings, and customer order leads.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local dev server |
| `npm run build` | Builds client assets and Nitro server output for production |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint |
| `npm run format` | Runs Prettier code formatting |
