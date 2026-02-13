import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { StoredAuth } from "../types.js";

const AUTH_DIR = path.join(os.homedir(), ".actant");
const AUTH_FILE = path.join(AUTH_DIR, "auth.json");

export function getStoredAuth(): StoredAuth | null {
  try {
    const raw = fs.readFileSync(AUTH_FILE, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "access_token" in parsed &&
      "refresh_token" in parsed &&
      typeof (parsed as StoredAuth).access_token === "string" &&
      typeof (parsed as StoredAuth).refresh_token === "string"
    ) {
      return parsed as StoredAuth;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveAuth(tokens: StoredAuth): void {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.writeFileSync(AUTH_FILE, JSON.stringify(tokens, null, 2), {
    mode: 0o600,
  });
}

export function clearAuth(): void {
  try {
    fs.unlinkSync(AUTH_FILE);
  } catch {
    // File may not exist
  }
}

export function isAuthenticated(): boolean {
  return getStoredAuth() !== null;
}

export async function refreshTokens(): Promise<StoredAuth | null> {
  const auth = getStoredAuth();
  if (!auth) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nyiibwqpkupzdgwqctlb.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  try {
    const response = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({ refresh_token: auth.refresh_token }),
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
    };

    const newTokens: StoredAuth = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };

    saveAuth(newTokens);
    return newTokens;
  } catch {
    return null;
  }
}
