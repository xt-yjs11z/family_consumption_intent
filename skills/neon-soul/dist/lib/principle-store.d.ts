/**
 * Principle store with LLM-based semantic matching for signal accumulation.
 *
 * v0.2.0: Migrated from embedding-based cosine similarity to LLM-based
 * semantic matching. This eliminates the need for embedding computations
 * and centroid updates - similarity is now determined by LLM semantic comparison.
 *
 * Cross-Reference: docs/plans/2026-02-12-llm-based-similarity.md (Stage 4)
 */
import type { Signal, GeneralizedSignal } from '../types/signal.js';
import type { Principle } from '../types/principle.js';
import type { SoulCraftDimension } from '../types/dimensions.js';
import type { LLMProvider } from '../types/llm.js';
export interface PrincipleStore {
    principles: Map<string, Principle>;
    addSignal(signal: Signal, dimension?: SoulCraftDimension): Promise<AddSignalResult>;
    /** Add a generalized signal (uses generalized text for principle, preserves original in provenance) */
    addGeneralizedSignal(generalizedSignal: GeneralizedSignal, dimension?: SoulCraftDimension): Promise<AddSignalResult>;
    getPrinciples(): Principle[];
    getPrinciplesAboveN(threshold: number): Principle[];
    /** Update similarity threshold for future signal matching (N-counts preserved) */
    setThreshold(threshold: number): void;
    /**
     * PBD Stage 6: Get signals that didn't cluster to any principle.
     * These are signals where bestSimilarityToExisting < threshold.
     */
    getOrphanedSignals(): OrphanedSignal[];
}
export interface AddSignalResult {
    action: 'created' | 'reinforced' | 'skipped';
    principleId: string;
    similarity: number;
    /**
     * M-1 FIX: Best similarity to ANY existing principle (for orphan tracking).
     * When action='created' and this is below threshold, the signal is orphaned.
     */
    bestSimilarityToExisting: number;
}
/**
 * PBD Stage 6: Orphaned signal with context about why it didn't cluster.
 */
export interface OrphanedSignal {
    /** Original signal that didn't cluster */
    signal: Signal;
    /** Best similarity achieved (below threshold) */
    bestSimilarity: number;
    /** The principle it created (single-signal principle) */
    principleId: string;
}
/**
 * Create a new principle store.
 *
 * @param llm - LLM provider for semantic dimension classification and matching
 * @param similarityThreshold - Threshold for principle matching (default 0.7 = "medium" LLM confidence)
 * @see docs/issues/2026-02-10-generalized-signal-threshold-gap.md
 * @see docs/plans/2026-02-12-llm-based-similarity.md (Stage 4)
 */
export declare function createPrincipleStore(llm: LLMProvider, initialThreshold?: number): PrincipleStore;
//# sourceMappingURL=principle-store.d.ts.map