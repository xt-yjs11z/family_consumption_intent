/**
 * Cross-Source Axiom Emergence
 *
 * Detects axioms that emerge across multiple memory categories,
 * signaling core identity patterns that transcend specific contexts.
 *
 * Usage:
 *   const emergent = detectEmergentAxioms(axioms, principles);
 *   const weighted = calculateCrossSourceStrength(principle);
 *
 * Cross-source principle:
 *   An axiom appearing in diary/, relationships/, AND preferences/
 *   is more likely to be core identity than one appearing only in
 *   a single category. The logarithmic bonus rewards diversity.
 */
/**
 * Detect emergent axioms from cross-source analysis.
 */
export function detectEmergentAxioms(axioms, principles) {
    const principleMap = new Map(principles.map((p) => [p.id, p]));
    const emergent = [];
    for (const axiom of axioms) {
        // Get all contributing principles
        const contributingPrinciples = axiom.derived_from.principles
            .map((ref) => principleMap.get(ref.id))
            .filter((p) => p !== undefined);
        // Collect source categories from all signals
        const categories = new Set();
        const dimensions = new Set();
        for (const principle of contributingPrinciples) {
            for (const signalRef of principle.derived_from.signals) {
                const category = extractCategory(signalRef.source.file);
                if (category) {
                    categories.add(category);
                }
            }
            // Track dimensions
            if (principle.dimension) {
                dimensions.add(principle.dimension);
            }
        }
        // Calculate n_count from contributing principles
        const totalNCount = axiom.derived_from.principles.reduce((sum, p) => sum + p.n_count, 0);
        // Calculate cross-source strength
        const strength = calculateCrossSourceStrength(categories.size, totalNCount);
        // Determine if core identity (3+ dimensions)
        const isCoreIdentity = dimensions.size >= 3;
        emergent.push({
            axiom,
            sourceCategories: Array.from(categories),
            strength,
            isCoreIdentity,
            dimensions: Array.from(dimensions),
        });
    }
    // Sort by strength (highest first)
    emergent.sort((a, b) => b.strength - a.strength);
    return emergent;
}
/**
 * Calculate cross-source strength for a principle.
 * Uses logarithmic bonus to reward source diversity.
 *
 * Formula: strength = n_count * log2(categories + 1)
 *
 * Examples:
 *   - 3 signals from 1 category: 3 * log2(2) = 3.0
 *   - 3 signals from 3 categories: 3 * log2(4) = 6.0
 *   - 5 signals from 5 categories: 5 * log2(6) = 12.9
 */
export function calculateCrossSourceStrength(categoryCount, nCount) {
    const crossSourceBonus = Math.log2(categoryCount + 1);
    return nCount * crossSourceBonus;
}
/**
 * Calculate strength for a principle based on its signals.
 */
export function calculatePrincipleStrength(principle) {
    // Get unique categories from signals
    const categories = new Set();
    for (const signalRef of principle.derived_from.signals) {
        const category = extractCategory(signalRef.source.file);
        if (category) {
            categories.add(category);
        }
    }
    return calculateCrossSourceStrength(categories.size, principle.n_count);
}
/**
 * Extract memory category from file path.
 */
function extractCategory(filePath) {
    // Path format: .../memory/category/file.md
    const parts = filePath.split('/');
    const memoryIndex = parts.indexOf('memory');
    if (memoryIndex >= 0 && parts.length > memoryIndex + 1) {
        return parts[memoryIndex + 1];
    }
    return undefined;
}
/**
 * Calculate emergence statistics.
 */
export function calculateEmergenceStats(emergentAxioms) {
    const categoryDistribution = {};
    const dimensionDistribution = {
        'identity-core': 0,
        'character-traits': 0,
        'voice-presence': 0,
        'honesty-framework': 0,
        'boundaries-ethics': 0,
        'relationship-dynamics': 0,
        'continuity-growth': 0,
    };
    let totalCategories = 0;
    let crossSourceCount = 0;
    let coreIdentityCount = 0;
    for (const ea of emergentAxioms) {
        totalCategories += ea.sourceCategories.length;
        if (ea.sourceCategories.length > 1) {
            crossSourceCount++;
        }
        if (ea.isCoreIdentity) {
            coreIdentityCount++;
        }
        // Count category occurrences
        for (const category of ea.sourceCategories) {
            categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
        }
        // Count dimension occurrences
        for (const dimension of ea.dimensions) {
            dimensionDistribution[dimension]++;
        }
    }
    return {
        totalAxioms: emergentAxioms.length,
        crossSourceAxioms: crossSourceCount,
        coreIdentityAxioms: coreIdentityCount,
        avgSourceCategories: emergentAxioms.length > 0 ? totalCategories / emergentAxioms.length : 0,
        categoryDistribution,
        dimensionDistribution,
    };
}
/**
 * Get core identity axioms (spanning 3+ dimensions).
 */
export function getCoreIdentityAxioms(emergentAxioms) {
    return emergentAxioms.filter((ea) => ea.isCoreIdentity);
}
/**
 * Format emergence report.
 */
export function formatEmergenceReport(emergentAxioms, stats) {
    const lines = [
        '# Axiom Emergence Report',
        '',
        '## Summary',
        '',
        `| Metric | Value |`,
        `|--------|-------|`,
        `| Total axioms | ${stats.totalAxioms} |`,
        `| Cross-source axioms | ${stats.crossSourceAxioms} |`,
        `| Core identity axioms | ${stats.coreIdentityAxioms} |`,
        `| Avg source categories | ${stats.avgSourceCategories.toFixed(2)} |`,
        '',
        '## Category Distribution',
        '',
        '| Category | Axiom Count |',
        '|----------|-------------|',
    ];
    for (const [category, count] of Object.entries(stats.categoryDistribution)) {
        lines.push(`| ${category} | ${count} |`);
    }
    lines.push('');
    lines.push('## Dimension Distribution');
    lines.push('');
    lines.push('| Dimension | Axiom Count |');
    lines.push('|-----------|-------------|');
    for (const [dimension, count] of Object.entries(stats.dimensionDistribution)) {
        if (count > 0) {
            lines.push(`| ${dimension} | ${count} |`);
        }
    }
    if (stats.coreIdentityAxioms > 0) {
        lines.push('');
        lines.push('## Core Identity Axioms (3+ dimensions)');
        lines.push('');
        const coreAxioms = getCoreIdentityAxioms(emergentAxioms);
        for (const ea of coreAxioms) {
            lines.push(`### ${ea.axiom.canonical?.notated || ea.axiom.id}`);
            lines.push('');
            lines.push(`- **Text**: ${ea.axiom.text}`);
            lines.push(`- **Strength**: ${ea.strength.toFixed(2)}`);
            lines.push(`- **Sources**: ${ea.sourceCategories.join(', ')}`);
            lines.push(`- **Dimensions**: ${ea.dimensions.join(', ')}`);
            lines.push('');
        }
    }
    return lines.join('\n');
}
//# sourceMappingURL=axiom-emergence.js.map