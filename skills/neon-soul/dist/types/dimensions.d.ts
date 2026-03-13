/**
 * SoulCraft dimension constants for categorizing principles and axioms.
 * Based on OpenClaw's 7 soul dimensions.
 */
export declare const SOULCRAFT_DIMENSIONS: readonly ["identity-core", "character-traits", "voice-presence", "honesty-framework", "boundaries-ethics", "relationship-dynamics", "continuity-growth"];
export type SoulCraftDimension = (typeof SOULCRAFT_DIMENSIONS)[number];
export interface DimensionCoverage {
    dimension: SoulCraftDimension;
    signalCount: number;
    principleCount: number;
    axiomCount: number;
}
//# sourceMappingURL=dimensions.d.ts.map