/**
 * Incremental processing state management.
 * Tracks what has been processed to enable efficient synthesis.
 */
export interface MemoryFileState {
    file: string;
    line: number;
    processedAt: string;
}
export interface SynthesisState {
    lastRun: {
        timestamp: string;
        memoryFiles: Record<string, MemoryFileState>;
        soulVersion: string;
        contentSize: number;
    };
    metrics: {
        totalSignalsProcessed: number;
        totalPrinciplesGenerated: number;
        totalAxiomsGenerated: number;
    };
}
/**
 * Load synthesis state from workspace.
 */
export declare function loadState(workspacePath: string): SynthesisState;
/**
 * Save synthesis state to workspace.
 * MN-4 FIX: Uses atomic write (temp + rename) for consistency with persistence.ts.
 */
export declare function saveState(workspacePath: string, state: SynthesisState): void;
/**
 * Check if synthesis should run based on content threshold.
 * IM-4 FIX: Compares content delta from last run, not absolute size.
 * Returns true if new content since last run exceeds threshold (default 2000 chars).
 */
export declare function shouldRunSynthesis(currentContentSize: number, threshold?: number, lastRunContentSize?: number): boolean;
//# sourceMappingURL=state.d.ts.map