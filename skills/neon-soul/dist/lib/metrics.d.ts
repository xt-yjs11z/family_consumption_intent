/**
 * Compression metrics for measuring soul synthesis effectiveness.
 * Tracks compression ratio, semantic density, and dimension coverage.
 */
import type { Signal } from '../types/signal.js';
import type { Principle } from '../types/principle.js';
import type { Axiom } from '../types/axiom.js';
import type { DimensionCoverage } from '../types/dimensions.js';
import type { LLMProvider } from '../types/llm.js';
export interface CompressionMetrics {
    originalTokens: number;
    compressedTokens: number;
    compressionRatio: number;
    semanticDensity: number;
    signalCount: number;
    principleCount: number;
    axiomCount: number;
    dimensionCoverage: DimensionCoverage[];
    convergenceRate: number;
}
/**
 * Count tokens in text (simple word-based approximation).
 * For accurate counts, use tiktoken or similar.
 */
export declare function countTokens(text: string): number;
/**
 * Calculate compression ratio with division guard.
 */
export declare function compressionRatio(originalTokens: number, compressedTokens: number): number;
/**
 * Calculate semantic density (principles per 100 tokens).
 */
export declare function semanticDensity(principleCount: number, tokenCount: number): number;
/**
 * Calculate dimension coverage from signals, principles, and axioms.
 * Uses signal's existing dimension field, with LLM fallback for legacy signals.
 */
export declare function calculateDimensionCoverage(llm: LLMProvider | null | undefined, signals: Signal[], principles: Principle[], axioms: Axiom[]): Promise<DimensionCoverage[]>;
/**
 * Calculate full compression metrics.
 */
export declare function calculateMetrics(llm: LLMProvider | null | undefined, originalText: string, compressedText: string, signals: Signal[], principles: Principle[], axioms: Axiom[], reinforcedCount: number): Promise<CompressionMetrics>;
/**
 * Format metrics as a report string.
 */
export declare function formatMetricsReport(metrics: CompressionMetrics): string;
//# sourceMappingURL=metrics.d.ts.map