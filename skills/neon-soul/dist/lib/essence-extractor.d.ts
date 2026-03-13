/**
 * Essence Extractor
 *
 * Extracts evocative identity statement from axioms using LLM.
 * This is Phase 3 of the PBD pipeline: Axioms → Essence Statement.
 *
 * Usage:
 *   const essence = await extractEssence(axioms, llm);
 *
 * Design Choice: Uses "You are..." framing for identity emergence.
 * See docs/guides/essence-extraction-guide.md for methodology.
 */
import type { Axiom } from '../types/axiom.js';
import type { LLMProvider } from '../types/llm.js';
/**
 * Default essence statement when extraction fails or no LLM provided.
 * I-3 FIX: Changed to be obviously generic so users know extraction failed.
 * Previous value 'AI identity through grounded principles.' looked like real content.
 */
export declare const DEFAULT_ESSENCE = "[Essence extraction pending]";
/**
 * Extract evocative essence from axioms using LLM.
 *
 * @param axioms - The axioms to distill into essence
 * @param llm - LLM provider for generation
 * @returns Evocative essence statement or default on failure
 */
export declare function extractEssence(axioms: Axiom[], llm: LLMProvider): Promise<string>;
//# sourceMappingURL=essence-extractor.d.ts.map