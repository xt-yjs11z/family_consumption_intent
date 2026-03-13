/**
 * Memory File Walker
 *
 * Traverses OpenClaw's memory directory structure for signal extraction.
 * Uses shared markdown-reader.ts for parsing with memory-specific metadata.
 *
 * Usage:
 *   const walker = createMemoryWalker('~/.openclaw/workspace/memory');
 *   const files = await walker.walk();
 *   const changes = walker.getChangedFiles(previousRun);
 *
 * Directory structure:
 *   ~/.openclaw/workspace/memory/
 *   ├── diary/        - Journal entries
 *   ├── experiences/  - Event memories
 *   ├── goals/        - Aspirations
 *   ├── knowledge/    - Learned facts
 *   ├── relationships/- People & connections
 *   └── preferences/  - Explicit preferences
 */
import { type ParsedMarkdown } from './markdown-reader.js';
/**
 * Memory categories from OpenClaw structure.
 */
export type MemoryCategory = 'diary' | 'experiences' | 'goals' | 'knowledge' | 'relationships' | 'preferences' | 'unknown';
/**
 * Extended parsed markdown with memory-specific metadata.
 */
export interface MemoryFile extends ParsedMarkdown {
    /** Absolute path to file */
    path: string;
    /** Relative path from memory root */
    relativePath: string;
    /** Memory category derived from directory */
    category: MemoryCategory;
    /** File modification time */
    lastModified: Date;
    /** Content hash for change detection */
    contentHash: string;
    /** File size in bytes */
    sizeBytes: number;
}
/**
 * Cache entry for incremental processing.
 */
export interface CacheEntry {
    path: string;
    contentHash: string;
    lastProcessed: Date;
}
/**
 * Walk statistics.
 */
export interface WalkStats {
    totalFiles: number;
    byCategory: Record<MemoryCategory, number>;
    totalBytes: number;
    errors: Array<{
        path: string;
        error: string;
    }>;
}
/**
 * Creates a memory walker instance.
 */
export declare function createMemoryWalker(memoryRoot: string): MemoryWalker;
/**
 * Memory directory walker.
 */
export declare class MemoryWalker {
    private memoryRoot;
    private cache;
    constructor(memoryRoot: string);
    /**
     * Walk the memory directory and return all markdown files.
     */
    walk(): Promise<{
        files: MemoryFile[];
        stats: WalkStats;
    }>;
    /**
     * Get files that have changed since last run.
     */
    getChangedFiles(files: MemoryFile[], previousCache: CacheEntry[]): {
        added: MemoryFile[];
        modified: MemoryFile[];
        removed: string[];
    };
    /**
     * Update cache with processed files.
     */
    updateCache(files: MemoryFile[]): CacheEntry[];
    /**
     * Load cache from JSON.
     */
    loadCache(entries: CacheEntry[]): void;
    /**
     * Export cache to JSON.
     */
    exportCache(): CacheEntry[];
    /**
     * IM-7 FIX: Persist cache to disk for incremental processing across restarts.
     */
    persistCache(filePath: string): Promise<void>;
    /**
     * IM-7 FIX: Load cache from disk.
     */
    loadCacheFromDisk(filePath: string): Promise<boolean>;
    private walkDirectory;
    private parseMemoryFile;
    private getCategoryFromPath;
}
/**
 * Format walk statistics for display.
 */
export declare function formatWalkStats(stats: WalkStats): string;
//# sourceMappingURL=memory-walker.d.ts.map