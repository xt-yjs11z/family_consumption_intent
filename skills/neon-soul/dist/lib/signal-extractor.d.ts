/**
 * Generic signal extraction with LLM-based semantic detection.
 * Uses LLM to identify identity signals (no keyword matching).
 * LLM provider required for all signal extraction operations.
 *
 * Environment Variables:
 *   - NEON_SOUL_LLM_CONCURRENCY: Batch size for parallel LLM calls (default: 10)
 */
import type { Signal } from '../types/signal.js';
import type { LLMProvider } from '../types/llm.js';
import type { MemoryFile } from './memory-walker.js';
export interface ExtractionConfig {
    promptTemplate: string;
    sourceType: 'template' | 'memory' | 'interview';
}
/**
 * Extract signals from markdown content using LLM-based semantic detection.
 * LLM provider is required - no fallback to keyword matching.
 *
 * Performance optimizations (CR6-1):
 * - Collects candidate lines first, then batch processes
 * - Parallelizes dimension + signalType classification (independent operations)
 * - Processes detection in parallel batches
 *
 * @param llm - LLM provider (required)
 * @param content - Markdown content to extract signals from
 * @param source - Source file information
 * @param options - Optional configuration
 * @returns Array of extracted signals
 * @throws LLMRequiredError if llm is null/undefined
 */
export declare function extractSignalsFromContent(llm: LLMProvider | null | undefined, content: string, source: {
    file: string;
    category?: string;
}, options?: {
    confidenceThreshold?: number;
}): Promise<Signal[]>;
/**
 * Extract signals from multiple memory files.
 * LLM provider is required for all extraction operations.
 *
 * @param llm - LLM provider (required)
 * @param memoryFiles - Array of memory files to process
 * @returns Array of extracted signals from all files
 * @throws LLMRequiredError if llm is null/undefined
 */
export declare function extractSignalsFromMemoryFiles(llm: LLMProvider | null | undefined, memoryFiles: MemoryFile[]): Promise<Signal[]>;
//# sourceMappingURL=signal-extractor.d.ts.map