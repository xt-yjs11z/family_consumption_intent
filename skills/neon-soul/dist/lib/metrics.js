/**
 * Compression metrics for measuring soul synthesis effectiveness.
 * Tracks compression ratio, semantic density, and dimension coverage.
 */
import { SOULCRAFT_DIMENSIONS } from '../types/dimensions.js';
import { LLMRequiredError } from '../types/llm.js';
import { classifyDimension } from './semantic-classifier.js';
/**
 * Count tokens in text (simple word-based approximation).
 * For accurate counts, use tiktoken or similar.
 */
export function countTokens(text) {
    // Simple word-based count - multiply by 1.3 for subword tokenization approximation
    return Math.ceil(text.split(/\s+/).filter((w) => w.length > 0).length * 1.3);
}
/**
 * Calculate compression ratio with division guard.
 */
export function compressionRatio(originalTokens, compressedTokens) {
    return originalTokens / Math.max(1, compressedTokens);
}
/**
 * Calculate semantic density (principles per 100 tokens).
 */
export function semanticDensity(principleCount, tokenCount) {
    if (tokenCount === 0)
        return 0;
    return (principleCount / tokenCount) * 100;
}
/**
 * Get dimension for a signal, using LLM classification as fallback.
 * Signals should already have dimension set during extraction.
 * LLM classification only needed for legacy signals without dimension.
 *
 * @throws LLMRequiredError if signal lacks dimension and llm is not provided
 */
async function getDimensionForSignal(signal, llm) {
    // Use existing dimension if available (set during signal extraction)
    if (signal.dimension) {
        return signal.dimension;
    }
    // CR6-5: Explicit guard - LLM required for legacy signals without dimension
    if (!llm) {
        throw new LLMRequiredError('getDimensionForSignal (signal lacks pre-classified dimension)');
    }
    // Fallback to LLM classification for legacy signals without dimension
    return classifyDimension(llm, signal.text);
}
/**
 * Calculate dimension coverage from signals, principles, and axioms.
 * Uses signal's existing dimension field, with LLM fallback for legacy signals.
 */
export async function calculateDimensionCoverage(llm, signals, principles, axioms) {
    // Get dimensions for all signals (parallel for performance)
    const signalDimensions = await Promise.all(signals.map((s) => getDimensionForSignal(s, llm)));
    const coverage = [];
    for (const dimension of SOULCRAFT_DIMENSIONS) {
        coverage.push({
            dimension,
            signalCount: signalDimensions.filter((d) => d === dimension).length,
            principleCount: principles.filter((p) => p.dimension === dimension).length,
            axiomCount: axioms.filter((a) => a.dimension === dimension).length,
        });
    }
    return coverage;
}
/**
 * Calculate full compression metrics.
 */
export async function calculateMetrics(llm, originalText, compressedText, signals, principles, axioms, reinforcedCount) {
    const originalTokens = countTokens(originalText);
    const compressedTokens = countTokens(compressedText);
    return {
        originalTokens,
        compressedTokens,
        compressionRatio: compressionRatio(originalTokens, compressedTokens),
        semanticDensity: semanticDensity(principles.length, compressedTokens),
        signalCount: signals.length,
        principleCount: principles.length,
        axiomCount: axioms.length,
        dimensionCoverage: await calculateDimensionCoverage(llm, signals, principles, axioms),
        convergenceRate: signals.length > 0 ? reinforcedCount / signals.length : 0,
    };
}
/**
 * Format metrics as a report string.
 */
export function formatMetricsReport(metrics) {
    const lines = [
        '## Compression Metrics',
        '',
        `| Metric | Value |`,
        `|--------|-------|`,
        `| Original tokens | ${metrics.originalTokens} |`,
        `| Compressed tokens | ${metrics.compressedTokens} |`,
        `| **Compression ratio** | **${metrics.compressionRatio.toFixed(2)}:1** |`,
        `| Semantic density | ${metrics.semanticDensity.toFixed(2)} principles/100 tokens |`,
        `| Signals extracted | ${metrics.signalCount} |`,
        `| Principles formed | ${metrics.principleCount} |`,
        `| Axioms promoted | ${metrics.axiomCount} |`,
        `| Convergence rate | ${(metrics.convergenceRate * 100).toFixed(1)}% |`,
        '',
        '### Dimension Coverage',
        '',
        '| Dimension | Signals | Principles | Axioms |',
        '|-----------|---------|------------|--------|',
    ];
    for (const dim of metrics.dimensionCoverage) {
        lines.push(`| ${dim.dimension} | ${dim.signalCount} | ${dim.principleCount} | ${dim.axiomCount} |`);
    }
    return lines.join('\n');
}
//# sourceMappingURL=metrics.js.map