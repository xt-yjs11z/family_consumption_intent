/**
 * Simple logging abstraction for NEON-SOUL.
 *
 * Provides configurable logging for library code that may run
 * in different contexts (CLI, OpenClaw skill, embedded).
 *
 * M-5 FIX: Centralizes console.warn/error calls to enable:
 * - Silent mode for embedded use
 * - Future structured logging (JSON format)
 * - OpenClaw-specific log routing
 *
 * Usage:
 *   import { logger } from './logger.js';
 *   logger.warn('Something happened', { context: 'value' });
 *   logger.error('Failed', error);
 *
 * Configuration:
 *   logger.configure({ silent: true }); // Suppress all output
 *   logger.configure({ level: 'error' }); // Only errors
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';
interface LoggerConfig {
    /** Minimum log level to output. Default: 'warn' */
    level: LogLevel;
    /** Suppress all output. Default: false */
    silent: boolean;
    /** Output format. Default: 'text' */
    format: 'text' | 'json';
}
export declare const logger: {
    /**
     * Configure the logger.
     */
    configure(options: Partial<LoggerConfig>): void;
    /**
     * Reset to default configuration.
     */
    reset(): void;
    /**
     * Get current configuration.
     */
    getConfig(): Readonly<LoggerConfig>;
    /**
     * Log debug message (development only).
     */
    debug(message: string, context?: Record<string, unknown>): void;
    /**
     * Log informational message.
     */
    info(message: string, context?: Record<string, unknown>): void;
    /**
     * Log warning message.
     */
    warn(message: string, context?: Record<string, unknown>): void;
    /**
     * Log error message.
     */
    error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void;
};
export {};
//# sourceMappingURL=logger.d.ts.map