/**
 * Markdown parser with frontmatter support.
 * Used by template and memory ingestion phases.
 */
export interface MarkdownSection {
    level: number;
    title: string;
    content: string;
    startLine: number;
    endLine: number;
}
export interface ParsedMarkdown {
    frontmatter: Record<string, unknown>;
    content: string;
    sections: MarkdownSection[];
}
/**
 * Parse markdown content with frontmatter and section extraction.
 */
export declare function parseMarkdown(rawContent: string): ParsedMarkdown;
//# sourceMappingURL=markdown-reader.d.ts.map