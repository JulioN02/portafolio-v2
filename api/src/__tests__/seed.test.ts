import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const apiDir = path.resolve(__dirname, '../..');

/**
 * Seed fail-fast guard (admin-credential-hardening).
 *
 * Spawns the real seed scripts as subprocesses with a scrubbed environment:
 * ADMIN_INITIAL_PASSWORD removed/short → the seed MUST exit(1) BEFORE any DB
 * work. DATABASE_URL/DIRECT_URL are pointed at a dead endpoint (process.env
 * takes precedence over Prisma's auto-loaded .env) so a buggy (lenient) seed
 * can never reach a real database from inside the test.
 */
function runSeed(envOverrides: NodeJS.ProcessEnv): { status: number; stderr: string } {
  const env: NodeJS.ProcessEnv = { ...process.env };
  // Override, don't delete: Prisma Client auto-loads api/.env, and process.env
  // wins over .env. A dead endpoint guarantees no real DB connection.
  env.DATABASE_URL = 'postgresql://nope:nope@127.0.0.1:1/nope';
  env.DIRECT_URL = 'postgresql://nope:nope@127.0.0.1:1/nope';
  delete env.ADMIN_INITIAL_PASSWORD;
  Object.assign(env, envOverrides);

  try {
    execFileSync(process.execPath, ['--import', 'tsx', 'prisma/seed.ts'], {
      cwd: apiDir,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30000,
    });
    return { status: 0, stderr: '' };
  } catch (err) {
    const e = err as { status?: number; stderr?: Buffer | string };
    return { status: e.status ?? -1, stderr: String(e.stderr ?? '') };
  }
}

describe('Seed fail-fast (admin credentials)', () => {
  it('exits 1 when ADMIN_INITIAL_PASSWORD is unset', () => {
    const { status, stderr } = runSeed({});
    expect(status).toBe(1);
    expect(stderr).toMatch(/ADMIN_INITIAL_PASSWORD/);
  });

  it('exits 1 when ADMIN_INITIAL_PASSWORD is shorter than 12 characters', () => {
    const { status, stderr } = runSeed({ ADMIN_INITIAL_PASSWORD: 'short-pass' });
    expect(status).toBe(1);
    expect(stderr).toMatch(/ADMIN_INITIAL_PASSWORD/);
  });

  it('does not contain the admin123 literal in either seed file', () => {
    for (const file of ['prisma/seed.ts', 'prisma/seed-full.ts']) {
      const source = readFileSync(path.join(apiDir, file), 'utf8');
      expect(source).not.toContain('admin123');
    }
  });
});