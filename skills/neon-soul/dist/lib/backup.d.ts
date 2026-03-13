/**
 * Backup and rollback utilities for safe soul updates.
 * Provides safety net before any SOUL.md modifications.
 */
export interface Backup {
    path: string;
    timestamp: string;
    filename: string;
}
/**
 * Create backup of file before modification.
 * Returns path to backup file.
 *
 * I-1 FIX: Now accepts optional workspacePath to ensure backups are stored
 * in a consistent location that rollback can discover.
 *
 * @param filePath - File to backup
 * @param workspacePath - Optional workspace path for backup storage (default: dirname of filePath)
 */
export declare function backupFile(filePath: string, workspacePath?: string): string;
/**
 * List available backups for rollback.
 */
export declare function listBackups(workspacePath: string): Backup[];
/**
 * Rollback to most recent backup.
 * Returns the backup that was restored.
 */
export declare function rollback(workspacePath: string): Backup | null;
/**
 * Commit soul update to git if workspace is a repo.
 * Uses execFileSync with array arguments to prevent command injection (CR-1).
 */
export declare function commitSoulUpdate(soulPath: string, message: string): Promise<void>;
//# sourceMappingURL=backup.d.ts.map