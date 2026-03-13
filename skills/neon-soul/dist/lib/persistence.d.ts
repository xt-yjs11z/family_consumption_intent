/**
 * Persistence Layer for Synthesis Data
 *
 * Persists signals, principles, and axioms to .neon-soul/ directory
 * for consumption by status, trace, and audit commands.
 *
 * Directory structure:
 *   .neon-soul/
 *     state.json       # Synthesis state (handled by state.ts)
 *     signals.json     # Extracted signals with provenance
 *     principles.json  # Generated principles with N-counts
 *     axioms.json      # Promoted axioms with full provenance
 */
import type { Signal } from '../types/signal.js';
import type { Principle } from '../types/principle.js';
import type { Axiom } from '../types/axiom.js';
/**
 * Persisted synthesis data.
 */
export interface SynthesisData {
    /** Synthesis timestamp (null if never run) */
    timestamp: string | null;
    /** Extracted signals */
    signals: Signal[];
    /** Generated principles */
    principles: Principle[];
    /** Promoted axioms */
    axioms: Axiom[];
    /** Metrics */
    metrics: {
        signalCount: number;
        principleCount: number;
        axiomCount: number;
        dimensionCoverage: number;
    };
}
/**
 * IM-4 FIX: Atomic file write using temp file + rename.
 * Prevents corruption if process crashes mid-write.
 * CR-2 FIX: Exported for use in pipeline.ts SOUL.md write.
 * I-5 FIX: Clean up temp file on rename failure.
 */
export declare function writeFileAtomic(filePath: string, content: string): void;
/**
 * Save signals to .neon-soul/signals.json.
 */
export declare function saveSignals(workspacePath: string, signals: Signal[]): void;
/**
 * Save principles to .neon-soul/principles.json.
 */
export declare function savePrinciples(workspacePath: string, principles: Principle[]): void;
/**
 * Save axioms to .neon-soul/axioms.json.
 */
export declare function saveAxioms(workspacePath: string, axioms: Axiom[]): void;
/**
 * Save all synthesis data at once.
 *
 * I-3 NOTE: These writes are sequential, not transactional. A crash between
 * writes could leave files in inconsistent state. This is acceptable because:
 * 1. Files can be regenerated from source memory on next run
 * 2. State file tracks last successful run timestamp
 * 3. Atomic directory rename adds significant complexity
 *
 * If strict consistency is needed, consider writing to temp dir then renaming.
 */
export declare function saveSynthesisData(workspacePath: string, signals: Signal[], principles: Principle[], axioms: Axiom[]): void;
/**
 * Load signals from .neon-soul/signals.json.
 */
export declare function loadSignals(workspacePath: string): Signal[];
/**
 * Load principles from .neon-soul/principles.json.
 */
export declare function loadPrinciples(workspacePath: string): Principle[];
/**
 * Load axioms from .neon-soul/axioms.json.
 */
export declare function loadAxioms(workspacePath: string): Axiom[];
/**
 * Load all synthesis data.
 */
export declare function loadSynthesisData(workspacePath: string): SynthesisData | null;
//# sourceMappingURL=persistence.d.ts.map