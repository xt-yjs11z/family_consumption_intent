/**
 * LLM provider interface for semantic classification.
 *
 * All classification functions in semantic-classifier.ts require an LLM provider.
 * No fallback to keyword matching - LLM is mandatory (Option C design).
 */
/**
 * Error thrown when LLM provider is required but not provided.
 *
 * This is the Option C fallback behavior - no degraded keyword matching.
 * Callers must provide an LLM provider for all semantic classification.
 *
 * Consumer Error Handling Guidance (TR-6):
 * - Display to user: "Unable to analyze - AI service unavailable"
 * - The `operation` field identifies which function failed (for logging)
 * - This error is recoverable - retry with valid LLM provider
 * - Do NOT fall back to keyword matching - that defeats semantic accuracy
 *
 * Related errors:
 * - Network errors from LLM: May retry with exponential backoff
 * - Invalid category errors: Bug in prompt/schema - should not reach users
 */
export class LLMRequiredError extends Error {
    name = 'LLMRequiredError';
    operation;
    constructor(operation) {
        super(`LLM provider is required for ${operation}. No fallback available.`);
        this.operation = operation;
    }
}
/**
 * TR-4: Shared LLM validation utility.
 * Validates LLM provider is present and throws LLMRequiredError if not.
 *
 * @param llm - LLM provider to validate
 * @param operation - Operation name for error message
 * @throws LLMRequiredError if llm is null or undefined
 */
export function requireLLM(llm, operation) {
    if (!llm) {
        throw new LLMRequiredError(operation);
    }
}
//# sourceMappingURL=llm.js.map