import http from "node:http";
import open from "open";
import type { StoredAuth } from "../types.js";

const APP_URL = process.env.ACTANT_API_URL ?? "https://actant.io";

export function startBrowserAuthFlow(): Promise<StoredAuth> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url?.startsWith("/callback")) {
        res.writeHead(404);
        res.end();
        return;
      }

      const url = new URL(req.url, `http://localhost`);
      const accessToken = url.searchParams.get("access_token");
      const refreshToken = url.searchParams.get("refresh_token");

      if (!accessToken || !refreshToken) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end("<html><body><p>Authentication failed. Missing tokens.</p></body></html>");
        server.close();
        reject(new Error("Missing tokens in callback"));
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        "<html><body><p>Authentication successful! You can close this tab.</p></body></html>"
      );

      server.close();
      resolve({ access_token: accessToken, refresh_token: refreshToken });
    });

    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("Failed to start local server"));
        return;
      }

      const port = addr.port;
      const authUrl = `${APP_URL}/auth/cli?port=${port}`;

      open(authUrl).catch(() => {
        // Browser open failed — user will see the URL in the dashboard
      });
    });

    server.on("error", (err) => {
      reject(new Error(`Failed to start local server: ${err.message}`));
    });

    setTimeout(() => {
      server.close();
      reject(new Error("Authentication timed out"));
    }, 120_000);
  });
}
