import { createFileRoute } from "@tanstack/react-router";
import { LoadingScreen } from "@/components/site/LoadingScreen";

export const Route = createFileRoute("/loading")({
  head: () => ({
    meta: [
      { title: "Loading — Velora Fine Jewelry" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoadingPageRoute,
});

function LoadingPageRoute() {
  return <LoadingScreen message="Hand-finishing the collection..." />;
}
