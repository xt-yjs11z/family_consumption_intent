/**
 * Signal Source Classifier Module
 *
 * Stage 12 PBD Alignment: Distinguishes agent-initiated vs user-elicited signals
 * to mitigate the usage-bias problem - where extracted identity reflects usage
 * patterns rather than actual agent identity.
 *
 * TERMINOLOGY (M-4): "usage-bias problem" preferred over legacy "false soul"
 * terminology. The issue is not deception but reflection of interaction patterns.
 *
 * Elicitation types:
 *   - agent-initiated: Agent volunteers unprompted (high identity signal)
 *   - user-elicited: Agent responds to direct request (low identity signal)
 *   - context-dependent: Agent adapts to context (exclude from identity)
 *   - consistent-across-context: Same behavior across contexts (strong identity signal)
 *
 * KNOWN LIMITATION (C-1 Code Review):
 * When extracting from memory files, conversation context is limited to a single-line
 * snippet (~100 chars) rather than full user/agent conversation turns. This means:
 *
 * 1. Classification relies on LINGUISTIC MARKERS within the signal text itself
 *    (e.g., "I always...", "without being asked", "when prompted") rather than
 *    analyzing actual conversation flow.
 *
 * 2. `consistent-across-context` detects CLAIMS about consistency, not VERIFIED
 *    consistency across multiple independent contexts. True cross-context consistency
 *    would require a higher-order analysis stage comparing signals over time.
 *
 * 3. For memory file extraction, classification often defaults to 'user-elicited'
 *    (conservative fallback) when context is ambiguous.
 *
 * Full elicitation classification is most effective in:
 * - Live conversation analysis (interview pipeline)
 * - Memory files with explicit context markers
 * - Future enhancement: N-line surrounding context storage
 */
import type { LLMProvider } from '../types/llm.js';
import type { Signal, SignalElicitationType } from '../types/signal.js';
/**
 * Elicitation type weights for identity synthesis.
 * Higher weights indicate stronger identity signals.
 *
 * I-1 FIX: Weight Rationale Documentation
 *
 * SCALE ORIGIN: These are heuristic starting points, not empirically derived.
 * The ordinal ranking is grounded in PBD methodology; specific magnitudes are
 * reasonable approximations to be tuned with empirical synthesis quality data.
 *
 * RATIONALE:
 * - consistent-across-context (2.0): Strongest signal. Behavior that persists
 *   regardless of context is definitionally identity-like. Maps to PBD's
 *   UNIVERSAL evidence tier.
 *
 * - agent-initiated (1.5): Strong signal. Unprompted expression suggests the
 *   agent "chose" to share this, similar to "what you do when no one's watching."
 *
 * - user-elicited (0.5): Weak signal. Responding to requests is expected behavior,
 *   not distinguishing identity. An agent being helpful when asked is doing its
 *   job, not revealing core identity.
 *
 * - context-dependent (0.0): Excluded. Situational adaptation (e.g., formal in
 *   business settings) reflects context, not identity. PBD explicitly excludes
 *   context-dependent behaviors from identity synthesis.
 *
 * TUNING GUIDANCE:
 * - If synthesis over-emphasizes rare signals, reduce consistent-across-context weight
 * - If synthesis feels generic, increase agent-initiated weight
 * - Weights are relative; doubling all weights has no effect
 * - Consider A/B testing different weight schemes on synthesis quality metrics
 */
export declare const ELICITATION_WEIGHT: Record<SignalElicitationType, number>;
/**
 * Classify how a signal was elicited in conversation.
 *
 * Uses self-healing retry loop: if LLM returns invalid response,
 * retries with corrective feedback before falling back to default.
 *
 * NOTE: Classification quality depends on conversationContext richness.
 * For memory file extraction, context is typically a single-line snippet,
 * so classification relies on linguistic markers in the signal text itself.
 * See module header for known limitations (C-1).
 *
 * @param llm - LLM provider (required)
 * @param signalText - The signal text to classify
 * @param conversationContext - Surrounding conversation context (ideally multi-turn)
 * @returns The classified elicitation type (defaults to 'user-elicited' after retry exhaustion)
 * @throws LLMRequiredError if llm is null/undefined
 */
export declare function classifyElicitationType(llm: LLMProvider | null | undefined, signalText: string, conversationContext: string): Promise<SignalElicitationType>;
/**
 * Filter signals for identity synthesis.
 * Explicitly removes context-dependent signals which should not contribute to identity.
 *
 * I-5 FIX: Explicit filtering is more readable than zero-weight multiplication.
 *
 * @param signals - Array of signals to filter
 * @returns Signals suitable for identity synthesis (excludes context-dependent)
 */
export declare function filterForIdentitySynthesis(signals: Signal[]): Signal[];
/**
 * Calculate weighted signal count for identity synthesis.
 * Applies elicitation weights to signal contributions.
 *
 * @param signals - Array of signals (should be pre-filtered)
 * @returns Weighted count based on elicitation types
 */
export declare function calculateWeightedSignalCount(signals: Signal[]): number;
//# sourceMappingURL=signal-source-classifier.d.ts.map