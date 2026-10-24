import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { WhatsAppOrderModal } from "@/components/site/WhatsAppOrderModal";
import { LoadingScreen } from "@/components/site/LoadingScreen";
import { PagePreloader } from "@/components/site/PagePreloader";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Toaster } from "@/components/ui/sonner";
import { StoreProvider } from "@/context/store-context";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Zarika Fine Jewelry — Handcrafted Luxury & Jaipur Heritage" },
      {
        name: "description",
        content:
          "Hand-finished fine artificial jewelry in 18K gold and rhodium plating. Kundan chokers, necklaces, bangles and heirloom bridal sets.",
      },
      { name: "author", content: "Zarika Fine Jewelry" },
      { property: "og:site_name", content: "Zarika Fine Jewelry" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:title", content: "Zarika Fine Jewelry — Handcrafted Luxury & Jaipur Heritage" },
      {
        property: "og:description",
        content:
          "Hand-finished fine artificial jewelry in 18K gold and rhodium plating. Kundan chokers, necklaces, bangles and heirloom bridal sets.",
      },
      { property: "og:image", content: "https://aurelle-project.izharsayed31.workers.dev/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Zarika Fine Jewelry Signature Collection" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Zarika Fine Jewelry — Handcrafted Luxury" },
      {
        name: "twitter:description",
        content:
          "Hand-finished fine artificial jewelry in 18K gold and rhodium plating. Crafted with Jaipur artisan heritage.",
      },
      { name: "twitter:image", content: "https://aurelle-project.izharsayed31.workers.dev/og-image.jpg" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "JewelryStore",
          name: "Zarika Fine Jewelry",
          url: "https://aurelle-project.izharsayed31.workers.dev",
          logo: "https://aurelle-project.izharsayed31.workers.dev/favicon.svg",
          image: "https://aurelle-project.izharsayed31.workers.dev/og-image.jpg",
          description:
            "Handcrafted luxury artificial jewelry, bridal suites, kundan necklaces, and 18K gold plated heirloom jewelry.",
          priceRange: "₹₹",
          telephone: "+919876543210",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Johari Bazaar Heritage Lane",
            addressLocality: "Jaipur",
            addressRegion: "Rajasthan",
            postalCode: "302003",
            addressCountry: "IN",
          },
        }),
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap",
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  pendingComponent: LoadingScreen,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('aurelle.theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!isAdmin) {
      import("@/lib/analytics").then(({ trackEvent }) => {
        const isProduct = location.pathname.startsWith("/product/");
        if (isProduct) {
          const slug = location.pathname.split("/product/")[1]?.split("?")[0] || "";
          trackEvent("product_view", { productSlug: slug });
        } else {
          trackEvent("page_view");
        }
      });
    }
  }, [location.pathname, isAdmin]);

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-200 focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ink-foreground"
        >
          Skip to content
        </a>
        {isAdmin ? (
          <div className="min-h-screen bg-muted/30">
            <main id="main">
              <Outlet />
            </main>
          </div>
        ) : (
          <div className="flex min-h-screen flex-col">
            <Header />
            <main id="main" className="flex-1">
              {/* Required: nested routes render here. */}
              <Outlet />
            </main>
            <Footer />
          </div>
        )}
        <PagePreloader />
        <Toaster position="top-right" richColors />
        {!isAdmin && <SearchOverlay />}
        {!isAdmin && <CartDrawer />}
        <QuickViewModal />
        <WhatsAppOrderModal />
      </StoreProvider>
    </QueryClientProvider>
  );
}
