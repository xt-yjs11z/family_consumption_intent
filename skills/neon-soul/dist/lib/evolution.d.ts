/**
 * Soul Evolution Tracking
 *
 * Tracks how the soul changes over time through multiple synthesis runs.
 * Stores historical versions with embeddings and metrics for analysis.
 *
 * Usage:
 *   const tracker = createEvolutionTracker('output/souls/history');
 *   await tracker.saveVersion(soul, metrics);
 *   const history = await tracker.getHistory();
 *
 * Storage structure:
 *   output/souls/history/
 *   ├── latest -> 2026-02-07T12:00:00Z/
 *   ├── 2026-02-07T12:00:00Z/
 *   │   ├── soul.md
 *   │   ├── soul-embedding.json
 *   │   ├── metrics.json
 *   │   ├── trajectory.json
 *   │   └── provenance.json
 *   └── ...
 */
import type { TrajectoryMetrics } from './trajectory.js';
import type { GeneratedSoul } from './soul-generator.js';
/**
 * Soul version metadata.
 */
export interface SoulVersion {
    /** Version timestamp */
    timestamp: string;
    /** Version directory path */
    path: string;
    /** Soul content hash */
    contentHash: string;
    /** Token count */
    tokenCount: number;
    /** Axiom count */
    axiomCount: number;
    /** Dimension coverage */
    coverage: number;
}
/**
 * Evolution metrics between versions.
 */
export interface EvolutionMetrics {
    /** Semantic similarity to previous version */
    previousSimilarity: number;
    /** Semantic similarity to first version */
    originSimilarity: number;
    /** Axiom retention rate (% preserved) */
    axiomRetention: number;
    /** Semantic drift from v0 */
    semanticDrift: number;
    /** Voice coherence score */
    voiceCoherence: number;
}
/**
 * Full evolution history.
 */
export interface EvolutionHistory {
    /** All versions, oldest first */
    versions: SoulVersion[];
    /** Latest version */
    latest: SoulVersion | undefined;
    /** First version */
    origin: SoulVersion | undefined;
    /** Total version count */
    count: number;
}
/**
 * Saved version data.
 */
export interface VersionData {
    /** Soul markdown content */
    soulContent: string;
    /**
     * @deprecated Since v0.2.0, embeddings are no longer generated.
     * This field is kept for backward compatibility with existing version files.
     */
    embedding?: number[];
    /** Metrics */
    metrics: {
        tokenCount: number;
        axiomCount: number;
        principleCount: number;
        coverage: number;
        compressionRatio: number;
    };
    /** Trajectory metrics */
    trajectory: TrajectoryMetrics | undefined;
    /** Evolution metrics (if not first version) */
    evolution: EvolutionMetrics | undefined;
}
/**
 * Evolution tracker instance.
 */
export interface EvolutionTracker {
    /** Save new version */
    saveVersion: (soul: GeneratedSoul, trajectory?: TrajectoryMetrics) => Promise<SoulVersion>;
    /** Get version history */
    getHistory: () => Promise<EvolutionHistory>;
    /** Get specific version */
    getVersion: (timestamp: string) => Promise<VersionData | undefined>;
    /** Get latest version */
    getLatest: () => Promise<VersionData | undefined>;
    /** Compare two versions */
    compare: (v1: string, v2: string) => Promise<EvolutionMetrics | undefined>;
}
/**
 * Create evolution tracker.
 */
export declare function createEvolutionTracker(historyPath: string): EvolutionTracker;
/**
 * Format evolution history as report.
 */
export declare function formatEvolutionReport(history: EvolutionHistory): string;
//# sourceMappingURL=evolution.d.ts.map