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
import { appendFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { existsSync } from 'node:fs';
/**
 * Create audit logger.
 */
export function createAuditLogger(outputPath) {
    const sessionId = generateId();
    const startedAt = new Date().toISOString();
    let entryCount = 0;
    const actionCounts = {
        signal_extracted: 0,
        principle_created: 0,
        principle_reinforced: 0,
        axiom_promoted: 0,
        soul_generated: 0,
        iteration_complete: 0,
        attractor_detected: 0,
        backup_created: 0,
        pipeline_started: 0,
        pipeline_completed: 0,
        pipeline_failed: 0,
    };
    let sessionOptions = {};
    async function log(entry) {
        // Ensure directory exists
        const dir = dirname(outputPath);
        if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true });
        }
        // Append entry as JSONL
        const line = JSON.stringify(entry) + '\n';
        await appendFile(outputPath, line);
        entryCount++;
        actionCounts[entry.action]++;
    }
    function createEntry(action, subject, details, provenance) {
        return {
            id: generateId(),
            timestamp: new Date().toISOString(),
            action,
            subject,
            details,
            provenance,
        };
    }
    return {
        async logSignalExtracted(signal) {
            await log(createEntry('signal_extracted', signal.id, {
                type: signal.type,
                text: signal.text.slice(0, 100),
                confidence: signal.confidence,
                dimension: signal.dimension,
                source: signal.source.file,
            }));
        },
        async logPrincipleCreated(principle) {
            await log(createEntry('principle_created', principle.id, {
                text: principle.text.slice(0, 100),
                dimension: principle.dimension,
                n_count: principle.n_count,
                signalCount: principle.derived_from.signals.length,
            }));
        },
        async logPrincipleReinforced(principle, signal) {
            await log(createEntry('principle_reinforced', principle.id, {
                text: principle.text.slice(0, 100),
                newNCount: principle.n_count,
                reinforcingSignal: signal.id,
            }));
        },
        async logAxiomPromoted(axiom, principles) {
            await log(createEntry('axiom_promoted', axiom.id, {
                text: axiom.text.slice(0, 100),
                tier: axiom.tier,
                dimension: axiom.dimension,
                principleCount: principles.length,
            }, {
                axiom: { id: axiom.id, text: axiom.text },
                principles: principles.map((p) => ({
                    id: p.id,
                    text: p.text.slice(0, 50),
                    n_count: p.n_count,
                })),
            }));
        },
        async logSoulGenerated(tokenCount, axiomCount) {
            await log(createEntry('soul_generated', 'soul', {
                tokenCount,
                axiomCount,
            }));
        },
        async logIterationComplete(iteration, metrics) {
            await log(createEntry('iteration_complete', `iteration_${iteration}`, {
                iteration,
                ...metrics,
            }));
        },
        async logAttractorDetected(iteration, strength) {
            await log(createEntry('attractor_detected', `iteration_${iteration}`, {
                iteration,
                strength,
            }));
        },
        async logBackupCreated(backupPath) {
            await log(createEntry('backup_created', 'backup', {
                path: backupPath,
            }));
        },
        async logPipelineStarted(options) {
            sessionOptions = options;
            await log(createEntry('pipeline_started', sessionId, {
                options,
            }));
        },
        async logPipelineCompleted(metrics) {
            await log(createEntry('pipeline_completed', sessionId, {
                metrics,
                duration: Date.now() - new Date(startedAt).getTime(),
            }));
        },
        async logPipelineFailed(error) {
            await log(createEntry('pipeline_failed', sessionId, {
                error,
                duration: Date.now() - new Date(startedAt).getTime(),
            }));
        },
        getSession() {
            return {
                sessionId,
                startedAt,
                options: sessionOptions,
                entryCount,
                actionCounts: { ...actionCounts },
            };
        },
        async close() {
            // Write session summary
            const session = this.getSession();
            session.endedAt = new Date().toISOString();
            const summaryPath = outputPath.replace('.jsonl', '-session.json');
            await writeFile(summaryPath, JSON.stringify(session, null, 2));
        },
    };
}
/**
 * Generate unique ID.
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
/**
 * Format audit entry for display.
 */
export function formatAuditEntry(entry) {
    const time = new Date(entry.timestamp).toLocaleTimeString();
    const action = entry.action.replace(/_/g, ' ');
    let details = '';
    if (entry.details['text']) {
        details = `: "${entry.details['text']}"`;
    }
    else if (entry.details['path']) {
        details = `: ${entry.details['path']}`;
    }
    return `[${time}] ${action}${details}`;
}
/**
 * Generate audit statistics.
 */
export function generateAuditStats(entries) {
    const byAction = {};
    const byDimension = {};
    const timeline = [];
    for (const entry of entries) {
        // Count by action
        byAction[entry.action] = (byAction[entry.action] || 0) + 1;
        // Count by dimension
        const dimension = entry.details['dimension'];
        if (dimension) {
            byDimension[dimension] = (byDimension[dimension] || 0) + 1;
        }
        // Build timeline
        timeline.push({
            time: entry.timestamp,
            action: entry.action,
        });
    }
    return {
        totalEntries: entries.length,
        byAction,
        byDimension,
        timeline,
    };
}
//# sourceMappingURL=audit.js.map