/**
 * Pipeline Orchestrator
 *
 * Coordinates the full soul synthesis pipeline from memory ingestion
 * to SOUL.md generation with iterative reflection and trajectory tracking.
 *
 * Usage:
 *   const result = await runPipeline({ memoryPath, outputPath });
 *   const result = await runPipeline({ memoryPath, dryRun: true });
 *
 * Stages:
 *   1. check-threshold - Skip if not enough new memory
 *   2. collect-sources - Gather memory files, SOUL.md, USER.md
 *   3. extract-signals - Extract signals from all sources
 *   4. reflective-synthesis - Iterative principle → axiom synthesis
 *   5. validate-output - Reject empty/malformed output
 *   6. backup-current - Safety backup before write
 *   7. generate-soul - Generate new SOUL.md
 *   8. commit-changes - Auto-commit if git repo
 */
import { type SourceCollection as CollectedSources } from './source-collector.js';
import type { Signal } from '../types/signal.js';
import type { Principle } from '../types/principle.js';
import type { Axiom } from '../types/axiom.js';
import type { LLMProvider } from '../types/llm.js';
import type { ProseExpansion } from './prose-expander.js';
/**
 * Pipeline configuration options.
 */
export interface PipelineOptions {
    /** Path to OpenClaw memory directory */
    memoryPath: string;
    /** Output path for generated SOUL.md */
    outputPath: string;
    /** LLM provider for semantic classification (required) */
    llm: LLMProvider;
    /** Minimum new content (chars) to trigger synthesis */
    contentThreshold?: number;
    /** Force run even if below threshold */
    force?: boolean;
    /** Preview changes without writing */
    dryRun?: boolean;
    /** Show diff of changes */
    showDiff?: boolean;
    /** Output notation format (legacy, used when outputFormat is 'notation') */
    format?: 'native' | 'notated';
    /** Output format: 'prose' for inhabitable soul, 'notation' for legacy */
    outputFormat?: 'prose' | 'notation';
    /** I-4 FIX: Strict mode fails pipeline on prose expansion errors instead of falling back */
    strictMode?: boolean;
    /** Progress callback */
    onProgress?: (stage: string, progress: number, message: string) => void;
}
/**
 * Default pipeline options.
 */
export declare const DEFAULT_PIPELINE_OPTIONS: Partial<PipelineOptions>;
/**
 * Pipeline execution context passed between stages.
 */
export interface PipelineContext {
    /** Configuration options */
    options: PipelineOptions;
    /** Current stage name */
    currentStage: string;
    /** Whether pipeline was skipped (threshold not met) */
    skipped: boolean;
    /** Skip reason if skipped */
    skipReason?: string;
    /** Collected source files (summary) */
    sources?: SourceCollection;
    /** MN-5 FIX: Full collected sources from source-collector */
    collectedSources?: CollectedSources;
    /** Extracted signals */
    signals?: Signal[];
    /** Generated principles */
    principles?: Principle[];
    /** Generated axioms */
    axioms?: Axiom[];
    /** Synthesis duration in milliseconds */
    synthesisDurationMs?: number;
    /** Effective N-threshold used (from cascade) */
    effectiveThreshold?: number;
    /** Prose expansion result (if outputFormat is 'prose') */
    proseExpansion?: ProseExpansion;
    /** Generated SOUL.md content */
    soulContent?: string;
    /** Backup path if created */
    backupPath?: string;
    /** Whether changes were committed */
    committed?: boolean;
    /** Error if pipeline failed */
    error?: Error;
    /** Timing information */
    timing: {
        startTime: Date;
        endTime?: Date;
        stageTimes: Record<string, number>;
    };
}
/**
 * Source collection from input gathering.
 */
export interface SourceCollection {
    /** Memory files from memory/ directory */
    memoryFiles: string[];
    /** Existing SOUL.md path (if exists) */
    existingSoulPath?: string;
    /** USER.md path (if exists) */
    userContextPath?: string;
    /** Interview response files */
    interviewFiles: string[];
    /** Total source count */
    totalSources: number;
    /** Total content size (chars) */
    totalContentSize: number;
}
/**
 * Pipeline stage definition.
 * IM-5 FIX: Removed unused rollback field - recovery uses backup file
 */
export interface PipelineStage {
    /** Stage name */
    name: string;
    /** Execute the stage */
    execute: (context: PipelineContext) => Promise<PipelineContext>;
    /** Whether to skip this stage in dry-run mode */
    skipInDryRun?: boolean;
}
/**
 * Pipeline result.
 */
export interface PipelineResult {
    /** Whether pipeline completed successfully */
    success: boolean;
    /** Whether pipeline was skipped */
    skipped: boolean;
    /** Skip reason if skipped */
    skipReason: string | undefined;
    /** Error if failed */
    error: Error | undefined;
    /** Final context */
    context: PipelineContext;
    /** Metrics summary */
    metrics: {
        signalCount: number;
        principleCount: number;
        axiomCount: number;
        compressionRatio: number;
        dimensionCoverage: number;
        synthesisDurationMs: number | undefined;
        effectiveThreshold: number | undefined;
    };
}
/**
 * Validation result for soul output.
 */
export interface ValidationResult {
    valid: boolean;
    reason?: string;
    warnings: string[];
}
/**
 * Run the full soul synthesis pipeline.
 *
 * @throws LLMRequiredError if llm is not provided in options
 */
export declare function runPipeline(options: PipelineOptions): Promise<PipelineResult>;
/**
 * Validate generated soul output.
 *
 * Always returns valid=true with warnings. The cascading threshold in
 * compressor.ts handles adaptation - validation just observes and warns.
 * Add --strict flag for CI if hard failures are needed (separate concern).
 */
export declare function validateSoulOutput(context: PipelineContext): ValidationResult;
/**
 * Format pipeline result as summary.
 */
export declare function formatPipelineResult(result: PipelineResult): string;
//# sourceMappingURL=pipeline.d.ts.map