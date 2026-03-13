/**
 * Signal types for capturing behavioral patterns from memory.
 */
/**
 * Map canonical PBD vocabulary to SignalStance.
 * Used for interop with systems using canonical names (e.g., essence-router).
 * See: multiverse/artifacts/guides/methodology/PBD_VOCABULARY.md
 */
export function mapCanonicalStance(canonical) {
    switch (canonical.toUpperCase()) {
        case 'AFFIRMING':
        case 'ASSERT':
            return 'assert';
        case 'QUALIFYING':
        case 'QUALIFY':
            return 'qualify';
        case 'TENSIONING':
            return 'tensioning';
        case 'QUESTIONING':
        case 'QUESTION':
            return 'question';
        case 'DENYING':
        case 'DENY':
            return 'deny';
        default:
            return 'assert';
    }
}
//# sourceMappingURL=signal.js.map