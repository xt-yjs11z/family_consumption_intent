/**
 * Trace Command
 *
 * Quick single-axiom provenance lookup.
 * Focused, minimal output for answering "where did this come from?"
 *
 * Usage:
 *   npx tsx src/commands/trace.ts <axiom-id>
 *
 * Options:
 *   <axiom-id>          Axiom ID or CJK character to trace
 *   --workspace <path>  Workspace path (default: ~/.openclaw/workspace)
 *   --help              Show help message
 *
 * Output:
 *   誠 (honesty over performance)
 *   └── "be honest about capabilities" (N=4)
 *       ├── memory/preferences/communication.md:23
 *       └── memory/diary/2024-03-15.md:45
 *
 * Note: For full provenance exploration, use the audit command:
 *   npx tsx src/commands/audit.ts --list
 *   npx tsx src/commands/audit.ts --stats
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
//# sourceMappingURL=trace.d.ts.map