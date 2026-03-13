/**
 * Trajectory tracking for soul synthesis cross-run stability analysis.
 *
 * v0.2.0: Migrated from centroid-based drift to text hash stability.
 * Used by evolution.ts for cross-run analysis (comparing today's synthesis
 * to previous runs), NOT within-run convergence. The synthesis is single-pass.
 *
 * Cross-Reference: docs/plans/2026-02-12-llm-based-similarity.md (Stage 4)
 */
export interface TrajectoryPoint {
    iteration: number;
    principleCount: number;
    axiomCount: number;
    /**
     * v0.2.0: Changed from centroid drift to text stability.
     * Represents percentage of principles unchanged since last run (0-1).
     * Higher = more stable (e.g., 0.9 = 90% of principles unchanged).
     */
    textStability: number;
    timestamp: string;
    /** SHA256 hashes of principle texts for stability comparison */
    principleTextHashes?: string[];
}
export interface TrajectoryMetrics {
    stabilizationRate: number;
    attractorStrength: number;
    trajectoryVariance: number;
    /**
     * v0.2.0: Renamed from semanticDrift to stabilityHistory.
     * Each entry is the text stability percentage for that iteration (0-1).
     */
    stabilityHistory: number[];
    isStable: boolean;
}
export interface StyleMetrics {
    voiceCoherence: number;
    contentSimilarity: number;
    styleContentRatio: number;
}
/**
 * Track trajectory over multiple synthesis runs (cross-run analysis).
 *
 * v0.2.0: Migrated from centroid-based drift to text hash stability.
 * Text stability = percentage of principle texts unchanged between runs.
 *
 * IM-11: Uses sliding window to prevent unbounded memory growth.
 * Keeps only the most recent MAX_TRAJECTORY_POINTS points.
 */
export declare class TrajectoryTracker {
    private points;
    private previousTextHashes;
    private stabilizationThreshold;
    private maxPoints;
    /**
     * Record a trajectory point.
     *
     * @param principleCount - Number of principles in current run
     * @param axiomCount - Number of axioms in current run
     * @param currentPrincipleTexts - Array of principle texts from current run
     */
    recordPoint(principleCount: number, axiomCount: number, currentPrincipleTexts: string[]): TrajectoryPoint;
    /**
     * Calculate trajectory metrics.
     */
    getMetrics(): TrajectoryMetrics;
    /**
     * Calculate variance of a number array.
     */
    private calculateVariance;
    /**
     * Get trajectory points for logging/visualization.
     */
    getPoints(): TrajectoryPoint[];
    /**
     * Reset tracker for new synthesis run.
     */
    reset(): void;
}
/**
 * Calculate style metrics for voice preservation.
 *
 * v0.2.0: This function uses embeddings for style analysis.
 * It is NOT used in the synthesis pipeline (which now uses LLM similarity).
 * Kept for post-synthesis analysis in evolution.ts.
 *
 * Note: If voiceCoherence/contentSimilarity tracking is needed without
 * embeddings, use LLM-based semantic comparison instead.
 */
export declare function calculateStyleMetrics(originalEmbedding: number[], compressedEmbedding: number[]): StyleMetrics;
/**
 * Format trajectory metrics as report.
 */
export declare function formatTrajectoryReport(metrics: TrajectoryMetrics): string;
//# sourceMappingURL=trajectory.d.ts.map