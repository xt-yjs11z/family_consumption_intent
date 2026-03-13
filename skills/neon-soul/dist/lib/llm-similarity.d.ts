/**
 * LLM-based semantic similarity module.
 *
 * Replaces vector-based cosine similarity with LLM semantic comparison.
 * Uses the agent's existing LLM, eliminating third-party embedding dependencies.
 *
 * Cross-Reference: docs/plans/2026-02-12-llm-based-similarity.md (Stage 1)
 */
import type { LLMProvider } from '../types/llm.js';
/**
 * Result from a semantic equivalence check.
 */
export interface SemanticEquivalenceResult {
    /** Whether the texts are semantically equivalent */
    equivalent: boolean;
    /** Confidence score (0-1): high=0.9, medium=0.7, low=0.5 */
    confidence: number;
}
/**
 * Result from finding the best semantic match.
 */
export interface SemanticMatchResult {
    /** The best matching text (null if no match meets threshold) */
    match: string | null;
    /** Index of best match in candidates array (-1 if no match) */
    index: number;
    /** Confidence score of best match (0-1) */
    confidence: number;
}
/**
 * Check if two texts are semantically equivalent using LLM.
 *
 * @param textA - First text to compare
 * @param textB - Second text to compare
 * @param llm - LLM provider for semantic comparison
 * @returns Equivalence result with confidence score
 */
export declare function isSemanticallyEquivalent(textA: string, textB: string, llm: LLMProvider): Promise<SemanticEquivalenceResult>;
/**
 * Find the best semantic match for a text among candidates using LLM.
 *
 * Uses batch optimization to reduce LLM calls from O(n) to O(1) for most cases.
 * Falls back to iterative comparison on malformed batch responses.
 *
 * @param text - Text to find match for
 * @param candidates - Array of candidate texts to match against
 * @param llm - LLM provider for semantic comparison
 * @param threshold - Minimum confidence threshold (default: 0.7)
 * @returns Best match result with index and confidence
 */
export declare function findBestSemanticMatch(text: string, candidates: string[], llm: LLMProvider, threshold?: number): Promise<SemanticMatchResult>;
//# sourceMappingURL=llm-similarity.d.ts.map