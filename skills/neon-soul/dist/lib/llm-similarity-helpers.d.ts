/**
 * Internal helpers for LLM-based semantic similarity.
 *
 * Contains parsing, retry logic, and utility functions.
 * Not intended for direct import outside llm-similarity.ts.
 *
 * Cross-Reference: docs/plans/2026-02-12-llm-based-similarity.md (Stage 1)
 */
/** Default retry configuration */
export declare const MAX_RETRIES = 3;
export declare const INITIAL_BACKOFF_MS = 500;
/** Maximum candidates per batch to avoid token limits */
export declare const MAX_BATCH_SIZE = 20;
/**
 * Escape untrusted text for safe inclusion in prompts.
 * Prevents prompt injection by quoting and escaping special patterns.
 */
export declare function escapeForPrompt(text: string): string;
/**
 * Map confidence string to numeric value.
 * Explicit rules from plan: high=0.9, medium=0.7, low=0.5
 */
export declare function parseConfidence(value: string | number | undefined): number;
/**
 * Parse equivalence response from LLM.
 * Expects format: { "equivalent": boolean, "confidence": "high"|"medium"|"low" }
 */
export declare function parseEquivalenceResponse(response: string): {
    equivalent: boolean;
    confidence: number;
};
/**
 * Parse batch comparison response from LLM.
 * Expects format: { "bestMatchIndex": number, "confidence": "high"|"medium"|"low" }
 */
export declare function parseBatchResponse(response: string, candidateCount: number): {
    index: number;
    confidence: number;
};
/**
 * Check if an error is transient and should be retried.
 */
export declare function isTransientError(error: unknown): boolean;
/**
 * Execute a function with exponential backoff retry.
 */
export declare function withRetry<T>(fn: () => Promise<T>, maxRetries?: number): Promise<T>;
//# sourceMappingURL=llm-similarity-helpers.d.ts.map