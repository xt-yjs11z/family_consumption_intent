/**
 * Signal Generalization - LLM-based transformation of signals to abstract principles.
 * Implements PBD "Principle Synthesis" for better semantic clustering.
 * @see docs/plans/2026-02-09-signal-generalization.md
 */
import type { Signal, GeneralizedSignal } from '../types/signal.js';
import type { LLMProvider } from '../types/llm.js';
/** Prompt version for cache invalidation. Bump when changing prompt or validation. */
export declare const PROMPT_VERSION = "v1.0.0";
export { buildPrompt, validateGeneralization, MAX_OUTPUT_LENGTH } from './generalization-helpers.js';
/**
 * Generalize a single signal using LLM.
 *
 * @param llm - LLM provider (required)
 * @param signal - Signal to generalize
 * @param model - Model name for provenance (default: 'unknown')
 * @returns GeneralizedSignal with abstract principle and embedding
 * @throws LLMRequiredError if llm is null/undefined
 */
export declare function generalizeSignal(llm: LLMProvider | null | undefined, signal: Signal, model?: string): Promise<GeneralizedSignal>;
/**
 * Generalize multiple signals in batch.
 *
 * Uses batch processing for efficiency with partial failure handling:
 * - Successful generalizations proceed normally
 * - Failed generalizations use original text as fallback
 *
 * @param llm - LLM provider (required)
 * @param signals - Signals to generalize
 * @param model - Model name for provenance (default: 'unknown')
 * @param options - Batch processing options
 * @returns Array of GeneralizedSignal in same order as input
 * @throws LLMRequiredError if llm is null/undefined
 */
export declare function generalizeSignals(llm: LLMProvider | null | undefined, signals: Signal[], model?: string, options?: {
    /** Maximum signals per batch (default: 50) */
    batchSize?: number;
    /** Log first N generalizations per batch (default: 3) */
    logSampleSize?: number;
    /** Log random percentage of remainder (default: 0.05 = 5%) */
    logSamplePercent?: number;
}): Promise<GeneralizedSignal[]>;
/**
 * Generalize signals with caching.
 * Cache is invalidated when prompt version changes.
 *
 * Note on fallback behavior: When a signal uses fallback (usedFallback: true),
 * the embedding is generated from the original signal text, not generalized text.
 * This creates a mixed embedding space. Monitor fallback rate and keep below 10%.
 *
 * @param llm - LLM provider (required)
 * @param signals - Signals to generalize
 * @param model - Model name for provenance
 * @param options - Batch processing options (forwarded to generalizeSignals)
 * @returns Array of GeneralizedSignal (from cache or freshly generated)
 *
 * @see docs/issues/2026-02-09-signal-generalization-impl-findings.md (Finding #2, #9)
 */
export declare function generalizeSignalsWithCache(llm: LLMProvider | null | undefined, signals: Signal[], model?: string, options?: {
    batchSize?: number;
    logSampleSize?: number;
    logSamplePercent?: number;
}): Promise<GeneralizedSignal[]>;
/**
 * Clear the generalization cache.
 * Useful for testing or when prompt template is updated.
 */
export declare function clearGeneralizationCache(): void;
/**
 * Get cache statistics for monitoring.
 * @returns Current cache size and max size
 */
export declare function getCacheStats(): {
    size: number;
    maxSize: number;
};
//# sourceMappingURL=signal-generalizer.d.ts.map