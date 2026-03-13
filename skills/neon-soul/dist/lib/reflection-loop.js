/**
 * Single-Pass Soul Synthesis
 *
 * Implements single-pass synthesis: generalize signals once, add to
 * PrincipleStore once, compress to axioms once. No iteration loop.
 *
 * Architecture Decision (2026-02-10):
 * The original iterative design was flawed - re-adding signals each iteration
 * caused self-matching (similarity=1.000) and N-count inflation. Moving
 * ingestion outside the loop made the loop vestigial. Single-pass is simpler
 * and produces the same correct outcome.
 *
 * Usage:
 *   const result = await runReflectiveLoop(signals, options);
 */
import { createPrincipleStore } from './principle-store.js';
import { compressPrinciplesWithCascade } from './compressor.js';
import { generalizeSignalsWithCache } from './signal-generalizer.js';
import { logger } from './logger.js';
/**
 * Default synthesis configuration.
 *
 * Note: principleThreshold default changed from 0.85 to 0.75 based on
 * empirical analysis showing generalized signals have similarity ~0.78-0.83.
 * @see docs/issues/2026-02-10-generalized-signal-threshold-gap.md
 */
export const DEFAULT_REFLECTIVE_CONFIG = {
    principleThreshold: 0.75,
};
/**
 * Run single-pass synthesis.
 *
 * Architecture (2026-02-10):
 * Single-pass: generalize once → add to store once → compress once.
 * No iteration loop. This eliminates the self-matching bug where signals
 * were re-added each iteration, matching themselves with similarity=1.000.
 *
 * @param llm - LLM provider for semantic classification (required)
 * @param signals - Array of signals to process
 * @param config - Optional configuration overrides
 * @returns Synthesis result with principles, axioms, and guardrails
 */
export async function runReflectiveLoop(llm, signals, config = {}) {
    const startTime = Date.now();
    const mergedConfig = { ...DEFAULT_REFLECTIVE_CONFIG, ...config };
    const { principleThreshold } = mergedConfig;
    logger.info(`[synthesis] Starting single-pass synthesis with ${signals.length} signals`);
    // Initialize principle store
    const store = createPrincipleStore(llm, principleThreshold);
    // Phase 1: Generalize all signals (batch-first approach for efficiency)
    // Generalized signals cluster better because surface form variance is abstracted away.
    const generalizationStart = Date.now();
    const generalizedSignals = await generalizeSignalsWithCache(llm, signals, 'ollama');
    const generalizationMs = Date.now() - generalizationStart;
    logger.info(`[synthesis] Generalized ${signals.length} signals in ${generalizationMs}ms`);
    // Phase 2: Add generalized signals to principle store (ONCE - no iteration)
    // N-counts accumulate as generalized signals match existing principles
    let addedCount = 0;
    let skippedCount = 0;
    for (const generalizedSignal of generalizedSignals) {
        const result = await store.addGeneralizedSignal(generalizedSignal, generalizedSignal.original.dimension);
        if (result.action === 'skipped') {
            skippedCount++;
        }
        else {
            addedCount++;
        }
    }
    logger.info(`[synthesis] Added ${addedCount} signals to principle store (${skippedCount} duplicates skipped)`);
    // Phase 3: Get principles and compress to axioms (requires LLM for CJK/emoji mapping)
    const principles = store.getPrinciples();
    logger.info(`[synthesis] ${principles.length} principles formed`);
    const compression = await compressPrinciplesWithCascade(llm, principles);
    const durationMs = Date.now() - startTime;
    const compressionRatio = compression.axioms.length > 0
        ? signals.length / compression.axioms.length
        : 0;
    logger.info(`[synthesis] Complete: ${signals.length} signals → ${principles.length} principles → ${compression.axioms.length} axioms ` +
        `(${compressionRatio.toFixed(1)}:1 compression) in ${durationMs}ms`);
    const result = {
        principles,
        axioms: compression.axioms,
        unconverged: compression.unconverged,
        effectiveThreshold: compression.cascade.effectiveThreshold,
        guardrails: compression.guardrails,
        durationMs,
        signalCount: signals.length,
        compressionRatio,
    };
    // Call completion callback if provided
    config.onComplete?.(result);
    return result;
}
/**
 * Format synthesis result as report.
 */
export function formatReflectiveLoopReport(result) {
    const lines = [
        '# Synthesis Report',
        '',
        `**Duration**: ${result.durationMs}ms`,
        `**Compression**: ${result.compressionRatio.toFixed(1)}:1`,
        '',
        '## Results',
        '',
        `| Metric | Value |`,
        `|--------|-------|`,
        `| Signals | ${result.signalCount} |`,
        `| Principles | ${result.principles.length} |`,
        `| Axioms | ${result.axioms.length} |`,
        `| Unconverged | ${result.unconverged.length} |`,
        `| Effective Threshold | ${result.effectiveThreshold} |`,
        '',
    ];
    if (result.guardrails.messages.length > 0) {
        lines.push('## Guardrail Warnings');
        lines.push('');
        for (const message of result.guardrails.messages) {
            lines.push(`- ${message}`);
        }
        lines.push('');
    }
    return lines.join('\n');
}
//# sourceMappingURL=reflection-loop.js.map