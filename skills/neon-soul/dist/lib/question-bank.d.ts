/**
 * Interview Question Bank
 *
 * Contains all interview questions organized by SoulCraft dimension.
 * Questions are designed to supplement sparse memory areas.
 *
 * See: docs/research/interview-questions.md for full documentation
 */
import type { QuestionBank } from '../types/interview.js';
/**
 * The complete question bank.
 */
export declare const QUESTION_BANK: QuestionBank;
/**
 * Get statistics about the question bank.
 */
export declare function getQuestionBankStats(): {
    total: number;
    required: number;
    byDimension: Record<string, number>;
};
//# sourceMappingURL=question-bank.d.ts.map