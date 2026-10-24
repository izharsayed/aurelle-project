/**
 * Lightweight, privacy-first analytics tracker for Zarika Fine Jewelry
 * Zero third-party cookies • 100% first-party telemetry
 */

const SESSION_KEY = "zarika.analytics.sid";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = window.sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `sid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      window.sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `sid_${Date.now()}`;
  }
}

function getDeviceType(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  const isMobileUa = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const isSmallScreen = window.innerWidth <= 768;
  return isMobileUa || isSmallScreen ? "mobile" : "desktop";
}

export interface TrackDetails {
  title?: string;
  productSlug?: string;
  productName?: string;
}

export function trackEvent(
  event: "page_view" | "product_view" | "add_to_cart" | "checkout_start",
  details?: TrackDetails,
): void {
  if (typeof window === "undefined") return;

  const pathname = window.location.pathname;

  // Never track admin portal visits to keep analytics clean
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return;
  }

  const payload = {
    event,
    path: pathname,
    title: details?.title || document.title || pathname,
    productSlug: details?.productSlug,
    productName: details?.productName,
    referrer: document.referrer || "",
    device: getDeviceType(),
    sessionId: getSessionId(),
  };

  try {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* ignore offline or network abort */
    });
  } catch {
    /* ignore */
  }
}
