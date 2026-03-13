/**
 * Shared Path Resolution Utilities
 *
 * Provides consistent path resolution across all commands.
 * Extracted from synthesize.ts per twin review IM-2.
 */
/**
 * Default OpenClaw workspace paths.
 */
export declare const OPENCLAW_DEFAULTS: {
    /** Default memory directory */
    readonly memory: "~/.openclaw/workspace/memory";
    /** Default SOUL.md output location */
    readonly output: "~/.openclaw/workspace/SOUL.md";
    /** Default workspace root */
    readonly workspace: "~/.openclaw/workspace";
};
/**
 * Get default memory path, expanding ~ to home directory.
 * IM-5 FIX: Use os.homedir() instead of fallback to '~' which doesn't expand.
 */
export declare function getDefaultMemoryPath(): string;
/**
 * Get default output path, expanding ~ to home directory.
 * IM-5 FIX: Use os.homedir() instead of fallback to '~' which doesn't expand.
 */
export declare function getDefaultOutputPath(): string;
/**
 * Get default workspace path, expanding ~ to home directory.
 * IM-5 FIX: Use os.homedir() instead of fallback to '~' which doesn't expand.
 */
export declare function getDefaultWorkspacePath(): string;
/**
 * Derive workspace path from memory path.
 * Handles both `/memory` and `/memory/` suffixes.
 *
 * @example
 * getWorkspaceFromMemory('/path/to/workspace/memory') // '/path/to/workspace'
 * getWorkspaceFromMemory('/path/to/workspace/memory/') // '/path/to/workspace'
 */
export declare function getWorkspaceFromMemory(memoryPath: string): string;
/**
 * Resolve a path, handling ~ expansion and relative paths.
 * IM-5 FIX: Use os.homedir() instead of fallback to '' which creates invalid paths.
 */
export declare function resolvePath(inputPath: string, defaultPath?: string): string;
/**
 * Get .neon-soul directory path for a workspace.
 */
export declare function getNeonSoulPath(workspacePath: string): string;
//# sourceMappingURL=paths.d.ts.map