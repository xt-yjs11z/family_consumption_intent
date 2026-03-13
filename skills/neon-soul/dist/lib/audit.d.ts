/**
 * Audit Trail
 *
 * Generates comprehensive audit trails for soul synthesis operations.
 * Every axiom traces back to source signals with full provenance.
 *
 * Usage:
 *   const logger = createAuditLogger('output/audit.jsonl');
 *   logger.logSignalExtracted(signal);
 *   logger.logAxiomPromoted(axiom, principles);
 *
 * Output format: JSONL (one JSON object per line)
 */
import type { Signal } from '../types/signal.js';
import type { Principle } from '../types/principle.js';
import type { Axiom } from '../types/axiom.js';
import type { ProvenanceChain } from '../types/provenance.js';
/**
 * Audit entry types.
 */
export type AuditAction = 'signal_extracted' | 'principle_created' | 'principle_reinforced' | 'axiom_promoted' | 'soul_generated' | 'iteration_complete' | 'attractor_detected' | 'backup_created' | 'pipeline_started' | 'pipeline_completed' | 'pipeline_failed';
/**
 * Single audit log entry.
 */
export interface AuditEntry {
    /** Unique entry ID */
    id: string;
    /** Entry timestamp */
    timestamp: string;
    /** Action type */
    action: AuditAction;
    /** Subject ID (signal, principle, or axiom ID) */
    subject: string;
    /** Action details */
    details: Record<string, unknown>;
    /** Provenance chain (for traceable actions) */
    provenance: Partial<ProvenanceChain> | undefined;
}
/**
 * Audit session metadata.
 */
export interface AuditSession {
    /** Session ID */
    sessionId: string;
    /** Start timestamp */
    startedAt: string;
    /** End timestamp */
    endedAt?: string;
    /** Pipeline options */
    options: Record<string, unknown>;
    /** Entry count */
    entryCount: number;
    /** Action counts */
    actionCounts: Record<AuditAction, number>;
}
/**
 * Audit logger instance.
 */
export interface AuditLogger {
    /** Log signal extraction */
    logSignalExtracted: (signal: Signal) => Promise<void>;
    /** Log principle creation */
    logPrincipleCreated: (principle: Principle) => Promise<void>;
    /** Log principle reinforcement */
    logPrincipleReinforced: (principle: Principle, signal: Signal) => Promise<void>;
    /** Log axiom promotion */
    logAxiomPromoted: (axiom: Axiom, principles: Principle[]) => Promise<void>;
    /** Log soul generation */
    logSoulGenerated: (tokenCount: number, axiomCount: number) => Promise<void>;
    /** Log iteration complete */
    logIterationComplete: (iteration: number, metrics: Record<string, number>) => Promise<void>;
    /** Log attractor detected */
    logAttractorDetected: (iteration: number, strength: number) => Promise<void>;
    /** Log backup created */
    logBackupCreated: (backupPath: string) => Promise<void>;
    /** Log pipeline start */
    logPipelineStarted: (options: Record<string, unknown>) => Promise<void>;
    /** Log pipeline complete */
    logPipelineCompleted: (metrics: Record<string, unknown>) => Promise<void>;
    /** Log pipeline failure */
    logPipelineFailed: (error: string) => Promise<void>;
    /** Get session metadata */
    getSession: () => AuditSession;
    /** Close logger */
    close: () => Promise<void>;
}
/**
 * Create audit logger.
 */
export declare function createAuditLogger(outputPath: string): AuditLogger;
/**
 * Format audit entry for display.
 */
export declare function formatAuditEntry(entry: AuditEntry): string;
/**
 * Generate audit statistics.
 */
export declare function generateAuditStats(entries: AuditEntry[]): {
    totalEntries: number;
    byAction: Record<string, number>;
    byDimension: Record<string, number>;
    timeline: Array<{
        time: string;
        action: string;
    }>;
};
//# sourceMappingURL=audit.d.ts.map