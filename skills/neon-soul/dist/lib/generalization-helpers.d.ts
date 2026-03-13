/**
 * Signal Generalization Helpers
 *
 * Pure functions for prompt building and validation.
 * Extracted from signal-generalizer.ts for MCE compliance.
 */
/** Maximum allowed length for generalized output */
export declare const MAX_OUTPUT_LENGTH = 150;
/** Maximum input length for prompt safety (stricter than base 1000) */
export declare const MAX_INPUT_LENGTH = 500;
/**
 * Regex pattern for pronouns that should not appear in actor-agnostic output.
 * Uses word boundaries to catch all cases (end of string, punctuation, etc.)
 */
export declare const PRONOUN_PATTERN: RegExp;
/**
 * Build the generalization prompt for a signal.
 */
export declare function buildPrompt(signalText: string, dimension?: string): string;
/**
 * Validation result for generalized output.
 */
export interface ValidationResult {
    valid: boolean;
    reason?: string;
}
/**
 * Validate generalized output meets constraints.
 * Returns validation result with reason if failed.
 */
export declare function validateGeneralization(original: string, generalized: string): ValidationResult;
//# sourceMappingURL=generalization-helpers.d.ts.map