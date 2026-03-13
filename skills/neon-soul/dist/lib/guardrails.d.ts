/**
 * Synthesis Guardrails
 *
 * Research-backed limits and warnings for synthesis quality.
 * Extracted from compressor.ts for MCE compliance.
 *
 * These are observability warnings only - they do not block synthesis.
 */
/**
 * Maximum axiom count before cognitive load warning.
 * Based on research suggesting 7±2 items for working memory,
 * extended to 30 for hierarchical structures.
 */
export declare const COGNITIVE_LOAD_CAP = 30;
/**
 * Guardrail warning messages for observability.
 * These are warnings only - they do not block synthesis.
 */
export interface GuardrailWarnings {
    /** True if axioms exceed signal count (expansion instead of compression) */
    expansionWarning: boolean;
    /** True if axioms exceed cognitive load limit */
    cognitiveLoadWarning: boolean;
    /** True if cascade fell back to minimum threshold */
    fallbackWarning: boolean;
    /** All warning messages for logging */
    messages: string[];
}
/**
 * Empty guardrail result (no warnings).
 */
export declare const NO_WARNINGS: GuardrailWarnings;
/**
 * Check synthesis guardrails and return warnings.
 *
 * Research-backed limits:
 * 1. axioms > signals -> "Expansion instead of compression"
 * 2. axioms > min(signals * 0.5, 30) -> "Exceeds cognitive load research limits"
 * 3. effectiveThreshold === 1 -> "Fell back to minimum threshold"
 *
 * @param axiomCount - Number of axioms produced
 * @param signalCount - Number of input signals
 * @param effectiveThreshold - The N-threshold that produced the result
 * @returns Guardrail warnings for logging
 */
export declare function checkGuardrails(axiomCount: number, signalCount: number, effectiveThreshold: number): GuardrailWarnings;
//# sourceMappingURL=guardrails.d.ts.map