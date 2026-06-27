import { describe, it, expect, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

const CLI_PATH = existsSync('dist/cli.js') ? 'node dist/cli.js' : 'npx tsx src/cli.ts';

function runCli(args: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(`${CLI_PATH} ${args}`, {
      encoding: 'utf-8',
      timeout: 10000,
      env: { ...process.env, NODE_ENV: 'test' },
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
      exitCode: err.status ?? 1,
    };
  }
}

describe('CLI', () => {
  describe('--version', () => {
    it('prints version', () => {
      const result = runCli('--version');
      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('1.0.0');
    });
  });

  describe('--help', () => {
    it('prints help with all commands', () => {
      const result = runCli('--help');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('track');
      expect(result.stdout).toContain('analyze');
      expect(result.stdout).toContain('history');
      expect(result.stdout).toContain('status');
      expect(result.stdout).toContain('budget');
    });
  });

  describe('status command', () => {
    it('shows tracker status', () => {
      const result = runCli('status');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('AI Cost Optimizer Status');
      expect(result.stdout).toContain('Trackers Configured');
    });
  });

  describe('analyze command', () => {
    it('runs analysis without errors', () => {
      const result = runCli('analyze');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Cost Analysis Report');
    });

    it('accepts --since flag', () => {
      const result = runCli('analyze --since 1');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Cost Analysis Report');
    });
  });

  describe('history command', () => {
    it('shows usage history', () => {
      const result = runCli('history --hours 1');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Usage History');
    });
  });

  describe('budget command', () => {
    it('shows budget placeholder', () => {
      const result = runCli('budget');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Budget');
    });
  });
});
