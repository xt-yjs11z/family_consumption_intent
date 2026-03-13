/**
 * Single-Pass Soul Synthesis
 *
 * Implements single-pass synthesis: generalize signals once, add to
 * PrincipleStore once, compress to axioms once. No iteration loop.
 *
 * Architecture Decision (2026-02-10):
 * The original iterative design was flawed - re-adding signals each iteration
 * caused self-matching (similarity=1.000) and N-count inflation. Moving
 * ingestion outside the loop made the loop vestigial. Single-pass is simpler
 * and produces the same correct outcome.
 *
 * Usage:
 *   const result = await runReflectiveLoop(signals, options);
 */
import { type GuardrailWarnings } from './compressor.js';
import type { Signal } from '../types/signal.js';
import type { Principle } from '../types/principle.js';
import type { Axiom } from '../types/axiom.js';
import type { LLMProvider } from '../types/llm.js';
/**
 * Synthesis configuration.
 *
 * Note: axiomNThreshold was removed (I-4 fix) - the compressor uses
 * fixed cascading thresholds (3/2/1). See compressPrinciplesWithCascade().
 */
export interface ReflectiveLoopConfig {
    /** Similarity threshold for principle matching */
    principleThreshold: number;
    /** Progress callback (called once after synthesis completes) */
    onComplete?: (result: ReflectiveLoopResult) => void;
}
/**
 * Default synthesis configuration.
 *
 * Note: principleThreshold default changed from 0.85 to 0.75 based on
 * empirical analysis showing generalized signals have similarity ~0.78-0.83.
 * @see docs/issues/2026-02-10-generalized-signal-threshold-gap.md
 */
export declare const DEFAULT_REFLECTIVE_CONFIG: ReflectiveLoopConfig;
/**
 * Result of single-pass synthesis.
 */
export interface ReflectiveLoopResult {
    /** Final principles */
    principles: Principle[];
    /** Final axioms */
    axioms: Axiom[];
    /** Unconverged principles (N < threshold) */
    unconverged: Principle[];
    /** Effective N-threshold used (from cascade) */
    effectiveThreshold: number;
    /** Research-backed guardrail warnings */
    guardrails: GuardrailWarnings;
    /** Synthesis timing */
    durationMs: number;
    /** Signal count processed */
    signalCount: number;
    /** Compression ratio (signals / axioms) */
    compressionRatio: number;
}
/**
 * Run single-pass synthesis.
 *
 * Architecture (2026-02-10):
 * Single-pass: generalize once → add to store once → compress once.
 * No iteration loop. This eliminates the self-matching bug where signals
 * were re-added each iteration, matching themselves with similarity=1.000.
 *
 * @param llm - LLM provider for semantic classification (required)
 * @param signals - Array of signals to process
 * @param config - Optional configuration overrides
 * @returns Synthesis result with principles, axioms, and guardrails
 */
export declare function runReflectiveLoop(llm: LLMProvider, signals: Signal[], config?: Partial<ReflectiveLoopConfig>): Promise<ReflectiveLoopResult>;
/**
 * Format synthesis result as report.
 */
export declare function formatReflectiveLoopReport(result: ReflectiveLoopResult): string;
//# sourceMappingURL=reflection-loop.d.ts.map