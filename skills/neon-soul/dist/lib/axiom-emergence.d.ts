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
import type { Principle } from '../types/principle.js';
import type { Axiom } from '../types/axiom.js';
import type { SoulCraftDimension } from '../types/signal.js';
/**
 * Emergent axiom with cross-source metadata.
 */
export interface EmergentAxiom {
    /** The underlying axiom */
    axiom: Axiom;
    /** Memory categories where signals appeared */
    sourceCategories: string[];
    /** Cross-source strength (higher = more diverse sources) */
    strength: number;
    /** Whether this spans 3+ dimensions (core identity) */
    isCoreIdentity: boolean;
    /** Dimensions this axiom touches */
    dimensions: SoulCraftDimension[];
}
/**
 * Emergence statistics.
 */
export interface EmergenceStats {
    /** Total axioms analyzed */
    totalAxioms: number;
    /** Axioms with cross-source signals */
    crossSourceAxioms: number;
    /** Core identity axioms (3+ dimensions) */
    coreIdentityAxioms: number;
    /** Average source category count */
    avgSourceCategories: number;
    /** Category distribution */
    categoryDistribution: Record<string, number>;
    /** Dimension distribution */
    dimensionDistribution: Record<SoulCraftDimension, number>;
}
/**
 * Detect emergent axioms from cross-source analysis.
 */
export declare function detectEmergentAxioms(axioms: Axiom[], principles: Principle[]): EmergentAxiom[];
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
export declare function calculateCrossSourceStrength(categoryCount: number, nCount: number): number;
/**
 * Calculate strength for a principle based on its signals.
 */
export declare function calculatePrincipleStrength(principle: Principle): number;
/**
 * Calculate emergence statistics.
 */
export declare function calculateEmergenceStats(emergentAxioms: EmergentAxiom[]): EmergenceStats;
/**
 * Get core identity axioms (spanning 3+ dimensions).
 */
export declare function getCoreIdentityAxioms(emergentAxioms: EmergentAxiom[]): EmergentAxiom[];
/**
 * Format emergence report.
 */
export declare function formatEmergenceReport(emergentAxioms: EmergentAxiom[], stats: EmergenceStats): string;
//# sourceMappingURL=axiom-emergence.d.ts.map