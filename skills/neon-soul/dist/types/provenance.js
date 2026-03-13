/**
 * Provenance chain for full audit trail from axiom to source.
 */
/** Check if provenance is valid */
export function isValidProvenance(p) {
    return ['self', 'curated', 'external'].includes(p);
}
/** Provenance weight for anti-echo-chamber scoring */
export const PROVENANCE_WEIGHT = {
    external: 2.0, // Strongest - exists independently
    curated: 1.0, // Moderate - you chose it
    self: 0.5, // Weakest for diversity (still valuable for identity)
};
//# sourceMappingURL=provenance.js.map