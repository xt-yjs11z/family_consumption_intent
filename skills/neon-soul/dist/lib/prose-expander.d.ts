/**
 * Prose Expander
 *
 * Transforms axioms into prose sections for an inhabitable SOUL.md.
 * Each section has a specific format matching souls.directory conventions.
 *
 * Sections:
 * - Core Truths: Bold principle + elaboration sentence (4-6 principles)
 * - Voice: 1-2 prose paragraphs + "Think: [analogy]" line
 * - Boundaries: 3-5 "You don't..." contrast statements
 * - Vibe: 2-3 sentence prose paragraph capturing the feel
 *
 * Usage:
 *   const prose = await expandToProse(axioms, llm);
 *   // prose.coreTruths, prose.voice, prose.boundaries, prose.vibe, prose.closingTagline
 */
import type { Axiom } from '../types/axiom.js';
import type { LLMProvider } from '../types/llm.js';
/**
 * Soul section types for prose output.
 */
export type SoulSection = 'coreTruths' | 'voice' | 'boundaries' | 'vibe';
/**
 * Prose expansion result.
 */
export interface ProseExpansion {
    /** Core Truths section: bold+elaboration format */
    coreTruths: string;
    /** Voice section: prose paragraphs with Think: analogy */
    voice: string;
    /** Boundaries section: "You don't..." contrast statements */
    boundaries: string;
    /** Vibe section: short prose feel */
    vibe: string;
    /** Closing tagline: italicized personality line */
    closingTagline: string;
    /** Whether any sections used fallback */
    usedFallback: boolean;
    /** Sections that used fallback */
    fallbackSections: SoulSection[];
    /** M-4 FIX: Track if closing tagline used fallback separately */
    closingTaglineUsedFallback: boolean;
    /** I-3 FIX: Actual axiom count for provenance */
    axiomCount: number;
}
/**
 * Validate Core Truths section format.
 * Must contain at least one **bold** pattern.
 * I-4 FIX: Exported for direct unit testing.
 */
export declare function validateCoreTruths(content: string): boolean;
/**
 * Validate Voice section format.
 * Must be prose (no bullets), use second person.
 * I-4 FIX: Exported for direct unit testing.
 */
export declare function validateVoice(content: string): boolean;
/**
 * Validate Boundaries section format.
 * I-2 FIX: Require at least 3 matching lines instead of ALL lines.
 * This allows LLM to include intro/outro text while still validating core content.
 * Each valid line must start with "You don't" / "You won't" / "You're not" / "You never".
 * M-4 FIX: Also accepts standalone "Never..." and "Don't..." patterns.
 * I-4 FIX: Exported for direct unit testing.
 */
export declare function validateBoundaries(content: string): boolean;
/**
 * Validate Vibe section format.
 * M-1 FIX: Comment now matches code - accepts 1-5 sentences.
 * Validation is lenient to accommodate varied LLM output styles.
 * I-4 FIX: Exported for direct unit testing.
 */
export declare function validateVibe(content: string): boolean;
/**
 * Validate closing tagline.
 * Must be under 15 words, not a trait list.
 * I-4 FIX: Exported for direct unit testing.
 */
export declare function validateClosingTagline(content: string): boolean;
/**
 * Expand axioms to prose sections.
 *
 * Parallelism: Core Truths, Voice, and Vibe run in parallel.
 * Boundaries runs after Core Truths + Voice (needs them as input).
 * Closing tagline runs last.
 */
export declare function expandToProse(axioms: Axiom[], llm: LLMProvider): Promise<ProseExpansion>;
//# sourceMappingURL=prose-expander.d.ts.map