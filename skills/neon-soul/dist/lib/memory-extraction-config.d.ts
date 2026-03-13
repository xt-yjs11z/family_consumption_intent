/**
 * Memory-Specific Signal Extraction Configuration
 *
 * Configures the shared signal-extractor.ts for OpenClaw memory file processing.
 * Uses LLM-based semantic classification for dimension and section type inference.
 *
 * Usage:
 *   import { memoryExtractionConfig, extractSignalsFromMemory } from './memory-extraction-config.js';
 *   const signals = await extractSignalsFromMemory(memoryFile, llmProvider);
 *
 * Reuses from Phase 0:
 *   - signal-extractor.ts (core extraction)
 *   - embeddings.ts (384-dim vectors)
 *   - provenance.ts (audit trail)
 *   - semantic-classifier.ts (LLM-based classification)
 */
import type { Signal, SoulCraftDimension } from '../types/signal.js';
import type { MemoryFile, MemoryCategory } from './memory-walker.js';
import type { LLMProvider } from '../types/llm.js';
/**
 * Extraction configuration for memory files.
 */
export interface MemoryExtractionConfig {
    /** LLM prompt template for signal extraction */
    promptTemplate: string;
    /** Source type for provenance */
    sourceType: 'memory';
    /** Minimum confidence to keep a signal */
    minConfidence: number;
    /** Maximum signals per file */
    maxSignalsPerFile: number;
}
/**
 * Default memory extraction configuration.
 */
export declare const memoryExtractionConfig: MemoryExtractionConfig;
/**
 * Map memory category to likely SoulCraft dimensions.
 */
export declare function getDimensionsForCategory(category: MemoryCategory): SoulCraftDimension[];
/**
 * Estimated signal density by category.
 */
export declare function getSignalDensity(category: MemoryCategory): 'low' | 'medium' | 'high';
/**
 * Extract signals from a memory file.
 * Uses LLM-based semantic classification for dimension and section type inference.
 *
 * @param memoryFile - The memory file to extract signals from
 * @param llm - LLM provider for semantic classification (required)
 * @param config - Extraction configuration
 * @returns Array of extracted signals
 */
export declare function extractSignalsFromMemory(memoryFile: MemoryFile, llm: LLMProvider, config?: MemoryExtractionConfig): Promise<Signal[]>;
/**
 * Batch extract signals from multiple memory files.
 *
 * @param memoryFiles - Array of memory files to process
 * @param llm - LLM provider for semantic classification (required)
 * @param config - Extraction configuration
 * @param onProgress - Optional progress callback
 * @returns Object containing extracted signals and statistics
 */
export declare function batchExtractSignals(memoryFiles: MemoryFile[], llm: LLMProvider, config?: MemoryExtractionConfig, onProgress?: (current: number, total: number) => void): Promise<{
    signals: Signal[];
    stats: {
        totalFiles: number;
        totalSignals: number;
        byCategory: Record<MemoryCategory, number>;
        byDimension: Record<SoulCraftDimension, number>;
    };
}>;
//# sourceMappingURL=memory-extraction-config.d.ts.map