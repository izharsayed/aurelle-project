# Velora Fine Jewelry — Project Memory & Agent Context

This document serves as the complete, chronological memory and technical reference of everything designed, built, customized, and configured in this project. Any AI agent reading this file will have full context to continue work without losing progress.

---

## 1. Project Overview & Brand Identity
- **Brand Name**: **Velora Fine Jewelry** (formerly "Aurelle", completely rebranded across all code, metadata, routes, copy, and packages).
- **Domain & Category**: Luxury artificial jewelry storefront and catalog (Jaipur craftsmanship aesthetic, 18K anti-tarnish gold plating, hypoallergenic pieces).
- **GitHub Repository**: [https://github.com/izharsayed/aurelle-project.git](https://github.com/izharsayed/aurelle-project.git) (branch: `main`).
- **Local Dev Server**: Runs on `http://localhost:8080` via Vite (`npm run dev`).
- **Production Build**: `npm run build` (outputs to `.output/` with Nitro SSR server + static client assets).

---

## 2. Technology Stack & Frameworks
- **Framework**: [TanStack Start](https://tanstack.com/start) with Nitro SSR runtime.
- **Routing**: `@tanstack/react-router` (file-based routing in `src/routes/`).
- **React & Language**: React 19, TypeScript 5.8, Node `>=22.12.0` (enforced via `.nvmrc` and `.node-version`).
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with custom OKLCH tokens in `src/styles.css`.
  - **Fonts**: *Cormorant Garamond* (editorial serif headings) and *Jost* (clean sans-serif body & uppercase tracking).
  - **Color Palette**: Luxury ivory canvas (`--background`), deep ink charcoal (`--foreground`), slate muted text (`--muted-foreground`), and rich warm gold accents (`--gold` / `--accent`).
- **UI Primitives & Animation**: Radix UI primitives, Lucide React icons, Sonner toast notifications, Motion (`motion/react`).
- **State Management**: React Context (`StoreProvider`) with `localStorage` persistence in `src/context/store-context.tsx`.

---

## 3. Work Completed & Key Implementations

### A. Complete Rebranding to "Velora Fine Jewelry"
- Replaced all traces of "Aurelle" and legacy starter templates across:
  - Header, footer, logo (`Logo.tsx`), mobile menu, admin portal, page metadata (`__root.tsx`, `index.tsx`, `about.tsx`, `contact.tsx`, `shop.tsx`, etc.).
  - Email updated to `concierge@velorajewelry.com`.
  - Collections updated from "Aurelle Signature" to "Velora Signature".
  - `package.json` name updated to `velora-fine-jewelry`.

### B. Custom Luxury Favicon & Lovable De-branding
- Removed all Lovable traces and default heart favicons.
- **`public/favicon.svg`**: Precision-crafted vector golden gemstone medallion with 18K metallic gradients and dark contrast ring.
- **`public/favicon.ico`**: Binary 32x32 golden diamond icon for legacy browsers and desktop bookmarks.
- Integrated into `src/routes/__root.tsx` `<head>` (`favicon.svg`, `favicon.ico`, and `apple-touch-icon`).

### C. Haute Joaillerie Navigation Bar (`Header.tsx`)
- **Centered Logo 3-Column Architecture**:
  - **Left**: Primary navigation links (*Shop, Collections, New Arrivals, Our Story*) with active gold underline indicators.
  - **Center**: Perfectly centered **VELORA** brand logo.
  - **Right**: Search trigger, Wishlist link with live gold count badge, Theme Toggle, and WhatsApp Concierge hotline pill.
- **Category Mega-Dropdown (`CategoryDropdown.tsx`)**:
  - Hovering over "Shop" reveals an editorial glassmorphic panel with direct links to all jewelry categories (*Earrings, Necklaces, Bracelets, Bangles, Rings, Sets*), signature collections, and a *Heirloom Bridal Suite* spotlight card.
- **Top Announcement Bar**: Luxury dark ribbon with gold divider dots: *"Complimentary shipping on orders above ₹2,500 • WhatsApp Concierge Available"*.

### D. Morphing Hamburger & Luxury Mobile Menu (`MobileMenu.tsx`, `AnimatedHamburger.tsx`)
- **Animated Hamburger**: Staggered 3-line hairline geometry (20px, 16px, 14px) with smooth spring micro-animation that morphs into a gold symmetric 'X' when clicked.
- **Mobile Menu Drawer**:
  - Gem medallion header with dark/light theme switch.
  - Interactive collapsible *"Shop All Pieces"* accordion with a 2-column category chip grid.
  - Curated navigation links with live wishlist heart counter and a "NEW" gold badge on New Arrivals.
  - Luxury WhatsApp concierge consultation box and occasion pills (*Wedding, Festive, Party, Everyday, Gifting*).

### E. Page Reload Loading Animation (`PagePreloader.tsx` & `LoadingScreen.tsx`)
- Automatic full-screen preloader that triggers on initial site visits and page reloads (F5).
- Features ambient gold radial glow, dual concentric gold orbit rings (continuous spin + counter-rotating dashed ring), pulsing gem medallion, editorial *"VELORA — FINE JEWELRY"* typography, and a shimmering gold progress line.
- Plays for ~850ms, then smoothly dissolves with an exit crossfade (`opacity-0 pointer-events-none scale-[1.02] blur-[1px] transition-all duration-700 ease-out`) before unmounting from the DOM.
- Also wired as the global router `pendingComponent` in `src/routes/__root.tsx` and previewable at `/loading`.

### F. Dark & Light Theme System
- Global store theme state (`theme: "light" | "dark"`) with `localStorage` (`aurelle.theme`) and system preference fallback.
- Exported `useTheme()` hook.
- Zero-flash inline bootstrap script in `src/routes/__root.tsx` `<head>` to prevent white/dark flashes during SSR hydration.
- Animated Sun/Moon toggle button in `src/components/site/ThemeToggle.tsx`.

### G. Mobile 2-Column Product Grid & Card Polish
- **Product Card (`ProductCard.tsx`)**:
  - Equalized card heights across 2-column mobile rows (`h-full flex flex-col justify-between`).
  - Alternate angle image flip on hover.
  - Clean 14px circular finish swatches (Gold, Rose Gold, Silver, Emerald) without clumsy text wrap.
  - Streamlined bottom action row: Compact, elegant WhatsApp Order button (`bg-whatsapp`) + Quick View square icon button in a single 34px row.
- **Shop Refine Bar (`ProductBrowser.tsx`)**:
  - Search input and mobile "Filter" sheet button side-by-side with live piece counter and sort dropdown.
  - Progressive "Load More Pieces" pagination with piece counter and gold progress bar.

### H. 1-Click WhatsApp Direct Ordering & Lead Tracking
- Clicking **"Order"** on any product card, quick view, or product page immediately launches WhatsApp (`https://wa.me/...`) in a new tab or mobile app.
- Pre-fills rich order inquiry message:
  - Product Name, SKU, selected Finish, Quantity, Price, and direct link to the product page.
- Built-in fallback: If a browser popup blocker restricts redirection, the preview modal seamlessly opens.
- Every click is automatically logged in the **Admin Portal** under **"Inquiries & Leads"**.
- Default concierge phone hotline: `+91 9876543210` (editable anytime in Admin Settings).

### I. Integrated Admin Portal (`/admin`)
- Accessible at `/admin` (Default PIN: `1234`).
- **Product Management**: Add new pieces, live stock toggles, price updates, sale discounts.
- **Image Picker (`ImagePicker.tsx`)**: Pre-curated luxury jewelry image presets + custom image URL input.
- **Inquiry Lead Tracker**: View customer WhatsApp order requests with timestamps and details.
- **Concierge Settings**: Update store WhatsApp number anytime.

### J. Performance, Dependency Slimming & Cloudflare CI/CD
- Deleted 26 unused scaffolded UI components from `src/components/ui/`.
- Removed 67 redundant npm dependencies from `package.json`.
- Project source code size: **~1.86 MB**; production build: **~4.48 MB**.
- Synced `package-lock.json` with `lru-cache@11.5.2` for clean `npm ci` builds.
- Added `.nvmrc` and `.node-version` set to `22.12.0` for Cloudflare Workers / Pages build compatibility.

### K. Full E-Commerce Checkout with Cashfree & Firebase Cloud Firestore
- Replaced primary WhatsApp order CTA with a complete, luxury e-commerce bag and checkout system (`Customer -> Add to Bag -> Bag Drawer / Route -> Checkout -> Cashfree PG -> Webhook -> Server Verification -> Firebase -> Order Success & Confirmation Email`).
- WhatsApp concierge preserved as secondary advisory / styling consultation service.
- **Server-Side API Architecture**:
  - `POST /api/payments/create-order`: Validates Indian phone, email, and 6-digit pincode; strictly computes authoritative price server-side from catalog; creates `PENDING_PAYMENT` order in Firebase; initiates Cashfree payment session.
  - `POST /api/payments/cashfree/webhook`: Verifies HMAC-SHA256 signature with `CASHFREE_SECRET_KEY`; validates payment amounts; strictly idempotent; updates order to `PAID`; stores payment record; queues confirmation email.
  - `GET /api/payments/verify-order`: Polled by `/order/$orderId` status page for bank-confirmed payment status.
  - `GET /api/admin/orders` & `POST /api/admin/orders/status`: Live order management and fulfillment state transitions (`PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **Cloud Firestore**:
  - `orders/{orderId}`: Authoritative orders. Client writes strictly forbidden via `firestore.rules`.
  - `payments/{paymentId}`: Gateway audit records.
  - `products/{productId}`: Authoritative catalog.
  - `mail/{mailId}`: Transactional email queue compatible with Firebase Trigger Email extension.
- **Storefront & Admin UI**:
  - `CartDrawer.tsx` & `/cart`: Sliding bag drawer + detailed cart page with quantity adjustments, free delivery threshold indicator (₹2,500), and subtotal breakdown.
  - `Header.tsx`: Added luxury Shopping Bag button with live item counter badge.
  - `ProductCard.tsx` & `ProductInfo.tsx`: "Add to Bag" & "Instant Checkout" primary CTAs.
  - `/checkout`: Comprehensive delivery address form with validation, order review, and Cashfree Web Checkout integration.
  - `/order/$orderId`: Order confirmation / polling status page with retry flow.
  - `/admin`: New **Orders** tab with search, status filters, fulfillment updater, and complete order detail drawer.

---

## 4. Key File Architecture & Directory Map

```text
aurelle-project/
├── .node-version                     # Pinned Node 22.12.0 for Cloudflare/CI
├── .nvmrc                            # Pinned Node 22.12.0
├── AGENTS.md                         # Agent instructions & guidelines
├── PROJECT_MEMORY.md                 # Complete project memory (this file)
├── package.json                      # Project metadata & slimmed dependencies
├── vite.config.ts                    # Vite + TanStack Start + Nitro SSR config
├── public/
│   ├── favicon.svg                   # Luxury Velora golden gem vector icon
│   ├── favicon.ico                   # Binary Windows/browser icon
│   └── robots.txt                    # Search crawler rules
└── src/
    ├── routeTree.gen.ts              # Auto-generated TanStack router tree
    ├── router.tsx                    # Router initialization
    ├── server.ts                     # Nitro SSR server handler
    ├── start.ts                      # Client hydration entry
    ├── styles.css                    # Tailwind CSS v4 design tokens & fonts
    ├── context/
    │   └── store-context.tsx         # Global store (catalog, wishlist, inquiries, theme)
    ├── data/
    │   ├── categories.ts             # Categories, occasions & collections
    │   ├── products.ts               # Default seed catalog (jewelry items)
    │   └── types.ts                  # TypeScript models (Product, Inquiry, etc.)
    ├── lib/
    │   ├── format.ts                 # Currency & discount formatting
    │   ├── utils.ts                  # clsx + twMerge utility
    │   └── whatsapp.ts               # WhatsApp URL & order message generator
    ├── components/
    │   ├── admin/
    │   │   ├── AddProductDialog.tsx  # Product creation modal
    │   │   ├── AdminHeader.tsx       # Admin top navigation & theme toggle
    │   │   ├── ImagePicker.tsx       # Image gallery & URL uploader
    │   │   └── ProductEditDialog.tsx # Product editing modal
    │   ├── layout/
    │   │   ├── AnimatedHamburger.tsx # Morphing 3-bar to 'X' button
    │   │   ├── CategoryDropdown.tsx  # Desktop "Shop" mega-menu
    │   │   ├── Footer.tsx            # Brand footer & contact details
    │   │   ├── Header.tsx            # Haute Joaillerie 3-column header
    │   │   ├── MobileMenu.tsx        # Redesigned mobile drawer
    │   │   └── SearchOverlay.tsx     # Full-screen search modal
    │   ├── shop/
    │   │   ├── ProductBadge.tsx      # Sale / New / Bestseller tags
    │   │   ├── ProductBrowser.tsx    # Filter sidebar + grid + load more
    │   │   ├── ProductCard.tsx       # Minimalist luxury card with swatches
    │   │   ├── ProductFilters.tsx    # Category & price range filters
    │   │   ├── ProductGallery.tsx    # Image zoom & thumbnail gallery
    │   │   ├── ProductGrid.tsx       # Responsive 2-to-4 column grid
    │   │   ├── ProductInfo.tsx       # Product details & WhatsApp order CTA
    │   │   └── QuickViewModal.tsx    # 1-click preview modal
    │   ├── site/
    │   │   ├── LoadingScreen.tsx     # Router pending & standalone loader
    │   │   ├── Logo.tsx              # Velora serif logo
    │   │   ├── PagePreloader.tsx     # Page reload luxury splash animation
    │   │   ├── ThemeToggle.tsx       # Sun/Moon animated theme switch
    │   │   └── WhatsAppButton.tsx    # WhatsApp order trigger button
    │   └── ui/                       # Curated, active Radix primitives
    └── routes/
        ├── __root.tsx                # Root layout, theme bootstrap, preloader
        ├── index.tsx                 # Homepage (Hero, Best Sellers, Artisans)
        ├── shop.tsx                  # Full jewelry collection browser
        ├── category.$slug.tsx        # Dynamic category page
        ├── collections.tsx           # Signature collections overview
        ├── new-arrivals.tsx          # New arrivals filter page
        ├── product.$slug.tsx         # Detailed product page
        ├── wishlist.tsx              # Saved pieces wishlist
        ├── about.tsx                 # Brand story & artisan craft
        ├── contact.tsx               # Concierge & WhatsApp contact
        ├── faq.tsx                   # Jewelry care & ordering FAQ
        ├── admin.tsx                 # Protected admin management portal
        └── loading.tsx               # Dedicated loading page preview
```

---

## 5. Local Storage Keys & Admin Passcodes
- **Admin PIN**: Default `1234` (stored in `window.localStorage["aurelle.admin.pin"]`).
- **Catalog Override**: `aurelle.catalog.v1` (custom/edited products).
- **Inquiries / Leads**: `aurelle.inquiries` (list of customer order requests).
- **Wishlist Items**: `aurelle.wishlist` (array of product IDs).
- **Theme**: `aurelle.theme` (`"light"` or `"dark"`).
- **WhatsApp Concierge Number**: `aurelle.whatsapp_number`.

---

## 6. How To Prompt Any Future AI Agent

When giving this project to another AI agent, you can simply paste this prompt:

> *"Please read `PROJECT_MEMORY.md` and `AGENTS.md` before making any changes. This is **Velora Fine Jewelry**, a luxury jewelry storefront built on TanStack Start (React 19, TypeScript, Tailwind CSS v4). Keep all design tokens, font pairings (Cormorant Garamond + Jost), and existing WhatsApp concierge/admin workflows strictly consistent."*
