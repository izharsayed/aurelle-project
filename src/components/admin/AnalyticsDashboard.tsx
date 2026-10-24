import { useState, useEffect } from "react";
import {
  Eye,
  Users,
  ShoppingBag,
  TrendingUp,
  Smartphone,
  Monitor,
  Share2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

interface AnalyticsData {
  today: {
    visitors: number;
    pageViews: number;
    addToCart: number;
    checkouts: number;
    orders: number;
    revenue: number;
  };
  conversionFunnel: {
    step: string;
    count: number;
    rate: number;
  }[];
  topProducts: {
    slug: string;
    name: string;
    views: number;
  }[];
  sources: {
    source: string;
    count: number;
    percentage: number;
  }[];
  devices: {
    mobile: number;
    desktop: number;
    mobilePercentage: number;
  };
  recentActivities: {
    id: string;
    event: string;
    path: string;
    title: string;
    device: "mobile" | "desktop";
    source: string;
    timestamp: string;
  }[];
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.warn("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Poll every 30 seconds for live visitor updates
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const formatTimeAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (loading && !data) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="size-8 mx-auto animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          Loading Store Visitor Insights...
        </p>
      </div>
    );
  }

  const today = data?.today || {
    visitors: 0,
    pageViews: 0,
    addToCart: 0,
    checkouts: 0,
    orders: 0,
    revenue: 0,
  };

  const viewsPerVisitor = today.visitors > 0 ? (today.pageViews / today.visitors).toFixed(1) : "1.0";
  const cartRate = today.visitors > 0 ? Math.round((today.addToCart / today.visitors) * 100) : 0;
  const conversionRate = today.visitors > 0 ? ((today.orders / today.visitors) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Header with Live Status & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl text-foreground">Visitor Telemetry & Insights</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time customer traffic, viewed pieces, and boutique sales conversion.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="text-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* 1. TOP METRICS KPI CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gold/30 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Unique Visitors
            </CardTitle>
            <Users className="size-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">{today.visitors}</div>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <span>Today's active shoppers</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Page Impressions
            </CardTitle>
            <Eye className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">{today.pageViews}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Avg. <strong className="text-foreground">{viewsPerVisitor}</strong> pages per visitor
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Add-To-Bag Intent
            </CardTitle>
            <ShoppingBag className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">{today.addToCart}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              <strong className="text-gold font-medium">{cartRate}%</strong> of visitors added pieces
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sales Conversion
            </CardTitle>
            <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">{conversionRate}%</div>
            <p className="mt-1 text-xs text-muted-foreground">
              <strong className="text-foreground">{today.orders} orders</strong> placed today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. SALES CONVERSION FUNNEL & REVENUE */}
      <Card className="border-border/80 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Boutique Customer Journey Funnel
              </CardTitle>
              <CardDescription className="text-xs">
                How visitors convert from browsing jewelry into confirmed paid orders
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-gold/40 text-gold text-xs">
              Today: {formatPrice(today.revenue)} Revenue
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 pt-2">
            {(data?.conversionFunnel || []).map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{step.step}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground">{step.count}</span>
                    <span className="font-semibold text-gold w-10 text-right">{step.rate}%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      idx === 0
                        ? "bg-zinc-400"
                        : idx === 1
                          ? "bg-gold/70"
                          : idx === 2
                            ? "bg-gold"
                            : idx === 3
                              ? "bg-amber-600"
                              : "bg-emerald-600"
                    }`}
                    style={{ width: `${Math.max(step.rate, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. TWO-COLUMN: TOP JEWELRY PIECES & TRAFFIC CHANNELS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Viewed Jewelry Pieces */}
        <Card className="border-border/80 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-gold" />
              Most Viewed Jewelry Pieces
            </CardTitle>
            <CardDescription className="text-xs">
              Highest customer engagement and interest in your current catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60 border-y border-border/60">
              {(data?.topProducts || []).map((prod, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="size-5 rounded-full bg-accent/20 text-accent flex items-center justify-center font-serif text-[11px] font-semibold">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-foreground">{prod.name}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-muted-foreground">
                    <Eye className="size-3 text-gold/70" />
                    <span>{prod.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Channels & Device Split */}
        <div className="space-y-6">
          <Card className="border-border/80 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Share2 className="size-4 text-gold" />
                Traffic Sources
              </CardTitle>
              <CardDescription className="text-xs">
                Where your shoppers are discovering Zarika Fine Jewelry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(data?.sources || []).map((src, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{src.source}</span>
                      <span className="font-semibold text-foreground">{src.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(src.percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <Card className="border-border/80 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Device Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <Smartphone className="size-4 text-gold" />
                  <span className="text-muted-foreground">Mobile Shoppers:</span>
                  <strong className="text-foreground">
                    {data?.devices.mobilePercentage || 82}%
                  </strong>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Desktop:</span>
                  <strong className="text-foreground">
                    {100 - (data?.devices.mobilePercentage || 82)}%
                  </strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. REAL-TIME ACTIVITY STREAM */}
      <Card className="border-border/80 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Clock className="size-4 text-gold" />
            Live Storefront Activity
          </CardTitle>
          <CardDescription className="text-xs">
            Chronological log of shoppers browsing your jewelry pieces
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.recentActivities && data.recentActivities.length > 0 ? (
            <div className="divide-y divide-border/60 border-y border-border/60">
              {data.recentActivities.map((act) => (
                <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="size-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      {act.device === "mobile" ? (
                        <Smartphone className="size-3" />
                      ) : (
                        <Monitor className="size-3" />
                      )}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">
                        {act.event === "product_view"
                          ? `Viewed piece: "${act.title}"`
                          : act.event === "add_to_cart"
                            ? `Added to bag: "${act.title}"`
                            : act.event === "checkout_start"
                              ? "Initiated Checkout"
                              : `Visited: ${act.path}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        Source: {act.source} • Device: {act.device}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {formatTimeAgo(act.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              <Compass className="size-6 mx-auto mb-2 text-muted-foreground/60" />
              <span>Awaiting first visitor telemetry. Telemetry updates live as customers browse.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
