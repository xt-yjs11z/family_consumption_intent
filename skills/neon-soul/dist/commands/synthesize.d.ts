/**
 * Synthesize Command
 *
 * Main command for running the soul synthesis pipeline.
 * Invoked as OpenClaw skill: /neon-soul synthesize
 *
 * Usage:
 *   npx tsx src/commands/synthesize.ts [options]
 *
 * Options:
 *   --memory-path <path>   Path to OpenClaw memory directory (default: ~/.openclaw/workspace/memory)
 *   --output-path <path>   Output path for SOUL.md (default: ~/.openclaw/workspace/SOUL.md)
 *   --format <format>      Notation format: native or notated (default: notated)
 *   --force                Run even if below content threshold
 *   --dry-run              Preview changes without writing
 *   --verbose              Show detailed progress
 *
 * Examples:
 *   npx tsx src/commands/synthesize.ts
 *   npx tsx src/commands/synthesize.ts --dry-run
 *   npx tsx src/commands/synthesize.ts --format native --force
 */
import type { LLMProvider } from '../types/llm.js';
/**
 * Skill context provided by OpenClaw when running as a skill.
 */
export interface SkillContext {
    /** LLM provider for semantic classification */
    llm: LLMProvider;
}
/**
 * Programmatic entry point for skill loader.
 * OpenClaw provides the skill context with LLM provider.
 *
 * @param args - Command line arguments
 * @param context - Skill context from OpenClaw (required)
 * @returns Result object with success/error status
 * @throws LLMRequiredError if context.llm is not provided
 */
export declare function run(args: string[], context?: SkillContext): Promise<{
    success: boolean;
    message?: string;
    data?: unknown;
    error?: string;
}>;
//# sourceMappingURL=synthesize.d.ts.map