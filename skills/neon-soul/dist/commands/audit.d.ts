/**
 * Audit Command
 *
 * Traces axiom provenance back to source signals.
 * Provides full transparency into identity formation.
 *
 * Usage:
 *   npx tsx src/commands/audit.ts [options] [axiom-id]
 *
 * Options:
 *   <axiom-id>         Show provenance chain for specific axiom
 *   --stats            Show audit statistics
 *   --list             List all axioms with brief provenance
 *   --workspace <path> Workspace path (default: ~/.openclaw/workspace)
 *   --help             Show help message
 *
 * Output:
 *   Axiom: 誠 (honesty over performance)
 *   ├── Principle: "be honest about capabilities" (N=4)
 *   │   ├── Signal: "I prefer honest answers" (memory/preferences/communication.md:23)
 *   │   ├── Signal: "Don't sugarcoat feedback" (memory/diary/2024-03-15.md:45)
 *   │   └── ...
 *   └── Created: 2024-03-20T14:30:00Z
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
//# sourceMappingURL=audit.d.ts.map