/**
 * LLM Provider implementations for NEON-SOUL.
 *
 * Available providers:
 * - OllamaLLMProvider: Local LLM via Ollama (no API keys required)
 *
 * Usage:
 *   import { OllamaLLMProvider } from './llm-providers/index.js';
 *   const llm = new OllamaLLMProvider({ model: 'llama3' });
 *
 * Cross-Reference: docs/plans/2026-02-08-ollama-llm-provider.md
 */
export { OllamaLLMProvider, OllamaNotAvailableError, } from './ollama-provider.js';
export { VCRLLMProvider, FixtureMissingError, createVCRProvider, } from './vcr-provider.js';
//# sourceMappingURL=index.js.map