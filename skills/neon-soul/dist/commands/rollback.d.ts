/**
 * Rollback Command
 *
 * Restore previous SOUL.md from backup.
 *
 * Usage:
 *   npx tsx src/commands/rollback.ts [options]
 *
 * Options:
 *   --list              List available backups
 *   --backup <id>       Restore specific backup (timestamp)
 *   --workspace <path>  Workspace path (default: ~/.openclaw/workspace)
 *   --force             Skip confirmation prompt
 *   --help              Show help message
 *
 * Output:
 *   Available backups:
 *     1. 2026-02-07T10-30-00-000Z (2 hours ago)
 *     2. 2026-02-06T15-45-00-000Z (1 day ago)
 *
 *   Restored: SOUL.md from 2026-02-07T10-30-00-000Z
 */
/**
 * Programmatic entry point for skill loader.
 */
export declare function run(args: string[]): Promise<{
    success: boolean;
    message?: string;
    data?: unknown;
    error?: string;
}>;
//# sourceMappingURL=rollback.d.ts.map