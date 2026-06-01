import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

function interFontPreloadPlugin() {
  return {
    name: "inter-font-preload",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        let output = html;
        const siteUrl = (process.env.VITE_SITE_URL || "https://myuni.uz").replace(/\/$/, "");
        output = output.replaceAll("https://myuni.uz", siteUrl);

        if (!ctx.bundle) {
          return output;
        }

        const fontAsset = Object.values(ctx.bundle).find(
          (item) =>
            item.type === "asset" &&
            item.fileName.includes("inter-latin-wght-normal") &&
            item.fileName.endsWith(".woff2")
        );

        if (!fontAsset) {
          return output;
        }

        const link = `<link rel="preload" href="/${fontAsset.fileName}" as="font" type="font/woff2" crossorigin fetchpriority="high" />`;
        return output.replace("</head>", `    ${link}\n  </head>`);
      },
    },
  };
}

function configureApiProxy(proxy) {
  proxy.on("proxyReq", (proxyReq, req) => {
    if (req.url?.includes("/stream/")) {
      proxyReq.setHeader("Accept", "text/event-stream");
    }
  });
  proxy.on("proxyRes", (proxyRes, req) => {
    if (!req.url?.includes("/stream/")) {
      return;
    }
    proxyRes.headers["cache-control"] = "no-cache";
    proxyRes.headers["x-accel-buffering"] = "no";
    if (proxyRes.headers["content-type"]?.includes("text/event-stream")) {
      delete proxyRes.headers["content-length"];
    }
  });
}

export default defineConfig({
  plugins: [
    react(),
    interFontPreloadPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["pwa-192.png", "pwa-512.png", "apple-touch-icon.png", "og-image.png", "robots.txt"],
      manifest: {
        name: "MyUni.uz",
        short_name: "MyUni",
        description:
          "O'zbekiston universitetlari haqida talabalar sharhlari, reyting va hamjamiyat platformasi.",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        lang: "uz",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        importScripts: ["/push-handler.js"],
        offlineGoogleAnalytics: false,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  publicDir: "public",
  build: {
    copyPublicDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion")) {
              return "motion";
            }
            if (id.includes("react-router") || id.includes("react-dom") || id.includes("/react/")) {
              return "react-vendor";
            }
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        configure: configureApiProxy,
      },
      "/media": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      "/api": {
        target: process.env.PRERENDER_API_URL || "http://127.0.0.1:8000",
        changeOrigin: true,
        configure: configureApiProxy,
      },
      "/media": {
        target: process.env.PRERENDER_API_URL || "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
