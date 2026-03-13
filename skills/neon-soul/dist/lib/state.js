/**
 * Incremental processing state management.
 * Tracks what has been processed to enable efficient synthesis.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
const DEFAULT_STATE = {
    lastRun: {
        timestamp: '',
        memoryFiles: {},
        soulVersion: '',
        contentSize: 0,
    },
    metrics: {
        totalSignalsProcessed: 0,
        totalPrinciplesGenerated: 0,
        totalAxiomsGenerated: 0,
    },
};
/**
 * Get state file path for workspace.
 */
function getStatePath(workspacePath) {
    return resolve(workspacePath, '.neon-soul', 'state.json');
}
/**
 * Load synthesis state from workspace.
 */
export function loadState(workspacePath) {
    const statePath = getStatePath(workspacePath);
    if (!existsSync(statePath)) {
        return { ...DEFAULT_STATE };
    }
    try {
        const content = readFileSync(statePath, 'utf-8');
        const parsed = JSON.parse(content);
        // Merge with defaults to handle missing fields
        return {
            lastRun: {
                ...DEFAULT_STATE.lastRun,
                ...parsed.lastRun,
            },
            metrics: {
                ...DEFAULT_STATE.metrics,
                ...parsed.metrics,
            },
        };
    }
    catch {
        // Corrupted state file - return defaults
        return { ...DEFAULT_STATE };
    }
}
/**
 * Save synthesis state to workspace.
 * MN-4 FIX: Uses atomic write (temp + rename) for consistency with persistence.ts.
 */
export function saveState(workspacePath, state) {
    const statePath = getStatePath(workspacePath);
    const stateDir = dirname(statePath);
    if (!existsSync(stateDir)) {
        mkdirSync(stateDir, { recursive: true });
    }
    // MN-4 FIX: Atomic write using temp file + rename
    const tempPath = resolve(stateDir, `.tmp-state-${randomUUID()}`);
    writeFileSync(tempPath, JSON.stringify(state, null, 2), 'utf-8');
    renameSync(tempPath, statePath);
}
/**
 * Check if synthesis should run based on content threshold.
 * IM-4 FIX: Compares content delta from last run, not absolute size.
 * Returns true if new content since last run exceeds threshold (default 2000 chars).
 */
export function shouldRunSynthesis(currentContentSize, threshold = 2000, lastRunContentSize = 0) {
    const delta = currentContentSize - lastRunContentSize;
    return delta >= threshold;
}
//# sourceMappingURL=state.js.map