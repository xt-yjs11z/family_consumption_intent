/**
 * Tension Detector Module
 *
 * PBD Stage 5: Detects and tracks conflicting axioms.
 * Uses LLM to identify value tensions between axiom pairs.
 *
 * Guards against O(n²) explosion with MAX_AXIOMS limit.
 * Processes pairs in batches with concurrency limit.
 */
import type { Axiom } from '../types/axiom.js';
import type { LLMProvider } from '../types/llm.js';
/**
 * Value tension between two axioms.
 * Used internally before attaching to axioms.
 */
export interface ValueTension {
    axiom1Id: string;
    axiom2Id: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
}
/**
 * Detect tensions between axioms using LLM analysis.
 *
 * Guards against O(n²) explosion:
 * - Skips if more than MAX_AXIOMS_FOR_TENSION_DETECTION axioms
 * - Processes in batches of TENSION_DETECTION_CONCURRENCY
 *
 * @param llm - LLM provider (required)
 * @param axioms - Array of axioms to check for tensions
 * @returns Array of detected tensions
 * @throws LLMRequiredError if llm is null/undefined
 */
export declare function detectTensions(llm: LLMProvider | null | undefined, axioms: Axiom[]): Promise<ValueTension[]>;
/**
 * Attach detected tensions to their respective axioms.
 * Each axiom gets its own list of tensions where it's involved.
 *
 * I-5 FIX: This function MERGES new tensions with existing ones.
 * Existing tensions are preserved; duplicates are avoided by checking axiomId.
 *
 * @param axioms - Array of axioms to update
 * @param tensions - Array of detected tensions
 * @returns Updated axioms with tensions attached (mutates input axioms)
 */
export declare function attachTensionsToAxioms(axioms: Axiom[], tensions: ValueTension[]): Axiom[];
//# sourceMappingURL=tension-detector.d.ts.map