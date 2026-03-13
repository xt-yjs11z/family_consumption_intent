/**
 * Semantic Vocabulary Definitions
 *
 * Vocabularies for semantic classification categories.
 * Used by semantic-classifier.ts for LLM-based classification.
 *
 * Note: CJK/emoji notation is now generated directly by LLM in
 * compressor.ts via generateNotatedForm(). No constrained vocabulary.
 */
/**
 * All valid signal types.
 */
export const SIGNAL_TYPES = [
    'value',
    'belief',
    'preference',
    'goal',
    'constraint',
    'relationship',
    'pattern',
    'correction',
    'boundary',
    'reinforcement',
];
/**
 * All valid section types.
 */
export const SECTION_TYPES = [
    'core-truths',
    'boundaries',
    'vibe-tone',
    'examples',
    'preferences',
    'other',
];
/**
 * All valid memory categories.
 */
export const MEMORY_CATEGORIES = [
    'diary',
    'experiences',
    'goals',
    'knowledge',
    'relationships',
    'preferences',
    'unknown',
];
//# sourceMappingURL=semantic-vocabulary.js.map