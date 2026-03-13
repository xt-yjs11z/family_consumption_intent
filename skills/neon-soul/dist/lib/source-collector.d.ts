/**
 * Source Collector
 *
 * Collects all input sources for soul synthesis from the OpenClaw workspace.
 * Sources include memory files, existing SOUL.md, USER.md, and interview responses.
 *
 * Usage:
 *   const sources = await collectSources('~/.openclaw/workspace');
 *
 * Architecture Note:
 *   OpenClaw never updates SOUL.md after initial bootstrap (it's read-only).
 *   Therefore, we use single-track architecture - NEON-SOUL generates a new
 *   compressed SOUL.md that replaces the original.
 *
 * Input Sources:
 *   ~/.openclaw/workspace/
 *   ├── memory/*.md           # Primary: accumulated memory files
 *   ├── SOUL.md               # Bootstrap: initial soul (high-signal input)
 *   ├── USER.md               # Context: user preferences
 *   └── interview responses   # Supplement: for sparse dimensions
 */
import { type ParsedMarkdown } from './markdown-reader.js';
import { type MemoryFile } from './memory-walker.js';
import type { Signal } from '../types/signal.js';
/**
 * Collected sources for synthesis.
 */
export interface SourceCollection {
    /** Parsed memory files */
    memoryFiles: MemoryFile[];
    /** Existing SOUL.md content (if exists) */
    existingSoul: ParsedSoul | undefined;
    /** USER.md content (if exists) */
    userContext: UserContext | undefined;
    /** Interview response signals */
    interviewSignals: Signal[];
    /** Statistics */
    stats: SourceStats;
}
/**
 * Parsed existing SOUL.md.
 */
export interface ParsedSoul {
    /** File path */
    path: string;
    /** Parsed markdown */
    parsed: ParsedMarkdown;
    /** Raw content */
    rawContent: string;
    /** Token count estimate */
    tokenCount: number;
}
/**
 * Parsed USER.md context.
 */
export interface UserContext {
    /** File path */
    path: string;
    /** Parsed markdown */
    parsed: ParsedMarkdown;
    /** User name if found */
    userName: string | undefined;
    /** Preferences if found */
    preferences: Record<string, string>;
}
/**
 * Collection statistics.
 */
export interface SourceStats {
    /** Total memory files */
    memoryFileCount: number;
    /** Total memory content size (chars) */
    memoryContentSize: number;
    /** Memory files by category */
    memoryByCategory: Record<string, number>;
    /** Has existing SOUL.md */
    hasExistingSoul: boolean;
    /** Existing SOUL.md token count */
    existingSoulTokens: number;
    /** Has USER.md */
    hasUserContext: boolean;
    /** Interview signal count */
    interviewSignalCount: number;
    /** Total sources */
    totalSources: number;
}
/**
 * Source collector options.
 */
export interface CollectorOptions {
    /** Include existing SOUL.md as input */
    includeSoul?: boolean;
    /** Include USER.md for context */
    includeUserContext?: boolean;
    /** Include interview responses */
    includeInterviews?: boolean;
    /** Memory categories to include (empty = all) */
    memoryCategories?: string[];
}
/**
 * Default collector options.
 */
export declare const DEFAULT_COLLECTOR_OPTIONS: CollectorOptions;
/**
 * Collect all input sources from workspace.
 */
export declare function collectSources(workspacePath: string, options?: CollectorOptions): Promise<SourceCollection>;
/**
 * Format source collection as summary.
 */
export declare function formatSourceSummary(collection: SourceCollection): string;
//# sourceMappingURL=source-collector.d.ts.map