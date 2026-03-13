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
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { existsSync } from 'node:fs';
import { parseMarkdown } from './markdown-reader.js';
import { createMemoryWalker } from './memory-walker.js';
/**
 * Default collector options.
 */
export const DEFAULT_COLLECTOR_OPTIONS = {
    includeSoul: true,
    includeUserContext: true,
    includeInterviews: true,
    memoryCategories: [],
};
/**
 * Collect all input sources from workspace.
 */
export async function collectSources(workspacePath, options = DEFAULT_COLLECTOR_OPTIONS) {
    const opts = { ...DEFAULT_COLLECTOR_OPTIONS, ...options };
    const basePath = expandPath(workspacePath);
    const stats = {
        memoryFileCount: 0,
        memoryContentSize: 0,
        memoryByCategory: {},
        hasExistingSoul: false,
        existingSoulTokens: 0,
        hasUserContext: false,
        interviewSignalCount: 0,
        totalSources: 0,
    };
    // Collect memory files
    const memoryPath = join(basePath, 'memory');
    let memoryFiles = [];
    if (existsSync(memoryPath)) {
        const walker = createMemoryWalker(memoryPath);
        const walkResult = await walker.walk();
        memoryFiles = walkResult.files;
        // Filter by category if specified
        if (opts.memoryCategories && opts.memoryCategories.length > 0) {
            memoryFiles = memoryFiles.filter((f) => opts.memoryCategories.includes(f.category));
        }
        stats.memoryFileCount = memoryFiles.length;
        stats.memoryContentSize = walkResult.stats.totalBytes;
        stats.memoryByCategory = walkResult.stats.byCategory;
        stats.totalSources += memoryFiles.length;
    }
    // Collect existing SOUL.md
    let existingSoul;
    if (opts.includeSoul) {
        const soulPath = join(basePath, 'SOUL.md');
        if (existsSync(soulPath)) {
            existingSoul = await parseSoulFile(soulPath);
            stats.hasExistingSoul = true;
            stats.existingSoulTokens = existingSoul.tokenCount;
            stats.totalSources++;
        }
    }
    // Collect USER.md context
    let userContext;
    if (opts.includeUserContext) {
        const userPath = join(basePath, 'USER.md');
        if (existsSync(userPath)) {
            userContext = await parseUserFile(userPath);
            stats.hasUserContext = true;
            stats.totalSources++;
        }
    }
    // Collect interview responses
    let interviewSignals = [];
    if (opts.includeInterviews) {
        const interviewPath = join(basePath, 'interviews');
        if (existsSync(interviewPath)) {
            interviewSignals = await loadInterviewSignals(interviewPath);
            stats.interviewSignalCount = interviewSignals.length;
            if (interviewSignals.length > 0) {
                stats.totalSources++;
            }
        }
    }
    return {
        memoryFiles,
        existingSoul,
        userContext,
        interviewSignals,
        stats,
    };
}
/**
 * Parse existing SOUL.md file.
 */
async function parseSoulFile(path) {
    const rawContent = await readFile(path, 'utf-8');
    const parsed = parseMarkdown(rawContent);
    // Estimate token count (rough: 4 chars per token)
    const tokenCount = Math.ceil(rawContent.length / 4);
    return {
        path,
        parsed,
        rawContent,
        tokenCount,
    };
}
/**
 * Parse USER.md file.
 */
async function parseUserFile(path) {
    const rawContent = await readFile(path, 'utf-8');
    const parsed = parseMarkdown(rawContent);
    // Extract user name from frontmatter or first heading
    let userName;
    if (parsed.frontmatter['name']) {
        userName = String(parsed.frontmatter['name']);
    }
    else if (parsed.sections.length > 0 && parsed.sections[0]) {
        // Try first H1
        const firstSection = parsed.sections[0];
        if (firstSection.level === 1) {
            userName = firstSection.title;
        }
    }
    // Extract preferences from frontmatter
    const preferences = {};
    if (parsed.frontmatter['preferences']) {
        const prefs = parsed.frontmatter['preferences'];
        if (typeof prefs === 'object' && prefs !== null) {
            for (const [key, value] of Object.entries(prefs)) {
                preferences[key] = String(value);
            }
        }
    }
    return {
        path,
        parsed,
        userName,
        preferences,
    };
}
/**
 * Load interview signals from saved responses.
 */
async function loadInterviewSignals(interviewPath) {
    const signals = [];
    try {
        const files = await readdir(interviewPath);
        const jsonFiles = files.filter((f) => extname(f) === '.json');
        for (const file of jsonFiles) {
            const filePath = join(interviewPath, file);
            const content = await readFile(filePath, 'utf-8');
            try {
                const data = JSON.parse(content);
                if (Array.isArray(data.signals)) {
                    signals.push(...data.signals);
                }
            }
            catch {
                // Skip invalid JSON
            }
        }
    }
    catch {
        // Interview directory doesn't exist or can't be read
    }
    return signals;
}
/**
 * Expand ~ to home directory.
 */
function expandPath(path) {
    return path.replace(/^~/, process.env['HOME'] || '');
}
/**
 * Format source collection as summary.
 */
export function formatSourceSummary(collection) {
    const { stats } = collection;
    const lines = [
        '# Source Collection Summary',
        '',
        '## Statistics',
        '',
        `| Source | Count |`,
        `|--------|-------|`,
        `| Memory files | ${stats.memoryFileCount} |`,
        `| Existing SOUL.md | ${stats.hasExistingSoul ? `Yes (${stats.existingSoulTokens} tokens)` : 'No'} |`,
        `| USER.md | ${stats.hasUserContext ? 'Yes' : 'No'} |`,
        `| Interview signals | ${stats.interviewSignalCount} |`,
        `| **Total sources** | **${stats.totalSources}** |`,
        '',
    ];
    if (Object.keys(stats.memoryByCategory).length > 0) {
        lines.push('## Memory by Category');
        lines.push('');
        lines.push('| Category | Files |');
        lines.push('|----------|-------|');
        for (const [category, count] of Object.entries(stats.memoryByCategory)) {
            if (count > 0) {
                lines.push(`| ${category} | ${count} |`);
            }
        }
        lines.push('');
    }
    if (collection.existingSoul) {
        lines.push('## Existing SOUL.md');
        lines.push('');
        lines.push(`- Path: ${collection.existingSoul.path}`);
        lines.push(`- Sections: ${collection.existingSoul.parsed.sections.length}`);
        lines.push(`- Token estimate: ${collection.existingSoul.tokenCount}`);
        lines.push('');
    }
    if (collection.userContext) {
        lines.push('## USER.md Context');
        lines.push('');
        if (collection.userContext.userName) {
            lines.push(`- User: ${collection.userContext.userName}`);
        }
        const prefCount = Object.keys(collection.userContext.preferences).length;
        if (prefCount > 0) {
            lines.push(`- Preferences: ${prefCount}`);
        }
        lines.push('');
    }
    return lines.join('\n');
}
//# sourceMappingURL=source-collector.js.map