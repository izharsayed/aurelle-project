import { defineConfig } from "vite";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

export default defineConfig(({ command }) => ({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    viteReact(),
    {
      name: "velora-dev-api",
      configureServer(server: any) {
        server.middlewares.use(async (req: any, res: any, next: any) => {
          if (!req.url?.startsWith("/api/")) return next();
          try {
            const { handleApiRoute } = await server.ssrLoadModule("./src/server/handler.ts");
            const protocol = req.headers["x-forwarded-proto"] || "http";
            const host = req.headers.host || "localhost:8080";
            const fullUrl = `${protocol}://${host}${req.url}`;

            let body: any = undefined;
            if (req.method !== "GET" && req.method !== "HEAD") {
              const chunks: Buffer[] = [];
              for await (const chunk of req) {
                chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
              }
              body = Buffer.concat(chunks);
            }

            const webReq = new Request(fullUrl, {
              method: req.method,
              headers: req.headers as any,
              body,
              // Node fetch needs duplex: 'half' when body is present
              ...(body ? { duplex: "half" } : {}),
            } as any);

            const webRes = await handleApiRoute(webReq);
            if (!webRes) return next();

            res.statusCode = webRes.status;
            webRes.headers.forEach((val: string, key: string) => {
              res.setHeader(key, val);
            });
            const resBody = Buffer.from(await webRes.arrayBuffer());
            res.end(resBody);
          } catch (err) {
            console.error("Vite dev API error:", err);
            next(err);
          }
        });
      },
    },
    command === "build"
      ? nitro({
          defaultPreset: process.env["NITRO_PRESET"] || "cloudflare-module",
        })
      : null,
  ].filter(Boolean),
  server: {
    host: "::",
    port: 8080,
  },
}));
