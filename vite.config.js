import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(), // HTTPS for secure cookies
  ],

  server: {
    https: true,
    port: 5173,

    proxy: {
      "/api": {
        target: "https://zenkai-backend.onrender.com",
        changeOrigin: true,
        secure: true,

        // 🔥 VERY IMPORTANT for cookies
        cookieDomainRewrite: "localhost",

        // 🔥 ensure headers are forwarded
        headers: {
          origin: "https://localhost:5173",
        },

        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("➡️ Proxying:", req.method, req.url);
          });

          proxy.on("proxyRes", (proxyRes, req) => {
            const cookies = proxyRes.headers["set-cookie"];
            if (cookies) {
              console.log("🍪 Cookies received from backend");
            }
          });
        },
      },
    },
  },
});
