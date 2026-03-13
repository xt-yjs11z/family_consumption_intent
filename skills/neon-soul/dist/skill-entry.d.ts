/**
 * NEON-SOUL Skill Entry Point
 *
 * OpenClaw skill loader entry point.
 * Exports skill metadata and command dispatch function.
 *
 * Usage (OpenClaw):
 *   /neon-soul synthesize [options]
 *   /neon-soul status
 *   /neon-soul rollback [--list]
 *   /neon-soul audit [--list|--stats|<axiom-id>]
 *   /neon-soul trace <axiom-id>
 */
import type { PipelineOptions, PipelineResult } from './lib/pipeline.js';
import type { LLMProvider } from './types/llm.js';
/**
 * Command result structure.
 */
export interface CommandResult {
    success: boolean;
    message?: string;
    data?: unknown;
    error?: string;
}
/**
 * C-2 FIX: Command context provided by OpenClaw dispatcher.
 * Allows forwarding LLM provider to commands that require it.
 */
export interface CommandContext {
    /** LLM provider for semantic classification */
    llm?: LLMProvider;
}
/**
 * Command handler function type.
 * C-2 FIX: Now accepts optional context for LLM forwarding.
 */
export type CommandHandler = (args: string[], context?: CommandContext) => Promise<CommandResult>;
/**
 * Skill metadata.
 */
export declare const skill: {
    name: string;
    version: string;
    description: string;
    /**
     * Available commands.
     * Each command is a lazy-loaded module with a run() function.
     */
    commands: Record<string, () => Promise<{
        run?: CommandHandler;
    }>>;
};
/**
 * Run a skill command.
 *
 * C-2 FIX: Added context parameter to forward LLM provider to commands.
 *
 * @param command - Command name (synthesize, status, rollback, audit, trace)
 * @param args - Command arguments
 * @param context - Optional context with LLM provider (required for synthesize)
 * @returns Command result
 */
export declare function runCommand(command: string, args?: string[], context?: CommandContext): Promise<CommandResult>;
/**
 * Synthesis options with required LLM provider.
 */
export interface SynthesisOptions extends Partial<Omit<PipelineOptions, 'llm'>> {
    /** LLM provider for semantic classification (required) */
    llm: LLMProvider;
}
/**
 * Run synthesis pipeline directly.
 * Convenience export for programmatic usage.
 *
 * @param options - Synthesis options with required LLM provider
 * @returns Pipeline result
 * @throws LLMRequiredError if llm is not provided
 */
export declare function synthesize(options: SynthesisOptions): Promise<PipelineResult>;
/**
 * Get skill status.
 * Convenience export for programmatic usage.
 */
export declare function getStatus(workspacePath?: string): Promise<{
    lastRun: string;
    counts: {
        signals: number;
        principles: number;
        axioms: number;
    };
    dimensionCoverage: number;
}>;
export type { PipelineOptions, PipelineResult } from './lib/pipeline.js';
export type { Signal } from './types/signal.js';
export type { Principle } from './types/principle.js';
export type { Axiom } from './types/axiom.js';
export type { LLMProvider, ClassifyOptions, ClassificationResult } from './types/llm.js';
export { LLMRequiredError } from './types/llm.js';
//# sourceMappingURL=skill-entry.d.ts.map