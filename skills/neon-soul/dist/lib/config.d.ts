/**
 * Configuration system for NEON-SOUL.
 * Loads from .neon-soul/config.json with sensible defaults.
 */
import { z } from 'zod';
declare const NeonSoulConfigSchema: z.ZodObject<{
    notation: z.ZodDefault<z.ZodObject<{
        format: z.ZodDefault<z.ZodEnum<["native", "cjk-labeled", "cjk-math", "cjk-math-emoji"]>>;
        fallback: z.ZodDefault<z.ZodEnum<["native", "cjk-labeled", "cjk-math", "cjk-math-emoji"]>>;
    }, "strip", z.ZodTypeAny, {
        format: "native" | "cjk-labeled" | "cjk-math" | "cjk-math-emoji";
        fallback: "native" | "cjk-labeled" | "cjk-math" | "cjk-math-emoji";
    }, {
        format?: "native" | "cjk-labeled" | "cjk-math" | "cjk-math-emoji" | undefined;
        fallback?: "native" | "cjk-labeled" | "cjk-math" | "cjk-math-emoji" | undefined;
    }>>;
    matching: z.ZodDefault<z.ZodObject<{
        /**
         * Similarity threshold for principle clustering.
         *
         * For generalized signals (abstract "Values X over Y" patterns),
         * a lower threshold is recommended because:
         * 1. Generalized forms use standardized patterns
         * 2. Semantic similarity is measured on abstract concepts
         * 3. Within-cluster similarities typically range 0.75-0.85
         *
         * Default: 0.75 (based on empirical analysis of generalized signals)
         * @see docs/issues/2026-02-10-generalized-signal-threshold-gap.md
         */
        similarityThreshold: z.ZodDefault<z.ZodNumber>;
        embeddingModel: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        similarityThreshold: number;
        embeddingModel: string;
    }, {
        similarityThreshold?: number | undefined;
        embeddingModel?: string | undefined;
    }>>;
    paths: z.ZodDefault<z.ZodObject<{
        memory: z.ZodDefault<z.ZodString>;
        distilled: z.ZodDefault<z.ZodString>;
        output: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        memory: string;
        distilled: string;
        output: string;
    }, {
        memory?: string | undefined;
        distilled?: string | undefined;
        output?: string | undefined;
    }>>;
    synthesis: z.ZodDefault<z.ZodObject<{
        contentThreshold: z.ZodDefault<z.ZodNumber>;
        autoCommit: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        contentThreshold: number;
        autoCommit: boolean;
    }, {
        contentThreshold?: number | undefined;
        autoCommit?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    notation: {
        format: "native" | "cjk-labeled" | "cjk-math" | "cjk-math-emoji";
        fallback: "native" | "cjk-labeled" | "cjk-math" | "cjk-math-emoji";
    };
    matching: {
        similarityThreshold: number;
        embeddingModel: string;
    };
    paths: {
        memory: string;
        distilled: string;
        output: string;
    };
    synthesis: {
        contentThreshold: number;
        autoCommit: boolean;
    };
}, {
    notation?: {
        format?: "native" | "cjk-labeled" | "cjk-math" | "cjk-math-emoji" | undefined;
        fallback?: "native" | "cjk-labeled" | "cjk-math" | "cjk-math-emoji" | undefined;
    } | undefined;
    matching?: {
        similarityThreshold?: number | undefined;
        embeddingModel?: string | undefined;
    } | undefined;
    paths?: {
        memory?: string | undefined;
        distilled?: string | undefined;
        output?: string | undefined;
    } | undefined;
    synthesis?: {
        contentThreshold?: number | undefined;
        autoCommit?: boolean | undefined;
    } | undefined;
}>;
export type NeonSoulConfig = z.infer<typeof NeonSoulConfigSchema>;
/**
 * Load configuration from .neon-soul/config.json.
 * Falls back to defaults if file doesn't exist.
 */
export declare function loadConfig(workspacePath?: string): NeonSoulConfig;
export {};
//# sourceMappingURL=config.d.ts.map