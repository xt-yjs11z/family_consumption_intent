/**
 * Semantic Vocabulary Definitions
 *
 * Vocabularies for semantic classification categories.
 * Used by semantic-classifier.ts for LLM-based classification.
 *
 * Note: CJK/emoji notation is now generated directly by LLM in
 * compressor.ts via generateNotatedForm(). No constrained vocabulary.
 */
import type { SignalType } from '../types/signal.js';
import type { MemoryCategory } from './memory-walker.js';
/**
 * Section types for template/memory content classification.
 */
export type SectionType = 'core-truths' | 'boundaries' | 'vibe-tone' | 'examples' | 'preferences' | 'other';
/**
 * All valid signal types.
 */
export declare const SIGNAL_TYPES: readonly SignalType[];
/**
 * All valid section types.
 */
export declare const SECTION_TYPES: readonly SectionType[];
/**
 * All valid memory categories.
 */
export declare const MEMORY_CATEGORIES: readonly MemoryCategory[];
//# sourceMappingURL=semantic-vocabulary.d.ts.map