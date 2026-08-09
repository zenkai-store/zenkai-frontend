import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],

  server: {
    https: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "https://zenkai-backend.onrender.com",
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: {
          "zenkai-backend.onrender.com": "localhost",
          ".onrender.com": "localhost",
          "*": "localhost",
        },
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes) => {
            const setCookie = proxyRes.headers["set-cookie"];
            if (setCookie) {
              proxyRes.headers["set-cookie"] = setCookie.map((cookie) =>
                cookie
                  .replace(/;\s*Secure/gi, "")
                  .replace(/;\s*SameSite=None/gi, "; SameSite=Lax")
              );
            }
          });
        },
      },
    },
  },
});
