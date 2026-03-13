"use strict";
/**
 * Dooray Mail Client (IMAP/SMTP)
 *
 * IMAP/SMTP 프로토콜을 사용하여 Dooray 메일과 통신합니다.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoorayMailClient = void 0;
const nodemailer = __importStar(require("nodemailer"));
const imaps = __importStar(require("imap-simple"));
const mailparser_1 = require("mailparser");
class DoorayMailClient {
    constructor(config) {
        this.config = config;
        // SMTP 설정
        this.smtpTransporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: config.smtp.secure,
            auth: {
                user: config.email,
                pass: config.password
            },
            tls: {
                rejectUnauthorized: false // Dooray SSL 인증서 문제 해결
            }
        });
    }
    /**
     * IMAP 연결 생성
     */
    async getImapConnection() {
        const imapConfig = {
            imap: {
                user: this.config.email,
                password: this.config.password,
                host: this.config.imap.host,
                port: this.config.imap.port,
                tls: this.config.imap.secure,
                tlsOptions: {
                    rejectUnauthorized: false
                },
                authTimeout: 30000
            }
        };
        try {
            const connection = await imaps.connect(imapConfig);
            return connection;
        }
        catch (error) {
            const err = error;
            console.error('[Dooray IMAP] Connection failed:', err.message);
            throw new Error(`IMAP 연결 실패: ${err.message}`);
        }
    }
    /**
     * 읽지 않은 메일 개수
     */
    async getUnreadCount() {
        let connection;
        try {
            connection = await this.getImapConnection();
            await connection.openBox('INBOX');
            const searchCriteria = ['UNSEEN'];
            const fetchOptions = {
                bodies: [''],
                struct: true
            };
            const messages = await connection.search(searchCriteria, fetchOptions);
            connection.end();
            return messages.length;
        }
        catch (error) {
            const err = error;
            console.error('[Dooray] Failed to get unread count:', err.message);
            if (connection)
                connection.end();
            return 0;
        }
    }
    /**
     * 읽지 않은 메일 목록
     */
    async getUnreadMail(limit = 10) {
        let connection;
        try {
            connection = await this.getImapConnection();
            await connection.openBox('INBOX');
            const searchCriteria = ['UNSEEN'];
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT', ''],
                struct: true,
                markSeen: false
            };
            const messages = await connection.search(searchCriteria, fetchOptions);
            // 최신 메일부터 limit개만
            const limitedMessages = messages.slice(0, limit);
            const parsedMails = [];
            for (const item of limitedMessages) {
                const mail = await this.parseImapMessage(item);
                if (mail)
                    parsedMails.push(mail);
            }
            connection.end();
            return parsedMails;
        }
        catch (error) {
            const err = error;
            console.error('[Dooray] Failed to get unread mail:', err.message);
            if (connection)
                connection.end();
            return [];
        }
    }
    /**
     * 최근 메일 가져오기 (읽음/안읽음 모두)
     */
    async getRecentMail(limit = 10) {
        let connection;
        try {
            connection = await this.getImapConnection();
            const box = await connection.openBox('INBOX');
            // 메일함의 전체 메시지 수
            const totalMessages = box.messages.total;
            if (totalMessages === 0) {
                connection.end();
                return [];
            }
            // 최근 N개의 UID 범위 계산
            const startSeq = Math.max(1, totalMessages - limit + 1);
            const endSeq = totalMessages;
            const searchCriteria = [[`${startSeq}:${endSeq}`]];
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT', ''],
                struct: true,
                markSeen: false
            };
            const messages = await connection.search(searchCriteria, fetchOptions);
            // 최신 메일부터 정렬
            const recentMessages = messages.reverse();
            const parsedMails = [];
            for (const item of recentMessages) {
                const mail = await this.parseImapMessage(item);
                if (mail)
                    parsedMails.push(mail);
            }
            connection.end();
            return parsedMails;
        }
        catch (error) {
            const err = error;
            console.error('[Dooray] Failed to get recent mail:', err.message);
            if (connection)
                connection.end();
            return [];
        }
    }
    /**
     * 메일 ID로 조회
     */
    async getMailById(mailId) {
        let connection;
        try {
            connection = await this.getImapConnection();
            await connection.openBox('INBOX');
            const uid = parseInt(mailId);
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT', ''],
                struct: true
            };
            const messages = await connection.search([['UID', uid]], fetchOptions);
            if (messages.length === 0) {
                connection.end();
                return null;
            }
            const mail = await this.parseImapMessage(messages[0]);
            connection.end();
            return mail;
        }
        catch (error) {
            const err = error;
            console.error('[Dooray] Failed to get mail by ID:', err.message);
            if (connection)
                connection.end();
            return null;
        }
    }
    /**
     * 메일 삭제 (휴지통으로 이동 또는 영구 삭제)
     */
    async deleteMail(uid, permanent = false) {
        let connection;
        try {
            connection = await this.getImapConnection();
            await connection.openBox('INBOX');
            
            if (permanent) {
                // 영구 삭제
                await connection.addFlags([uid], ['\\Deleted']);
                await connection.imap.expunge();
                console.log('[Dooray] Mail permanently deleted:', uid);
            } else {
                // 휴지통으로 이동 (\\Deleted 플래그만 추가)
                await connection.addFlags([uid], ['\\Deleted']);
                console.log('[Dooray] Mail moved to trash:', uid);
            }
            
            connection.end();
            return { success: true };
        }
        catch (error) {
            const err = error;
            console.error('[Dooray] Failed to delete mail:', err.message);
            if (connection)
                connection.end();
            return { success: false };
        }
    }
    /**
     * 메일 읽음/안읽음 표시 변경
     */
    async markMail(uid, asRead) {
        let connection;
        try {
            connection = await this.getImapConnection();
            await connection.openBox('INBOX');
            
            if (asRead) {
                await connection.addFlags([uid], ['\\Seen']);
                console.log('[Dooray] Mail marked as read:', uid);
            } else {
                await connection.delFlags([uid], ['\\Seen']);
                console.log('[Dooray] Mail marked as unread:', uid);
            }
            
            connection.end();
            return { success: true };
        }
        catch (error) {
            const err = error;
            console.error('[Dooray] Failed to mark mail:', err.message);
            if (connection)
                connection.end();
            return { success: false };
        }
    }
    /**
     * 메일 발송
     */
    async sendMail(params) {
        try {
            const recipients = Array.isArray(params.to) ? params.to : [params.to];
            const mailOptions = {
                from: this.config.email,
                to: recipients.join(', '),
                subject: params.subject,
                text: params.html ? undefined : params.body,
                html: params.html ? params.body : undefined,
                cc: params.cc?.join(', '),
                bcc: params.bcc?.join(', '),
                attachments: params.attachments,
                inReplyTo: params.inReplyTo || undefined,
                references: params.references || undefined
            };
            const info = await this.smtpTransporter.sendMail(mailOptions);
            console.log('[Dooray] Mail sent:', info.messageId);
            return {
                success: true,
                mailId: info.messageId
            };
        }
        catch (error) {
            const err = error;
            console.error('[Dooray] Failed to send mail:', err.message);
            return { success: false };
        }
    }
    /**
     * 메일 읽음 처리
     */
    async markAsRead(mailId) {
        let connection;
        try {
            connection = await this.getImapConnection();
            await connection.openBox('INBOX');
            const uid = parseInt(mailId);
            await connection.addFlags(uid, '\\Seen');
            connection.end();
            return true;
        }
        catch (error) {
            const err = error;
            console.error('[Dooray] Failed to mark as read:', err.message);
            if (connection)
                connection.end();
            return false;
        }
    }
    /**
     * 메일 검색 (키워드, 날짜, 발신자 필터 지원)
     */
    async searchMail(keywords, options = {}) {
        let connection;
        try {
            connection = await this.getImapConnection();
            await connection.openBox('INBOX');
            
            // 검색 조건 생성
            const searchParts = [];
            
            // 키워드 검색 (제목 또는 본문)
            if (keywords && keywords.length > 0) {
                const keywordStr = Array.isArray(keywords) ? keywords.join(' ') : keywords;
                if (keywordStr.trim()) {
                    searchParts.push(['OR', ['SUBJECT', keywordStr], ['BODY', keywordStr]]);
                }
            }
            
            // 발신자 필터
            if (options.from) {
                searchParts.push(['FROM', options.from]);
            }
            
            // 날짜 필터 (since)
            if (options.since) {
                const sinceDate = new Date(options.since);
                searchParts.push(['SINCE', sinceDate]);
            }
            
            // 날짜 필터 (before)
            if (options.before) {
                const beforeDate = new Date(options.before);
                searchParts.push(['BEFORE', beforeDate]);
            }
            
            // 검색 조건이 없으면 모든 메일 반환
            let searchCriteria;
            if (searchParts.length === 0) {
                searchCriteria = ['ALL'];
            } else if (searchParts.length === 1) {
                searchCriteria = searchParts[0];
            } else {
                searchCriteria = ['AND', ...searchParts];
            }
            
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT', ''],
                struct: true
            };
            const messages = await connection.search(searchCriteria, fetchOptions);
            
            // 제한 없이 모든 검색 결과 반환
            const parsedMails = [];
            for (const item of messages) {
                const mail = await this.parseImapMessage(item);
                if (mail)
                    parsedMails.push(mail);
            }
            connection.end();
            return parsedMails;
        }
        catch (error) {
            const err = error;
            console.error('[Dooray] Failed to search mail:', err.message);
            if (connection)
                connection.end();
            return [];
        }
    }
    /**
     * IMAP 메시지 파싱
     */
    async parseImapMessage(item) {
        try {
            const all = item.parts.find((part) => part.which === '');
            const uid = item.attributes.uid;
            const flags = item.attributes.flags || [];
            if (!all || !all.body) {
                return null;
            }
            const parsed = await (0, mailparser_1.simpleParser)(all.body);
            return {
                id: uid.toString(),
                messageId: parsed.messageId || '',
                subject: parsed.subject || '(제목 없음)',
                from: {
                    name: parsed.from?.value[0]?.name || parsed.from?.text || '알 수 없음',
                    email: parsed.from?.value[0]?.address || ''
                },
                to: (parsed.to?.value || []).map((addr) => ({
                    name: addr.name || addr.address,
                    email: addr.address
                })),
                body: parsed.text || '',
                bodyHtml: parsed.html || undefined,
                receivedAt: parsed.date?.toISOString() || new Date().toISOString(),
                isRead: flags.includes('\\Seen'),
                hasAttachments: (parsed.attachments?.length || 0) > 0,
                attachments: (parsed.attachments || []).map((att) => ({
                    filename: att.filename || 'unnamed',
                    contentType: att.contentType || 'application/octet-stream',
                    size: att.size || 0,
                    content: att.content
                })),
                inReplyTo: parsed.inReplyTo || '',
                references: parsed.references || []
            };
        }
        catch (error) {
            const err = error;
            console.error('[Dooray] Failed to parse message:', err.message);
            return null;
        }
    }
    /**
     * 연결 테스트
     */
    async testConnection() {
        try {
            // SMTP 테스트
            await this.smtpTransporter.verify();
            console.log('[Dooray] SMTP connection verified');
            // IMAP 테스트
            const connection = await this.getImapConnection();
            await connection.openBox('INBOX');
            connection.end();
            console.log('[Dooray] IMAP connection verified');
            return true;
        }
        catch (error) {
            const err = error;
            console.error('[Dooray] Connection test failed:', err.message);
            return false;
        }
    }
    /**
     * 리소스 정리
     */
    async close() {
        if (this.imapConnection) {
            try {
                this.imapConnection.end();
            }
            catch (error) {
                // Ignore
            }
        }
    }
}
exports.DoorayMailClient = DoorayMailClient;
//# sourceMappingURL=mail-client.js.map