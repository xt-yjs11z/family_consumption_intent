/**
 * Semantic matching for principle deduplication.
 *
 * v0.2.0: Migrated from embedding-based cosine similarity to LLM-based
 * semantic comparison. This eliminates the @xenova/transformers dependency.
 *
 * Cross-Reference: docs/plans/2026-02-12-llm-based-similarity.md (Stage 2)
 */
import { findBestSemanticMatch } from './llm-similarity.js';
/** Default match threshold (equivalent to "medium" LLM confidence) */
export const DEFAULT_MATCH_THRESHOLD = 0.7;
/**
 * Compute cosine similarity between two embeddings.
 * Assumes vectors are L2-normalized (dot product = cosine similarity).
 *
 * @deprecated This function will be removed in a future version.
 * Use LLM-based semantic matching via findBestMatch() instead.
 * Kept temporarily for backward compatibility with:
 * - ollama-provider.ts (Stage 4 will remove)
 * - trajectory.ts (Stage 4 will remove)
 * - principle-store.ts (Stage 4 will remove)
 * - evolution.ts (Stage 4 will remove)
 * - interview.ts (Stage 4 will remove)
 */
export function cosineSimilarity(a, b) {
    if (a.length !== b.length) {
        throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
    }
    let dot = 0;
    for (let i = 0; i < a.length; i++) {
        const aVal = a[i];
        const bVal = b[i];
        if (aVal !== undefined && bVal !== undefined) {
            dot += aVal * bVal;
        }
    }
    return dot;
}
/**
 * Find the best matching principle for a given text using LLM semantic comparison.
 *
 * @param text - The text to find a match for (e.g., signal text)
 * @param principles - Array of principles to match against
 * @param llm - LLM provider for semantic comparison
 * @param threshold - Minimum confidence threshold (default: 0.7, "medium" confidence)
 * @returns MatchResult with best matching principle and confidence
 *
 * @example
 * const result = await findBestMatch(
 *   "Be honest about limitations",
 *   principles,
 *   ollamaProvider,
 *   0.7
 * );
 * if (result.isMatch) {
 *   console.log(`Matched: ${result.principle?.text}`);
 * }
 */
export async function findBestMatch(text, principles, llm, threshold = DEFAULT_MATCH_THRESHOLD) {
    if (principles.length === 0) {
        return { principle: null, confidence: 0, isMatch: false };
    }
    // Extract principle texts for comparison
    const candidateTexts = principles.map((p) => p.text);
    // Use LLM-based semantic matching
    const semanticResult = await findBestSemanticMatch(text, candidateTexts, llm, threshold);
    // Map result back to principle
    if (semanticResult.index === -1 || semanticResult.match === null) {
        return {
            principle: null,
            confidence: semanticResult.confidence,
            isMatch: false,
        };
    }
    const matchedPrinciple = principles[semanticResult.index];
    if (!matchedPrinciple) {
        // Safety check - should not happen
        return { principle: null, confidence: 0, isMatch: false };
    }
    return {
        principle: matchedPrinciple,
        confidence: semanticResult.confidence,
        isMatch: semanticResult.confidence >= threshold,
    };
}
//# sourceMappingURL=matcher.js.map