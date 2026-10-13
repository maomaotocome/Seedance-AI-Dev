import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stateDir = join(
  tmpdir(),
  `seedance-preview-${createHash('sha256').update(root).digest('hex').slice(0, 12)}`
);
mkdirSync(stateDir, { recursive: true });
const stateFile = join(stateDir, 'process.json');
const log = join(stateDir, 'server.log');
const command = process.argv[2] || 'start';
const port = Number(process.env.PREVIEW_PORT || 3002);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error('Invalid PREVIEW_PORT');
const url = `http://localhost:${port}`;
const saved = existsSync(stateFile)
  ? JSON.parse(readFileSync(stateFile, 'utf8'))
  : null;
const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};
const startedAt = (pid) => {
  try {
    return execFileSync('ps', ['-p', String(pid), '-o', 'lstart='], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
};
const owned =
  saved &&
  saved.root === root &&
  alive(saved.pid) &&
  saved.startedAt &&
  startedAt(saved.pid) === saved.startedAt;
if (command === 'stop') {
  if (owned) {
    // Only the process group created and recorded by this preview launcher.
    process.kill(-saved.pid, 'SIGTERM');
    console.log(`Stopped local preview at ${saved.url}`);
  }
  if (existsSync(stateFile)) unlinkSync(stateFile);
} else if (command === 'status') {
  console.log(
    owned
      ? `Running: ${saved.url}\nLog: ${log}`
      : 'Preview is stopped. Run pnpm preview.'
  );
} else if (command === 'start') {
  if (owned) {
    console.log(`Already running: ${saved.url}\nLog: ${log}`);
  } else {
    let occupied = false;
    try {
      await fetch(url, { signal: AbortSignal.timeout(2000) });
      occupied = true;
    } catch {
      /* no reachable server */
    }
    if (occupied)
      throw new Error(
        `${url} already serves another process. Use that preview or choose PREVIEW_PORT.`
      );
    const fd = openSync(log, 'a');
    const require = createRequire(import.meta.url);
    const child = spawn(
      process.execPath,
      [
        require.resolve('next/dist/bin/next'),
        'dev',
        '--turbopack',
        '-H',
        'localhost',
        '-p',
        String(port),
      ],
      {
        cwd: root,
        detached: true,
        stdio: ['ignore', fd, fd],
        env: process.env,
      }
    );
    closeSync(fd);
    await new Promise((resolve, reject) => {
      child.once('spawn', resolve);
      child.once('error', reject);
    });
    child.unref();
    writeFileSync(
      stateFile,
      JSON.stringify({
        pid: child.pid,
        url,
        root,
        startedAt: startedAt(child.pid),
      })
    );
    const deadline = Date.now() + 30000;
    let ready = false;
    while (Date.now() < deadline && alive(child.pid)) {
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          signal: AbortSignal.timeout(2500),
        });
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        /* server is starting */
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    console.log(
      `${ready ? 'Ready' : 'Started; HTTP readiness not yet confirmed'}: ${url}\nLog: ${log}\nStop: pnpm preview:stop`
    );
    if (!ready) process.exitCode = 1;
  }
} else throw new Error('Use start, stop, or status');
