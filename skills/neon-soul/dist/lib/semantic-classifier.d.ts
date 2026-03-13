/**
 * Semantic Classifier Module
 *
 * Central module for all LLM-based semantic classification.
 * All functions require an LLM provider - no fallback to keyword matching (Option C design).
 *
 * Functions:
 *   - classifyDimension: Classify text into SoulCraft dimensions
 *   - classifySignalType: Classify text into signal types
 *   - classifySectionType: Classify section by title/content
 *   - classifyCategory: Classify memory content category
 *
 * Note: Notation generation (CJK/emoji/math) is handled directly by the LLM
 * in compressor.ts via generateNotatedForm(). No vocabulary mapping here.
 *
 * Language Note (TR-5): Input text can be any language - the LLM understands
 * multilingual content. However, category descriptions in prompts are English.
 * For non-English souls (Japanese, Mandarin, etc.), accuracy may vary. Consider
 * translating category descriptions if building localized versions.
 */
import type { LLMProvider } from '../types/llm.js';
import type { SignalType, SignalStance, SignalImportance } from '../types/signal.js';
import { type SoulCraftDimension } from '../types/dimensions.js';
import type { MemoryCategory } from './memory-walker.js';
import { type SectionType } from './semantic-vocabulary.js';
export { requireLLM } from '../types/llm.js';
export type { SectionType };
/**
 * Sanitize user input to prevent prompt injection.
 * CR-2 FIX: Wrap user content in XML delimiters to separate from instructions.
 * I-1 FIX: Exported for use by other modules (tension-detector, signal-source-classifier, etc.)
 * I-2 FIX: Added truncation to prevent context overflow attacks.
 */
export declare function sanitizeForPrompt(text: string): string;
/**
 * Classify text into one of the 7 SoulCraft dimensions.
 *
 * Uses self-healing retry loop: if LLM returns invalid response,
 * retries with corrective feedback before falling back to default.
 *
 * @param llm - LLM provider (required)
 * @param text - Text to classify
 * @returns The classified SoulCraft dimension (defaults to 'identity-core' after retry exhaustion)
 * @throws LLMRequiredError if llm is null/undefined
 */
export declare function classifyDimension(llm: LLMProvider | null | undefined, text: string): Promise<SoulCraftDimension>;
/**
 * Classify text into one of the signal types.
 *
 * Uses self-healing retry loop: if LLM returns invalid response,
 * retries with corrective feedback before falling back to default.
 *
 * @param llm - LLM provider (required)
 * @param text - Text to classify
 * @returns The classified signal type (defaults to 'value' after retry exhaustion)
 * @throws LLMRequiredError if llm is null/undefined
 */
export declare function classifySignalType(llm: LLMProvider | null | undefined, text: string): Promise<SignalType>;
/**
 * Classify section by title and optional content.
 *
 * @param llm - LLM provider (required)
 * @param title - Section title
 * @param content - Optional section content for additional context
 * @returns The classified section type
 * @throws LLMRequiredError if llm is null/undefined
 */
export declare function classifySectionType(llm: LLMProvider | null | undefined, title: string, content?: string): Promise<SectionType>;
/**
 * Classify memory content into a category.
 *
 * Uses self-healing retry loop: if LLM returns invalid response,
 * retries with corrective feedback before falling back to default.
 *
 * @param llm - LLM provider (required)
 * @param text - Memory content to classify
 * @returns The classified memory category (defaults to 'unknown' after retry exhaustion)
 * @throws LLMRequiredError if llm is null/undefined
 */
export declare function classifyCategory(llm: LLMProvider | null | undefined, text: string): Promise<MemoryCategory>;
/**
 * Classify text into one of the PBD stance types.
 *
 * Uses self-healing retry loop: if LLM returns invalid response,
 * retries with corrective feedback before falling back to default.
 *
 * @param llm - LLM provider (required)
 * @param text - Text to classify
 * @returns The classified stance (defaults to 'assert' after retry exhaustion)
 * @throws LLMRequiredError if llm is null/undefined
 */
export declare function classifyStance(llm: LLMProvider | null | undefined, text: string): Promise<SignalStance>;
/**
 * Classify text into one of the PBD importance levels.
 *
 * Uses self-healing retry loop: if LLM returns invalid response,
 * retries with corrective feedback before falling back to default.
 *
 * @param llm - LLM provider (required)
 * @param text - Text to classify
 * @returns The classified importance (defaults to 'supporting' after retry exhaustion)
 * @throws LLMRequiredError if llm is null/undefined
 */
export declare function classifyImportance(llm: LLMProvider | null | undefined, text: string): Promise<SignalImportance>;
//# sourceMappingURL=semantic-classifier.d.ts.map