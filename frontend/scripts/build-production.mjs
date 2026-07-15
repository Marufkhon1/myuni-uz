/**
 * Production build: backend API + Vite + to'liq prerender (B5 — Next.js SSR ekvivalenti SPA uchun).
 *
 * PRERENDER_SKIP_BACKEND=1 — API allaqachon ishlayotgan bo'lsa.
 * PRERENDER_REQUIRE_API=0 — dinamik yo'llar bo'lmasa ham build davom etadi.
 * PRERENDER_SKIP=1 — Playwright prerender/verify o'tkazib yuboriladi (Turon shared hosting).
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const backendRoot = path.resolve(frontendRoot, "..", "backend");
const apiHost = process.env.PRERENDER_API_HOST || "127.0.0.1";
const apiPort = Number(process.env.PRERENDER_API_PORT || 8000);
const apiUrl = (process.env.PRERENDER_API_URL || `http://${apiHost}:${apiPort}`).replace(/\/$/, "");

function resolvePythonCommand() {
  if (process.env.PRERENDER_PYTHON) {
    return process.env.PRERENDER_PYTHON;
  }
  const venvPython =
    process.platform === "win32"
      ? path.join(backendRoot, ".venv", "Scripts", "python.exe")
      : path.join(backendRoot, ".venv", "bin", "python");
  if (fs.existsSync(venvPython)) {
    return venvPython;
  }
  return "python";
}

const pythonCommand = resolvePythonCommand();

function buildBackendEnv(extra = {}) {
  const hosts = new Set(
    (process.env.DJANGO_ALLOWED_HOSTS || "")
      .split(",")
      .map((host) => host.trim())
      .filter(Boolean)
  );
  hosts.add("127.0.0.1");
  hosts.add("localhost");

  return {
    ...process.env,
    DJANGO_SECRET_KEY:
      process.env.DJANGO_SECRET_KEY || "local-build-secret-key-at-least-32-characters-long",
    DJANGO_DEBUG: "True",
    DJANGO_ALLOWED_HOSTS: [...hosts].join(","),
    ...extra,
  };
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} — exit ${code}`));
    });
  });
}

function waitForServerReady(url, timeoutMs = 120000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });
      request.on("error", retry);
    };

    const retry = () => {
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`API ${url} ga ulanib bo'lmadi.`));
        return;
      }
      setTimeout(tick, 400);
    };

    tick();
  });
}

async function isApiReady() {
  try {
    await waitForServerReady(`${apiUrl}/api/public/universities/`, 3000);
    return true;
  } catch {
    return false;
  }
}

function startBackendServer() {
  return spawn(pythonCommand, ["manage.py", "runserver", `${apiHost}:${apiPort}`, "--noreload"], {
    cwd: backendRoot,
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
    env: buildBackendEnv(),
  });
}

async function main() {
  if (!fs.existsSync(backendRoot)) {
    throw new Error(`Backend topilmadi: ${backendRoot}`);
  }

  let apiProcess = null;
  let startedLocally = false;

  try {
    const skipBackend = process.env.PRERENDER_SKIP_BACKEND === "1";
    const apiAlreadyUp = await isApiReady();

    if (!skipBackend && !apiAlreadyUp) {
      console.log("[build] Backend migrate...");
      await runCommand(pythonCommand, ["manage.py", "migrate", "--noinput"], {
        cwd: backendRoot,
        env: buildBackendEnv(),
      });

      console.log(`[build] Backend ishga tushirilmoqda (${apiUrl})...`);
      apiProcess = startBackendServer();
      startedLocally = true;
      await waitForServerReady(`${apiUrl}/api/public/universities/`);
    } else if (apiAlreadyUp) {
      console.log("[build] Backend allaqachon ishlayapti — o'tkazib yuborildi.");
    }

    const buildEnv = {
      ...process.env,
      PRERENDER_API_URL: apiUrl,
      PRERENDER_REQUIRE_API: process.env.PRERENDER_REQUIRE_API ?? "1",
    };

    console.log("[build] Vite production build...");
    await runCommand("npm", ["run", "build:spa"], {
      cwd: frontendRoot,
      env: buildEnv,
    });

    if (process.env.PRERENDER_SKIP === "1") {
      console.log("[build] PRERENDER_SKIP=1 — prerender o'tkazib yuborildi.");
      console.log("[build] Tayyor.");
      return;
    }

    console.log("[build] Public sahifalar prerender...");
    await runCommand("node", ["scripts/prerender-public.mjs"], {
      cwd: frontendRoot,
      env: buildEnv,
    });

    console.log("[build] Prerender tekshiruvi...");
    await runCommand("node", ["scripts/verify-prerender.mjs"], {
      cwd: frontendRoot,
      env: buildEnv,
    });

    console.log("[build] Tayyor.");
  } finally {
    if (apiProcess && startedLocally) {
      apiProcess.kill("SIGTERM");
    }
  }
}

main().catch((error) => {
  console.error("[build] Xato:", error.message);
  process.exit(1);
});
