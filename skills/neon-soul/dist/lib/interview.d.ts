/**
 * Interview Flow Implementation
 *
 * Implements adaptive interview flow for NEON-SOUL that supplements
 * sparse memory areas. Interview responses become signals with embeddings
 * and full provenance tracking.
 *
 * Usage:
 *   const interview = createInterviewFlow(coverage, config);
 *   const questions = interview.getNextQuestions(5);
 *   interview.recordResponse(questionId, responseText);
 *   const signals = await interview.extractSignals();
 *
 * Design:
 *   - Adaptive ordering based on memory gaps
 *   - Follow-up questions triggered by response patterns
 *   - Signal extraction via LLM
 *   - Full provenance for audit trail
 */
import type { InterviewQuestion, InterviewSession, DimensionCoverage, InterviewConfig } from '../types/interview.js';
import type { Signal, SoulCraftDimension } from '../types/signal.js';
/**
 * Creates an interview flow instance.
 */
export declare function createInterviewFlow(coverage: DimensionCoverage[], config?: InterviewConfig): InterviewFlow;
/**
 * Interview flow controller.
 */
export declare class InterviewFlow {
    private session;
    private questionBank;
    private coverage;
    private config;
    private askedQuestions;
    constructor(coverage: DimensionCoverage[], config: InterviewConfig);
    /**
     * Get the next batch of questions, prioritized by dimension gaps.
     */
    getNextQuestions(count?: number): InterviewQuestion[];
    /**
     * Get all questions for a specific dimension.
     */
    getQuestionsForDimension(dimension: SoulCraftDimension): InterviewQuestion[];
    /**
     * Record a user's response to a question.
     */
    recordResponse(questionId: string, text: string): void;
    /**
     * Skip a question (dimension already covered).
     */
    skipQuestion(questionId: string): void;
    /**
     * Extract signals from all responses in this session.
     */
    extractSignals(): Promise<Signal[]>;
    /**
     * Get current session state.
     */
    getSession(): InterviewSession;
    /**
     * Complete the interview session.
     */
    complete(): void;
    /**
     * Abandon the interview session.
     */
    abandon(): void;
    /**
     * IM-7 FIX: Persist session to disk for resumption across restarts.
     */
    persistSession(filePath: string): Promise<void>;
    /**
     * IM-7 FIX: Load session from disk.
     */
    loadSessionFromDisk(filePath: string): Promise<boolean>;
    private getAvailableQuestions;
    /**
     * IM-4 FIX: Priority sorting corrected.
     * Higher priority number = more important = should come first.
     * Sparse dimensions and required questions get priority boost.
     */
    private prioritizeQuestions;
    private extractFromResponse;
    /**
     * IM-5 FIX: Calculate confidence based on response quality indicators.
     */
    private calculateResponseConfidence;
    /**
     * IM-3 FIX: Evaluate follow-up question triggers against response text.
     * Uses keyword-based matching (pipe-separated trigger patterns).
     * Trigger patterns are matched case-insensitively against response text.
     */
    private evaluateFollowUpTriggers;
}
/**
 * Analyze memory signals to determine dimension coverage.
 */
export declare function analyzeCoverage(signals: Signal[], minSignals?: number): DimensionCoverage[];
/**
 * Format interview session summary for display.
 */
export declare function formatInterviewSummary(session: InterviewSession): string;
//# sourceMappingURL=interview.d.ts.map