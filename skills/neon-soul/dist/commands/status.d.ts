/**
 * Status Command
 *
 * Shows current soul synthesis state.
 *
 * Usage:
 *   npx tsx src/commands/status.ts [options]
 *
 * Options:
 *   --workspace <path>  Workspace path (default: ~/.openclaw/workspace)
 *   --verbose           Show detailed information
 *   --help              Show help message
 *
 * Output:
 *   Last synthesis: 2026-02-07T10:30:00Z
 *   Pending memory: 1,234 chars (above threshold)
 *
 *   Counts:
 *     Signals: 42
 *     Principles: 18
 *     Axioms: 7
 *
 *   Dimension Coverage: 5/7 (71%)
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
//# sourceMappingURL=status.d.ts.map