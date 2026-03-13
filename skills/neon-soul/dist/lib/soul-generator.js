/**
 * SOUL.md Generator
 *
 * Generates the final SOUL.md output with all 7 SoulCraft dimensions,
 * formatted axioms, provenance summary, and compression metrics.
 *
 * Usage:
 *   const soul = generateSoul(axioms, principles, options);
 *   const markdown = formatSoulMarkdown(soul);
 *
 * Output structure:
 *   # SOUL.md
 *   ## Identity Core
 *   [axioms for this dimension]
 *   ## Character Traits
 *   ...
 *   ## Provenance
 *   [compressed audit trail]
 */
import { countTokens, compressionRatio } from './metrics.js';
import { extractEssence, DEFAULT_ESSENCE } from './essence-extractor.js';
// Re-export for backward compatibility
export { extractEssence } from './essence-extractor.js';
/**
 * Default generator options.
 */
export const DEFAULT_GENERATOR_OPTIONS = {
    format: 'notated',
    outputFormat: 'prose',
    includeProvenance: true,
    includeMetrics: true,
};
/**
 * Dimension display configuration.
 */
const DIMENSION_CONFIG = {
    'identity-core': { title: 'Identity Core', emoji: '🎯' },
    'character-traits': { title: 'Character Traits', emoji: '🧭' },
    'voice-presence': { title: 'Voice & Presence', emoji: '🎤' },
    'honesty-framework': { title: 'Honesty Framework', emoji: '💎' },
    'boundaries-ethics': { title: 'Boundaries & Ethics', emoji: '🛡️' },
    'relationship-dynamics': { title: 'Relationship Dynamics', emoji: '🤝' },
    'continuity-growth': { title: 'Continuity & Growth', emoji: '🌱' },
};
/**
 * Generate soul from axioms and principles.
 * Now async to support LLM-based essence extraction.
 */
export async function generateSoul(axioms, principles, options = {}) {
    const opts = { ...DEFAULT_GENERATOR_OPTIONS, ...options };
    // Organize axioms by dimension
    const byDimension = new Map();
    const dimensions = [
        'identity-core',
        'character-traits',
        'voice-presence',
        'honesty-framework',
        'boundaries-ethics',
        'relationship-dynamics',
        'continuity-growth',
    ];
    for (const dim of dimensions) {
        byDimension.set(dim, []);
    }
    for (const axiom of axioms) {
        const existing = byDimension.get(axiom.dimension) || [];
        existing.push(axiom);
        byDimension.set(axiom.dimension, existing);
    }
    // Calculate coverage
    const coveredDimensions = dimensions.filter((dim) => (byDimension.get(dim)?.length ?? 0) > 0);
    const coverage = coveredDimensions.length / dimensions.length;
    // Extract essence if LLM provided
    let essenceStatement;
    if (opts.llm) {
        essenceStatement = await extractEssence(axioms, opts.llm);
        // Only use if not the default (indicates successful extraction)
        if (essenceStatement === DEFAULT_ESSENCE) {
            essenceStatement = undefined;
        }
    }
    // Generate markdown content based on output format
    let content;
    if (opts.outputFormat === 'prose' && opts.proseExpansion) {
        content = formatProseSoulMarkdown(opts.proseExpansion, principles, essenceStatement);
    }
    else {
        content = formatSoulMarkdown(byDimension, principles, opts, essenceStatement);
    }
    // Calculate metrics
    const tokenCount = countTokens(content);
    const originalTokenCount = opts.originalContent
        ? countTokens(opts.originalContent)
        : tokenCount * 7; // Estimate 7:1 if no original
    const result = {
        content,
        byDimension,
        coverage,
        tokenCount,
        originalTokenCount,
        compressionRatio: compressionRatio(originalTokenCount, tokenCount),
        generatedAt: new Date(),
    };
    // Only add essenceStatement if it exists (exactOptionalPropertyTypes compliance)
    if (essenceStatement) {
        result.essenceStatement = essenceStatement;
    }
    return result;
}
/**
 * Format axiom in specified notation.
 * Simplified: native (plain text) or notated (LLM-generated CJK/emoji/math).
 */
export function formatAxiom(axiom, format) {
    const canonical = axiom.canonical;
    if (!canonical) {
        return `- ${axiom.text}`;
    }
    switch (format) {
        case 'native':
            return `- ${canonical.native}`;
        case 'notated':
            return `- ${canonical.notated}`;
        default:
            return `- ${axiom.text}`;
    }
}
/**
 * Format complete SOUL.md content.
 */
function formatSoulMarkdown(byDimension, principles, options, essenceStatement) {
    const lines = [];
    // Header - changes based on whether essence is present
    if (essenceStatement) {
        // With essence: "SOUL.md - Who You Are Becoming" (I-5 fix: emphasizes becoming over being)
        const baseTitle = options.title ?? 'SOUL.md';
        lines.push(`# ${baseTitle} - Who You Are Becoming`);
        lines.push('');
        lines.push(`_${essenceStatement}_`);
    }
    else {
        // Without essence: default format
        lines.push(`# ${options.title ?? 'SOUL.md'}`);
        lines.push('');
        lines.push('*AI identity through grounded principles.*');
    }
    lines.push('');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    // Dimension sections
    const dimensions = [
        'identity-core',
        'character-traits',
        'voice-presence',
        'honesty-framework',
        'boundaries-ethics',
        'relationship-dynamics',
        'continuity-growth',
    ];
    for (const dimension of dimensions) {
        const config = DIMENSION_CONFIG[dimension];
        const axioms = byDimension.get(dimension) || [];
        lines.push(`## ${config.emoji} ${config.title}`);
        lines.push('');
        if (axioms.length === 0) {
            lines.push('*No axioms emerged for this dimension.*');
        }
        else {
            for (const axiom of axioms) {
                lines.push(formatAxiom(axiom, options.format));
            }
        }
        lines.push('');
    }
    // Provenance section
    if (options.includeProvenance) {
        lines.push('---');
        lines.push('');
        lines.push('## Provenance');
        lines.push('');
        lines.push('Every axiom traces to source signals. Use `/neon-soul audit <axiom>` for full trace.');
        lines.push('');
        // Summary of sources
        const totalAxioms = Array.from(byDimension.values()).reduce((sum, axioms) => sum + axioms.length, 0);
        const totalPrinciples = principles.length;
        const totalSignals = principles.reduce((sum, p) => sum + (p.derived_from?.signals?.length ?? 0), 0);
        lines.push(`| Level | Count |`);
        lines.push(`|-------|-------|`);
        lines.push(`| Axioms | ${totalAxioms} |`);
        lines.push(`| Principles | ${totalPrinciples} |`);
        lines.push(`| Signals | ${totalSignals} |`);
        lines.push('');
    }
    // Metrics section
    if (options.includeMetrics) {
        lines.push('---');
        lines.push('');
        lines.push('## Metrics');
        lines.push('');
        // Calculate dimension coverage
        const coveredCount = dimensions.filter((dim) => (byDimension.get(dim)?.length ?? 0) > 0).length;
        lines.push(`| Metric | Value |`);
        lines.push(`|--------|-------|`);
        lines.push(`| Dimension coverage | ${coveredCount}/7 (${Math.round((coveredCount / 7) * 100)}%) |`);
        lines.push(`| Notation format | ${options.format} |`);
        lines.push('');
    }
    // Footer
    lines.push('---');
    lines.push('');
    lines.push('*Generated by NEON-SOUL semantic compression pipeline.*');
    lines.push('');
    return lines.join('\n');
}
/**
 * Format prose SOUL.md content.
 * Used when outputFormat is 'prose' and proseExpansion is available.
 */
function formatProseSoulMarkdown(prose, principles, essenceStatement) {
    const lines = [];
    // Header with essence
    // I-3/M-1 FIX: Only show essence if successfully extracted.
    // Previous fallback '_You are becoming._' looked like real content, masking failure.
    lines.push('# SOUL.md');
    lines.push('');
    if (essenceStatement) {
        lines.push(`_${essenceStatement}_`);
        lines.push('');
    }
    lines.push('---');
    lines.push('');
    // Core Truths section
    if (prose.coreTruths) {
        lines.push('## Core Truths');
        lines.push('');
        lines.push(prose.coreTruths);
        lines.push('');
    }
    // Voice section
    if (prose.voice) {
        lines.push('## Voice');
        lines.push('');
        lines.push(prose.voice);
        lines.push('');
    }
    // Boundaries section
    if (prose.boundaries) {
        lines.push('## Boundaries');
        lines.push('');
        lines.push(prose.boundaries);
        lines.push('');
    }
    // Vibe section
    if (prose.vibe) {
        lines.push('## Vibe');
        lines.push('');
        lines.push(prose.vibe);
        lines.push('');
    }
    // Closing tagline
    lines.push('---');
    lines.push('');
    if (prose.closingTagline) {
        lines.push(`_${prose.closingTagline}_`);
    }
    lines.push('');
    // Provenance (compact)
    lines.push('---');
    lines.push('');
    lines.push('## Provenance');
    lines.push('');
    // Calculate stats
    const totalPrinciples = principles.length;
    const totalSignals = principles.reduce((sum, p) => sum + (p.derived_from?.signals?.length ?? 0), 0);
    // I-3 FIX: Use actual axiom count from prose expansion, not dimension approximation
    const axiomCount = prose.axiomCount;
    lines.push('| Level | Count |');
    lines.push('|-------|-------|');
    lines.push(`| Axioms | ${axiomCount} |`);
    lines.push(`| Principles | ${totalPrinciples} |`);
    lines.push(`| Signals | ${totalSignals} |`);
    lines.push('');
    return lines.join('\n');
}
/**
 * Format axiom with tier badge.
 */
export function formatAxiomWithTier(axiom, format) {
    const tierBadge = getTierBadge(axiom.tier);
    const formatted = formatAxiom(axiom, format);
    return `${tierBadge} ${formatted}`;
}
/**
 * Get tier badge.
 */
function getTierBadge(tier) {
    switch (tier) {
        case 'core':
            return '⭐';
        case 'domain':
            return '🔹';
        case 'emerging':
            return '◽';
        default:
            return '';
    }
}
/**
 * Generate minimal soul (axioms only, no decorations).
 */
export function generateMinimalSoul(axioms, format) {
    const lines = ['# SOUL.md', ''];
    for (const axiom of axioms) {
        lines.push(formatAxiom(axiom, format));
    }
    return lines.join('\n');
}
/**
 * Generate diff between two souls.
 */
export function diffSouls(oldSoul, newSoul) {
    const lines = [
        '# Soul Diff',
        '',
        `**Old**: ${oldSoul.tokenCount} tokens`,
        `**New**: ${newSoul.tokenCount} tokens`,
        `**Change**: ${newSoul.tokenCount - oldSoul.tokenCount} tokens`,
        '',
    ];
    const dimensions = [
        'identity-core',
        'character-traits',
        'voice-presence',
        'honesty-framework',
        'boundaries-ethics',
        'relationship-dynamics',
        'continuity-growth',
    ];
    for (const dim of dimensions) {
        const oldAxioms = oldSoul.byDimension.get(dim) || [];
        const newAxioms = newSoul.byDimension.get(dim) || [];
        if (oldAxioms.length !== newAxioms.length) {
            const config = DIMENSION_CONFIG[dim];
            lines.push(`## ${config.title}`);
            lines.push(`- Old: ${oldAxioms.length} axioms`);
            lines.push(`- New: ${newAxioms.length} axioms`);
            lines.push('');
        }
    }
    return lines.join('\n');
}
//# sourceMappingURL=soul-generator.js.map