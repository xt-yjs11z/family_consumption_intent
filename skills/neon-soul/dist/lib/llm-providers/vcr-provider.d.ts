/**
 * VCR LLM Provider - Record/Replay wrapper for deterministic LLM testing.
 *
 * Implements the RORRD pattern (Record Reality Once, Replay Deterministically)
 * for LLM API calls. Enables fast, deterministic CI testing with real LLM behavior.
 *
 * Modes:
 * - replay (default): Load from fixture, error if missing
 * - record: Call real provider, save to fixture
 * - passthrough: Call real provider, don't save
 *
 * Usage:
 *   const realLLM = new OllamaLLMProvider({ model: 'llama3' });
 *   const vcrLLM = new VCRLLMProvider(realLLM, 'tests/fixtures/vcr', 'replay');
 *
 * Cross-Reference:
 * - docs/observations/http-vcr-pattern-for-api-testing.md (Part 13)
 * - docs/plans/2026-02-09-signal-generalization.md (Stage 4a)
 */
import type { LLMProvider, ClassifyOptions, ClassificationResult, GenerationResult } from '../../types/llm.js';
/**
 * VCR operation modes.
 */
export type VCRMode = 'replay' | 'record' | 'passthrough';
/**
 * Fixture metadata for debugging and cache invalidation.
 */
export interface FixtureMetadata {
    /** Type of LLM operation */
    type: 'classify' | 'generate';
    /** Hash used as fixture key */
    hash: string;
    /** Prompt version for cache invalidation */
    promptVersion: string;
    /** When fixture was recorded */
    recordedAt: string;
    /** Model used (if available) */
    model?: string;
}
/**
 * Classification fixture format.
 */
export interface ClassifyFixture<T extends string = string> {
    _metadata: FixtureMetadata;
    prompt: string;
    categories: readonly T[];
    context?: string;
    result: ClassificationResult<T>;
}
/**
 * Generation fixture format.
 */
export interface GenerateFixture {
    _metadata: FixtureMetadata;
    prompt: string;
    result: GenerationResult;
}
/**
 * VCR statistics for debugging.
 */
export interface VCRStats {
    hits: number;
    misses: number;
    recordings: number;
    errors: number;
}
/**
 * Error thrown when fixture is missing in replay mode.
 */
export declare class FixtureMissingError extends Error {
    readonly name = "FixtureMissingError";
    readonly fixturePath: string;
    readonly hash: string;
    constructor(fixturePath: string, hash: string);
}
/**
 * VCR LLM Provider - wraps any LLMProvider with record/replay capability.
 */
export declare class VCRLLMProvider implements LLMProvider {
    private readonly provider;
    private readonly fixtureDir;
    private readonly mode;
    private readonly modelName;
    private readonly stats;
    /**
     * @param provider - Underlying LLM provider
     * @param fixtureDir - Directory for fixture storage
     * @param mode - VCR operation mode (replay/record/passthrough)
     * @param modelName - Model name for fixture key (default: 'unknown')
     */
    constructor(provider: LLMProvider, fixtureDir: string, mode?: VCRMode, modelName?: string);
    /**
     * Generate hash for fixture key.
     * Includes model name and prompt version for cache invalidation.
     * Uses 32 hex chars (128 bits) to prevent birthday paradox collisions.
     *
     * @see docs/issues/2026-02-09-signal-generalization-impl-findings.md (Finding #7, #8)
     */
    private generateHash;
    /**
     * Get fixture path for a given hash.
     */
    private getFixturePath;
    /**
     * Load fixture from disk.
     */
    private loadFixture;
    /**
     * Save fixture to disk.
     */
    private saveFixture;
    /**
     * Classify text using VCR record/replay.
     */
    classify<T extends string>(prompt: string, options: ClassifyOptions<T>): Promise<ClassificationResult<T>>;
    /**
     * Generate text using VCR record/replay.
     */
    generate(prompt: string): Promise<GenerationResult>;
    /**
     * Get VCR statistics for debugging.
     */
    getStats(): VCRStats;
    /**
     * Reset VCR statistics.
     */
    resetStats(): void;
    /**
     * Get the current VCR mode.
     */
    getMode(): VCRMode;
    /**
     * Get the fixture directory path.
     */
    getFixtureDir(): string;
}
export declare function createVCRProvider(provider: LLMProvider, fixtureDir: string, modelName?: string): VCRLLMProvider;
//# sourceMappingURL=vcr-provider.d.ts.map