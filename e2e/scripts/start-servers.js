// Starts the ez-shop dev servers so that Playwright's webServer can manage them.
//
// Usage:
//   node ./scripts/start-servers.js                # all three workspaces
//   node ./scripts/start-servers.js api            # just the API
//
// Each workspace runs in its own directory:
//   server/   -> bun run dev   (http://localhost:7777)
//   client/   -> bun run dev   (http://localhost:5173)
//   admin/    -> bun run dev   (http://localhost:3000)
//
// Playwright starts one process per workspace (see playwright.config.ts) so it
// can wait for each port before running any test.
//
// The process stays alive so Playwright can keep the servers running during the
// test run and terminate them when the run ends.

const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(ROOT, '..');
const workspace = (name) => path.join(REPO_ROOT, name);

/**
 * Locate the bun executable.
 *
 * A bare `spawn('bun', ...)` fails with ENOENT when bun is only reachable
 * through a shim (bun.cmd / bun.ps1 on Windows, or a shell alias), which is how
 * it is commonly installed. Resolve a concrete path instead of trusting PATH
 * lookup, and fall back to the shell when only a shim exists.
 */
function resolveBun() {
  const isWindows = process.platform === 'win32';
  const exeName = isWindows ? 'bun.exe' : 'bun';

  // Running under bun already: reuse this exact binary.
  if (path.basename(process.execPath).startsWith('bun')) {
    return { command: process.execPath, shell: false };
  }

  const candidates = [];
  if (process.env.E2E_BUN_PATH) candidates.push(process.env.E2E_BUN_PATH);
  if (process.env.BUN_INSTALL) {
    candidates.push(path.join(process.env.BUN_INSTALL, 'bin', exeName));
  }
  candidates.push(path.join(os.homedir(), '.bun', 'bin', exeName));

  const which = spawnSync(isWindows ? 'where' : 'which', ['bun'], {
    encoding: 'utf8',
  });
  if (which.status === 0) {
    candidates.push(
      ...String(which.stdout)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    );
  }

  const existing = candidates.filter((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  });

  // Prefer a native executable over a .cmd/.bat shim; those need a shell.
  const native = existing.find((candidate) =>
    isWindows ? candidate.toLowerCase().endsWith('.exe') : true,
  );
  const chosen = native ?? existing[0];

  if (!chosen) {
    // Last resort: let the OS resolve it through the shell.
    return { command: 'bun', shell: isWindows };
  }

  return {
    command: chosen,
    shell: isWindows && !chosen.toLowerCase().endsWith('.exe'),
  };
}

const bun = resolveBun();

const TARGETS = {
  api: {
    cwd: workspace('server'),
    // The auth limiter allows only 10 login attempts per IP per 15 minutes,
    // which a full e2e run exceeds. This flag lets requests carrying the
    // `x-e2e-test` header skip the limiter. The server ignores it when
    // NODE_ENV=production.
    env: { E2E_BYPASS_RATE_LIMIT: 'true' },
  },
  storefront: { cwd: workspace('client') },
  admin: { cwd: workspace('admin') },
};

const requested = process.argv.slice(2).filter(Boolean);
const selected = (requested.length > 0 ? requested : Object.keys(TARGETS)).map(
  (key) => {
    const target = TARGETS[key];
    if (!target) {
      throw new Error(
        `Unknown workspace "${key}". Expected one of: ${Object.keys(TARGETS).join(', ')}`,
      );
    }
    return { name: key, ...target };
  },
);

const processes = selected.map((server) => {
  const prefix = `[${server.name}]`;
  const p = spawn(bun.command, ['run', 'dev'], {
    cwd: server.cwd,
    shell: bun.shell,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...server.env },
  });

  p.on('error', (error) => {
    process.stderr.write(`${prefix} failed to start: ${error.message}\n`);
  });

  p.stdout.on('data', (chunk) => process.stdout.write(`${prefix} ${chunk}`));
  p.stderr.on('data', (chunk) => process.stderr.write(`${prefix} ${chunk}`));
  p.on('exit', (code, signal) => {
    process.stdout.write(`${prefix} exited (code=${code}, signal=${signal})\n`);
  });

  return p;
});

const shutdown = () => {
  for (const p of processes) {
    try {
      p.kill('SIGTERM');
    } catch {
      // ignore
    }
  }
};

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});
process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
process.on('exit', shutdown);
