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
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    silent: 4,
};
let config = {
    level: 'warn',
    silent: false,
    format: 'text',
};
function shouldLog(level) {
    if (config.silent)
        return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[config.level];
}
function formatMessage(level, message, context) {
    if (config.format === 'json') {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            message,
            ...context,
        });
    }
    const prefix = `[neon-soul:${level}]`;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `${prefix} ${message}${contextStr}`;
}
export const logger = {
    /**
     * Configure the logger.
     */
    configure(options) {
        config = { ...config, ...options };
    },
    /**
     * Reset to default configuration.
     */
    reset() {
        config = { level: 'warn', silent: false, format: 'text' };
    },
    /**
     * Get current configuration.
     */
    getConfig() {
        return { ...config };
    },
    /**
     * Log debug message (development only).
     */
    debug(message, context) {
        if (shouldLog('debug')) {
            console.debug(formatMessage('debug', message, context));
        }
    },
    /**
     * Log informational message.
     */
    info(message, context) {
        if (shouldLog('info')) {
            console.info(formatMessage('info', message, context));
        }
    },
    /**
     * Log warning message.
     */
    warn(message, context) {
        if (shouldLog('warn')) {
            console.warn(formatMessage('warn', message, context));
        }
    },
    /**
     * Log error message.
     */
    error(message, error, context) {
        if (shouldLog('error')) {
            const errorContext = error instanceof Error
                ? { error: error.message, stack: error.stack }
                : error
                    ? { error: String(error) }
                    : {};
            console.error(formatMessage('error', message, { ...errorContext, ...context }));
        }
    },
};
//# sourceMappingURL=logger.js.map