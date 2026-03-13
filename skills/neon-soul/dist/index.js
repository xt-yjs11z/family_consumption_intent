/**
 * NEON-SOUL: AI Identity Through Grounded Principles
 *
 * OpenClaw skill for soul synthesis with semantic compression.
 * Extracts signals from memory, matches to principles, promotes to axioms.
 *
 * @module neon-soul
 */
export { loadConfig } from './lib/config.js';
export { cosineSimilarity, findBestMatch, DEFAULT_MATCH_THRESHOLD, } from './lib/matcher.js';
export { parseMarkdown } from './lib/markdown-reader.js';
export { createSignalSource, createPrincipleProvenance, createAxiomProvenance, traceToSource, } from './lib/provenance.js';
// Stage 4: extractSignals removed (dead code). Use extractSignalsFromContent instead.
export { extractSignalsFromContent, extractSignalsFromMemoryFiles, } from './lib/signal-extractor.js';
// Stage 12: Signal source classification for identity validity
export { classifyElicitationType, filterForIdentitySynthesis, calculateWeightedSignalCount, ELICITATION_WEIGHT, } from './lib/signal-source-classifier.js';
export { loadState, saveState, shouldRunSynthesis } from './lib/state.js';
export { backupFile, rollback, commitSoulUpdate } from './lib/backup.js';
export { extractFromTemplate, extractFromTemplates, } from './lib/template-extractor.js';
export { createPrincipleStore, } from './lib/principle-store.js';
export { compressPrinciples, generateSoulMd, } from './lib/compressor.js';
export { countTokens, compressionRatio, semanticDensity, calculateMetrics, formatMetricsReport, } from './lib/metrics.js';
export { TrajectoryTracker, calculateStyleMetrics, formatTrajectoryReport, } from './lib/trajectory.js';
export { SOULCRAFT_DIMENSIONS, } from './types/dimensions.js';
// Pipeline and synthesis
export { runPipeline, validateSoulOutput, formatPipelineResult, } from './lib/pipeline.js';
export { runReflectiveLoop, formatReflectiveLoopReport, } from './lib/reflection-loop.js';
export { generateSoul, formatAxiom, generateMinimalSoul, diffSouls, } from './lib/soul-generator.js';
export { collectSources, formatSourceSummary, } from './lib/source-collector.js';
export { createMemoryWalker, } from './lib/memory-walker.js';
// Persistence layer
export { saveSynthesisData, saveSignals, savePrinciples, saveAxioms, loadSynthesisData, loadSignals, loadPrinciples, loadAxioms, } from './lib/persistence.js';
// Path utilities
export { getDefaultMemoryPath, getDefaultOutputPath, getDefaultWorkspacePath, getWorkspaceFromMemory, getNeonSoulPath, resolvePath, OPENCLAW_DEFAULTS, } from './lib/paths.js';
//# sourceMappingURL=index.js.map