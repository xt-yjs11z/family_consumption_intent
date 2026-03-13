/**
 * Ollama LLM Provider for NEON-SOUL.
 *
 * Implements LLMProvider interface using Ollama's OpenAI-compatible API.
 * Enables real LLM testing without external API keys.
 *
 * Usage:
 *   const llm = new OllamaLLMProvider({ model: 'llama3' });
 *   const result = await llm.classify(prompt, { categories: ['a', 'b'] });
 *
 * Environment Variables:
 *   - OLLAMA_BASE_URL: API base URL (default: http://localhost:11434)
 *   - OLLAMA_MODEL: Model to use (default: llama3)
 *   - OLLAMA_TIMEOUT: Request timeout in ms (default: 120000)
 *
 * Prerequisites:
 *   - Ollama running: docker compose -f docker/docker-compose.ollama.yml up -d
 *   - Model pulled: docker exec neon-soul-ollama ollama pull llama3
 *
 * Cross-Reference: docs/plans/2026-02-08-ollama-llm-provider.md
 */
import type { LLMProvider, ClassifyOptions, ClassificationResult, GenerationResult } from '../../types/llm.js';
/**
 * Configuration options for OllamaLLMProvider.
 */
export interface OllamaConfig {
    /** Ollama API base URL. Default: http://localhost:11434 or OLLAMA_BASE_URL env */
    baseUrl?: string;
    /** Model to use. Default: llama3 or OLLAMA_MODEL env */
    model?: string;
    /** Request timeout in milliseconds. Default: 120000 (120s) or OLLAMA_TIMEOUT env */
    timeout?: number;
}
/**
 * Error thrown when Ollama is not available.
 */
export declare class OllamaNotAvailableError extends Error {
    readonly name = "OllamaNotAvailableError";
    constructor(baseUrl: string, cause?: Error);
}
/**
 * LLM provider implementation using Ollama's API.
 *
 * v0.2.0: Semantic fallback removed. Classification now uses only
 * fast string matching. If LLM returns unparseable category, returns null.
 * @see docs/plans/2026-02-12-llm-based-similarity.md (Stage 4)
 */
export declare class OllamaLLMProvider implements LLMProvider {
    private readonly baseUrl;
    private readonly model;
    private readonly timeout;
    constructor(config?: OllamaConfig);
    /**
     * Check if Ollama is available at the configured URL.
     */
    static isAvailable(baseUrl?: string): Promise<boolean>;
    /**
     * Send a chat completion request to Ollama.
     */
    private chat;
    /**
     * Maximum character distance between negation word and category for rejection.
     * Example: "not identity-core" has distance ~4, "this is not about identity-core" has distance ~16.
     * M-1 FIX: Extracted from magic number for clarity.
     */
    private static readonly NEGATION_PROXIMITY_CHARS;
    /**
     * Negation patterns that indicate a category should NOT be matched.
     * M-3 FIX: Prevents misclassifying "not identity-core" as "identity-core".
     */
    private static readonly NEGATION_PATTERNS;
    /**
     * Check if a category match is negated in the response.
     * Returns true if the category appears after a negation word.
     */
    private isNegated;
    /**
     * Extract a category from LLM response using fast string matching.
     * v0.2.0: Semantic fallback removed - returns null if no match found.
     * M-3 FIX: Now handles negation patterns to avoid misclassification.
     */
    private extractCategoryFast;
    /**
     * Classify text into one of the provided categories.
     *
     * v0.2.0: Semantic fallback removed. If fast string matching fails,
     * returns null category instead of attempting embedding-based fallback.
     * @see docs/plans/2026-02-12-llm-based-similarity.md (Stage 4)
     */
    classify<T extends string>(prompt: string, options: ClassifyOptions<T>): Promise<ClassificationResult<T>>;
    /**
     * Generate text from a prompt.
     * Used for notation generation.
     */
    generate(prompt: string): Promise<GenerationResult>;
}
//# sourceMappingURL=ollama-provider.d.ts.map