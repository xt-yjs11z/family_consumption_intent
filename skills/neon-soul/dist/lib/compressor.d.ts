/**
 * Axiom synthesizer - compresses principles to axioms when N>=3.
 * Generates canonical forms (native/notated).
 */
import type { Principle } from '../types/principle.js';
import type { Axiom } from '../types/axiom.js';
import type { LLMProvider } from '../types/llm.js';
import { type GuardrailWarnings } from './guardrails.js';
export interface CompressionResult {
    axioms: Axiom[];
    unconverged: Principle[];
    metrics: {
        principlesProcessed: number;
        axiomsCreated: number;
        compressionRatio: number;
    };
}
/**
 * Cascade metadata for threshold selection observability.
 */
export interface CascadeMetadata {
    /** The N-threshold that produced the final result */
    effectiveThreshold: number;
    /** How many axioms qualified at each threshold level */
    axiomCountByThreshold: Record<number, number>;
}
/**
 * Extended compression result with cascade metadata.
 */
export interface CascadeCompressionResult extends CompressionResult {
    cascade: CascadeMetadata;
    /** Research-backed guardrail warnings (observability only) */
    guardrails: GuardrailWarnings;
    /** Axioms pruned to meet cognitive load cap */
    pruned: Axiom[];
}
export type { GuardrailWarnings } from './guardrails.js';
/**
 * Compress principles to axioms.
 * Principles with N>=threshold are promoted to axioms.
 *
 * @param llm - LLM provider for semantic classification (required)
 * @param principles - Array of principles to compress
 * @param nThreshold - Minimum N-count for axiom promotion (default: 3)
 * @returns Compression result with axioms, unconverged principles, and metrics
 * @throws LLMRequiredError if llm is null/undefined
 */
export declare function compressPrinciples(llm: LLMProvider, principles: Principle[], nThreshold?: number): Promise<CompressionResult>;
/**
 * Generate SOUL.md content from axioms.
 *
 * @param axioms - Array of axioms to render
 * @param format - 'native' for plain text, 'notated' for CJK/emoji/math notation
 */
export declare function generateSoulMd(axioms: Axiom[], format?: 'native' | 'notated'): string;
export { checkGuardrails } from './guardrails.js';
/**
 * Compress principles to axioms with cascading threshold selection.
 *
 * Automatically adapts threshold based on axiom yield:
 * 1. Try N>=3 -> if >= 3 axioms, use result (high confidence)
 * 2. If < 3 axioms, try N>=2 -> if >= 3 axioms, use result (medium confidence)
 * 3. If < 3 axioms, try N>=1 -> use whatever we got (low confidence)
 *
 * Tier assignment is based on ACTUAL N-count, not cascade level.
 * An axiom with N=1 is always "Emerging" regardless of which cascade produced it.
 *
 * @param llm - LLM provider for notation generation (required)
 * @param principles - Array of principles to compress
 * @returns Cascade compression result with axioms, unconverged, metrics, and cascade metadata
 * @throws LLMRequiredError if llm is null/undefined
 */
export declare function compressPrinciplesWithCascade(llm: LLMProvider, principles: Principle[]): Promise<CascadeCompressionResult>;
//# sourceMappingURL=compressor.d.ts.map