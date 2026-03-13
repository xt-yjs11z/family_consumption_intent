/**
 * SOUL.md Generator
 *
 * Generates the final SOUL.md output with all 7 SoulCraft dimensions,
 * formatted axioms, provenance summary, and compression metrics.
 *
 * Usage:
 *   const soul = generateSoul(axioms, principles, options);
 *   const markdown = formatSoulMarkdown(soul);
 *
 * Output structure:
 *   # SOUL.md
 *   ## Identity Core
 *   [axioms for this dimension]
 *   ## Character Traits
 *   ...
 *   ## Provenance
 *   [compressed audit trail]
 */
import type { Axiom } from '../types/axiom.js';
import type { Principle } from '../types/principle.js';
import type { SoulCraftDimension } from '../types/signal.js';
import type { LLMProvider } from '../types/llm.js';
import type { ProseExpansion } from './prose-expander.js';
export { extractEssence } from './essence-extractor.js';
/**
 * Notation format for axiom display.
 * Simplified: native (plain text) or notated (LLM-generated CJK/emoji/math).
 */
export type NotationFormat = 'native' | 'notated';
/**
 * Generated soul structure.
 */
export interface GeneratedSoul {
    /** Full markdown content */
    content: string;
    /** Axioms organized by dimension */
    byDimension: Map<SoulCraftDimension, Axiom[]>;
    /** Dimension coverage (0-1) */
    coverage: number;
    /** Token count */
    tokenCount: number;
    /** Original token count (for ratio) */
    originalTokenCount: number;
    /** Compression ratio */
    compressionRatio: number;
    /** Generation timestamp */
    generatedAt: Date;
    /** Evocative essence statement (LLM-generated) */
    essenceStatement?: string;
}
/**
 * Soul generator options.
 *
 * Note: includeUnconverged was removed (M-2 fix) - it was never implemented.
 * Unconverged principles are available in ReflectiveLoopResult.unconverged.
 */
export interface SoulGeneratorOptions {
    /** Notation format (for legacy output) */
    format: NotationFormat;
    /** Output format: 'prose' for inhabitable soul, 'notation' for legacy */
    outputFormat?: 'prose' | 'notation';
    /** Prose expansion result (required when outputFormat is 'prose') */
    proseExpansion?: ProseExpansion;
    /** Include provenance section */
    includeProvenance?: boolean;
    /** Include metrics section (only for notation format) */
    includeMetrics?: boolean;
    /** Original content for compression ratio */
    originalContent?: string;
    /** Custom title */
    title?: string;
    /** LLM provider for essence extraction (optional for backward compat) */
    llm?: LLMProvider;
}
/**
 * Default generator options.
 */
export declare const DEFAULT_GENERATOR_OPTIONS: SoulGeneratorOptions;
/**
 * Generate soul from axioms and principles.
 * Now async to support LLM-based essence extraction.
 */
export declare function generateSoul(axioms: Axiom[], principles: Principle[], options?: Partial<SoulGeneratorOptions>): Promise<GeneratedSoul>;
/**
 * Format axiom in specified notation.
 * Simplified: native (plain text) or notated (LLM-generated CJK/emoji/math).
 */
export declare function formatAxiom(axiom: Axiom, format: NotationFormat): string;
/**
 * Format axiom with tier badge.
 */
export declare function formatAxiomWithTier(axiom: Axiom, format: NotationFormat): string;
/**
 * Generate minimal soul (axioms only, no decorations).
 */
export declare function generateMinimalSoul(axioms: Axiom[], format: NotationFormat): string;
/**
 * Generate diff between two souls.
 */
export declare function diffSouls(oldSoul: GeneratedSoul, newSoul: GeneratedSoul): string;
//# sourceMappingURL=soul-generator.d.ts.map