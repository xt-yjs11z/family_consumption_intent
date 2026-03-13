"use strict";
/**
 * Security Manager
 *
 * 비밀번호 및 민감정보 암호화/복호화
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityManager = void 0;
const crypto = __importStar(require("crypto"));
const crypto_js_1 = __importDefault(require("crypto-js"));
class SecurityManager {
    constructor(encryptionKey) {
        // 사용자 제공 키 또는 머신별 자동 생성
        this.encryptionKey = encryptionKey || this.generateMachineKey();
    }
    /**
     * 머신별 고유 암호화 키 생성
     */
    generateMachineKey() {
        const machineId = require('os').hostname() + require('os').platform();
        return crypto.createHash('sha256').update(machineId).digest('hex');
    }
    /**
     * 비밀번호/토큰 암호화
     */
    async encryptToken(token) {
        try {
            const encrypted = crypto_js_1.default.AES.encrypt(token, this.encryptionKey).toString();
            return encrypted;
        }
        catch (error) {
            const err = error;
            console.error('[Dooray Security] Encryption failed:', err.message);
            throw new Error('Failed to encrypt token');
        }
    }
    /**
     * 비밀번호/토큰 복호화
     */
    async decryptToken(encryptedToken) {
        try {
            // 타입 체크
            if (typeof encryptedToken !== 'string') {
                console.warn('[Dooray Security] Token is not a string, returning as-is');
                return String(encryptedToken);
            }
            
            // CryptoJS 암호화 형식 확인
            if (!encryptedToken.includes('U2FsdGVkX1')) {
                // 평문으로 보임
                console.warn('[Dooray Security] Token appears unencrypted');
                return encryptedToken;
            }
            
            const decrypted = crypto_js_1.default.AES.decrypt(encryptedToken, this.encryptionKey);
            const token = decrypted.toString(crypto_js_1.default.enc.Utf8);
            
            if (!token) {
                throw new Error('Decryption resulted in empty token');
            }
            
            return token;
        }
        catch (error) {
            const err = error;
            console.error('[Dooray Security] Decryption failed:', err.message);
            // 복호화 실패 시 원본 반환 (평문일 가능성)
            return String(encryptedToken);
        }
    }
    /**
     * 이메일 주소 검증
     */
    validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }
    /**
     * 민감정보 로그 정제
     */
    sanitizeForLog(data) {
        const sensitive = ['password', 'token', 'apiToken', 'authorization', 'pass'];
        const sanitized = { ...data };
        for (const key of sensitive) {
            if (sanitized[key]) {
                sanitized[key] = '***REDACTED***';
            }
        }
        return sanitized;
    }
    /**
     * 비밀번호 강도 확인
     */
    checkPasswordStrength(password) {
        const feedback = [];
        let score = 0;
        if (password.length >= 8)
            score++;
        else
            feedback.push('비밀번호는 최소 8자 이상이어야 합니다');
        if (password.length >= 12)
            score++;
        if (/[a-z]/.test(password))
            score++;
        else
            feedback.push('소문자를 포함해야 합니다');
        if (/[A-Z]/.test(password))
            score++;
        else
            feedback.push('대문자를 포함해야 합니다');
        if (/[0-9]/.test(password))
            score++;
        else
            feedback.push('숫자를 포함해야 합니다');
        if (/[^a-zA-Z0-9]/.test(password))
            score++;
        else
            feedback.push('특수문자를 포함해야 합니다');
        return {
            strong: score >= 4,
            score,
            feedback
        };
    }
}
exports.SecurityManager = SecurityManager;
//# sourceMappingURL=security.js.map