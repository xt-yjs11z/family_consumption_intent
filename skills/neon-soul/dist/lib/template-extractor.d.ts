/**
 * Template-specific signal extraction for SOUL.md templates.
 * Uses LLM-based semantic classification to determine section types.
 */
import type { Signal } from '../types/signal.js';
import type { LLMProvider } from '../types/llm.js';
export interface TemplateExtractionResult {
    templatePath: string;
    signals: Signal[];
    metadata: {
        title: string;
        subtitle: string;
        sectionCount: number;
        extractedAt: string;
    };
}
/**
 * Extract signals from a SOUL.md template file.
 * Uses LLM-based semantic classification to identify section types:
 * - Bold statements in "Core Truths" → value signals
 * - Bullet points in "Boundaries" → boundary signals
 * - "Vibe" section → preference signals
 * - Example patterns (do/don't) → correction signals
 *
 * @param templatePath - Path to the template file
 * @param llm - LLM provider for semantic classification (required)
 */
export declare function extractFromTemplate(templatePath: string, llm: LLMProvider): Promise<TemplateExtractionResult>;
/**
 * Batch extract signals from multiple templates.
 *
 * @param templatePaths - Array of paths to template files
 * @param llm - LLM provider for semantic classification (required)
 */
export declare function extractFromTemplates(templatePaths: string[], llm: LLMProvider): Promise<TemplateExtractionResult[]>;
//# sourceMappingURL=template-extractor.d.ts.map