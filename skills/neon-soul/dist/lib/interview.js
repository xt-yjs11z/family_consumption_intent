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
import { randomUUID } from 'node:crypto';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { DEFAULT_INTERVIEW_CONFIG } from '../types/interview.js';
import { QUESTION_BANK } from './question-bank.js';
/**
 * Creates an interview flow instance.
 */
export function createInterviewFlow(coverage, config = DEFAULT_INTERVIEW_CONFIG) {
    return new InterviewFlow(coverage, config);
}
/**
 * Interview flow controller.
 */
export class InterviewFlow {
    session;
    questionBank;
    coverage;
    config;
    askedQuestions = new Set();
    constructor(coverage, config) {
        this.config = config;
        this.questionBank = QUESTION_BANK;
        this.coverage = new Map(coverage.map((c) => [c.dimension, c]));
        // Identify sparse dimensions
        const sparseDimensions = coverage
            .filter((c) => c.isSparse)
            .map((c) => c.dimension);
        this.session = {
            id: randomUUID(),
            startedAt: new Date(),
            completedAt: null,
            responses: [],
            skippedQuestions: [],
            sparseDimensions,
            status: 'in_progress',
        };
    }
    /**
     * Get the next batch of questions, prioritized by dimension gaps.
     */
    getNextQuestions(count) {
        const maxQuestions = count ?? this.config.maxQuestionsPerSession;
        const available = this.getAvailableQuestions();
        const prioritized = this.prioritizeQuestions(available);
        return prioritized.slice(0, maxQuestions);
    }
    /**
     * Get all questions for a specific dimension.
     */
    getQuestionsForDimension(dimension) {
        return this.questionBank.byDimension.get(dimension) || [];
    }
    /**
     * Record a user's response to a question.
     */
    recordResponse(questionId, text) {
        const response = {
            questionId,
            text,
            respondedAt: new Date(),
            followUpResponses: [],
        };
        this.session.responses.push(response);
        this.askedQuestions.add(questionId);
    }
    /**
     * Skip a question (dimension already covered).
     */
    skipQuestion(questionId) {
        this.session.skippedQuestions.push(questionId);
        this.askedQuestions.add(questionId);
    }
    /**
     * Extract signals from all responses in this session.
     */
    async extractSignals() {
        const signals = [];
        for (const response of this.session.responses) {
            const question = this.questionBank.questions.get(response.questionId);
            if (!question)
                continue;
            const extracted = await this.extractFromResponse(question, response);
            signals.push(...extracted);
        }
        return signals;
    }
    /**
     * Get current session state.
     */
    getSession() {
        return { ...this.session };
    }
    /**
     * Complete the interview session.
     */
    complete() {
        this.session.completedAt = new Date();
        this.session.status = 'completed';
    }
    /**
     * Abandon the interview session.
     */
    abandon() {
        this.session.completedAt = new Date();
        this.session.status = 'abandoned';
    }
    /**
     * IM-7 FIX: Persist session to disk for resumption across restarts.
     */
    async persistSession(filePath) {
        const data = {
            session: this.session,
            askedQuestions: Array.from(this.askedQuestions),
        };
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    }
    /**
     * IM-7 FIX: Load session from disk.
     */
    async loadSessionFromDisk(filePath) {
        try {
            const content = await readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            // Restore session state
            this.session = {
                ...data.session,
                startedAt: new Date(data.session.startedAt),
                completedAt: data.session.completedAt ? new Date(data.session.completedAt) : null,
            };
            this.askedQuestions = new Set(data.askedQuestions);
            return true;
        }
        catch {
            // File doesn't exist or is invalid - continue with fresh session
            return false;
        }
    }
    // Private methods
    getAvailableQuestions() {
        const available = [];
        for (const [_id, question] of this.questionBank.questions) {
            // Skip already asked/skipped
            if (this.askedQuestions.has(question.id))
                continue;
            // Skip if dimension well covered
            const dimCoverage = this.coverage.get(question.dimension);
            if (dimCoverage && !dimCoverage.isSparse && !question.required) {
                continue;
            }
            available.push(question);
        }
        return available;
    }
    /**
     * IM-4 FIX: Priority sorting corrected.
     * Higher priority number = more important = should come first.
     * Sparse dimensions and required questions get priority boost.
     */
    prioritizeQuestions(questions) {
        return [...questions].sort((a, b) => {
            // Sparse dimensions get priority boost (+2)
            const aSparsity = this.session.sparseDimensions.includes(a.dimension) ? 2 : 0;
            const bSparsity = this.session.sparseDimensions.includes(b.dimension) ? 2 : 0;
            // Required questions get priority boost (+1)
            const aRequired = a.required ? 1 : 0;
            const bRequired = b.required ? 1 : 0;
            // IM-4 FIX: Higher adjusted priority = earlier (descending order)
            const aPriority = a.priority + aSparsity + aRequired;
            const bPriority = b.priority + bSparsity + bRequired;
            return bPriority - aPriority; // Descending: higher comes first
        });
    }
    async extractFromResponse(question, response) {
        const signals = [];
        // IM-6 FIX: Truncate text to prevent memory issues
        const MAX_TEXT_LENGTH = 2000;
        const truncatedText = response.text.slice(0, MAX_TEXT_LENGTH);
        // IM-5 FIX: Derive confidence from response quality indicators
        const confidence = this.calculateResponseConfidence(response.text);
        const signal = {
            id: randomUUID(),
            type: question.signalType,
            text: truncatedText.slice(0, 200), // Further truncate for signal text
            confidence,
            dimension: question.dimension,
            source: {
                type: 'interview',
                file: `interview-session-${this.session.id}`,
                section: question.id,
                extractedAt: new Date(),
                context: question.text,
            },
        };
        signals.push(signal);
        // IM-3 FIX: Check for follow-up question triggers
        // Note: Follow-up trigger evaluation now uses LLM-based similarity (see matcher.ts)
        const triggeredFollowUps = await this.evaluateFollowUpTriggers(question, response.text);
        for (const followUp of triggeredFollowUps) {
            // Check if follow-up was already answered
            const followUpResponse = response.followUpResponses?.find((fr) => fr.followUpId === followUp.id);
            if (followUpResponse) {
                const followUpTruncated = followUpResponse.text.slice(0, MAX_TEXT_LENGTH);
                signals.push({
                    id: randomUUID(),
                    type: followUp.signalType,
                    text: followUpTruncated.slice(0, 200),
                    confidence: this.calculateResponseConfidence(followUpResponse.text),
                    dimension: question.dimension,
                    source: {
                        type: 'interview',
                        file: `interview-session-${this.session.id}`,
                        section: followUp.id,
                        extractedAt: new Date(),
                        context: followUp.text,
                    },
                });
            }
        }
        return signals;
    }
    /**
     * IM-5 FIX: Calculate confidence based on response quality indicators.
     */
    calculateResponseConfidence(text) {
        let confidence = 0.7; // Base confidence
        // Longer, more detailed responses indicate higher confidence
        if (text.length > 100)
            confidence += 0.05;
        if (text.length > 300)
            confidence += 0.05;
        // Specific language indicates clarity
        if (/always|never|must|core|fundamental|important/i.test(text)) {
            confidence += 0.1;
        }
        // Hedging language decreases confidence
        if (/maybe|sometimes|not sure|depends|i think/i.test(text)) {
            confidence -= 0.1;
        }
        return Math.max(0.5, Math.min(0.95, confidence));
    }
    /**
     * IM-3 FIX: Evaluate follow-up question triggers against response text.
     * Uses keyword-based matching (pipe-separated trigger patterns).
     * Trigger patterns are matched case-insensitively against response text.
     */
    evaluateFollowUpTriggers(question, responseText) {
        if (!question.followUps || question.followUps.length === 0) {
            return [];
        }
        const triggeredFollowUps = [];
        const lowerResponse = responseText.toLowerCase();
        for (const followUp of question.followUps) {
            // Trigger pattern is a pipe-separated list of keywords/phrases
            const triggerPatterns = followUp.trigger.split('|');
            // Check if any trigger pattern matches (case-insensitive)
            const isTriggered = triggerPatterns.some((pattern) => lowerResponse.includes(pattern.trim().toLowerCase()));
            if (isTriggered) {
                triggeredFollowUps.push(followUp);
            }
        }
        return triggeredFollowUps;
    }
}
/**
 * Analyze memory signals to determine dimension coverage.
 */
export function analyzeCoverage(signals, minSignals = 3) {
    const dimensions = [
        'identity-core',
        'character-traits',
        'voice-presence',
        'honesty-framework',
        'boundaries-ethics',
        'relationship-dynamics',
        'continuity-growth',
    ];
    return dimensions.map((dimension) => {
        const dimSignals = signals.filter((s) => s.dimension === dimension);
        const memorySignals = dimSignals.filter((s) => s.source.type === 'memory').length;
        const interviewSignals = dimSignals.filter((s) => s.source.type === 'interview').length;
        const totalSignals = memorySignals + interviewSignals;
        return {
            dimension,
            memorySignals,
            interviewSignals,
            isSparse: totalSignals < minSignals,
            confidence: Math.min(1, totalSignals / 10), // Cap at 10 signals
        };
    });
}
/**
 * Format interview session summary for display.
 */
export function formatInterviewSummary(session) {
    const lines = [
        '# Interview Session Summary',
        '',
        `**Session ID**: ${session.id}`,
        `**Started**: ${session.startedAt.toISOString()}`,
        `**Status**: ${session.status}`,
        '',
        `## Responses (${session.responses.length})`,
        '',
    ];
    for (const response of session.responses) {
        lines.push(`### ${response.questionId}`);
        lines.push('');
        lines.push(response.text);
        lines.push('');
    }
    if (session.skippedQuestions.length > 0) {
        lines.push(`## Skipped (${session.skippedQuestions.length})`);
        lines.push('');
        lines.push(session.skippedQuestions.join(', '));
    }
    return lines.join('\n');
}
//# sourceMappingURL=interview.js.map