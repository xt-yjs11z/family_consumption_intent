/**
 * Provenance chain builders for audit trails.
 * Every axiom traces back to source signals.
 */
import type { SignalSource, Signal } from '../types/signal.js';
import type { Principle, PrincipleProvenance } from '../types/principle.js';
import type { Axiom, AxiomProvenance } from '../types/axiom.js';
import type { ProvenanceChain } from '../types/provenance.js';
/**
 * Create a signal source with timestamp.
 */
export declare function createSignalSource(file: string, line: number, context: string, type?: 'memory' | 'interview' | 'template'): SignalSource;
/**
 * Create principle provenance from contributing signals.
 */
export declare function createPrincipleProvenance(signals: Array<{
    signal: Signal;
    similarity: number;
}>): PrincipleProvenance;
/**
 * Create axiom provenance from contributing principles.
 */
export declare function createAxiomProvenance(principles: Principle[]): AxiomProvenance;
/**
 * Build full provenance chain from axiom to original sources.
 * Used for transparency and audit trails.
 */
export declare function traceToSource(axiom: Axiom, principleMap: Map<string, Principle>, signalMap: Map<string, Signal>): ProvenanceChain;
//# sourceMappingURL=provenance.d.ts.map