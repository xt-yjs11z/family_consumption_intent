#!/usr/bin/env node

/**
 * Dooray IMAP/SMTP CLI
 * Command-line interface for Dooray mail operations
 */

const { DoorayMailClient } = require('./dist/mail-client');
const { SecurityManager } = require('./dist/security');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_PATH = path.join(os.homedir(), '.dooray-config.json');
const CACHE_PATH = path.join(os.homedir(), '.dooray-mail-cache.json');

// 버전 정보
const packageJson = require('./package.json');
const VERSION = packageJson.version;

// CLI 명령어 파서
const args = process.argv.slice(2);
const command = args[0];

// 설정 로드
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('❌ Configuration not found. Run: dooray-cli config');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

// 설정 저장
function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

// 메일 캐시 로드
function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

// 메일 캐시 저장
function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
}

// 메일 클라이언트 생성
async function createClient(config) {
  const security = new SecurityManager();
  const decryptedPassword = await security.decryptToken(config.password);
  
  return new DoorayMailClient({
    email: config.email,
    password: decryptedPassword,
    imap: config.imap || { host: 'imap.dooray.com', port: 993, secure: true },
    smtp: config.smtp || { host: 'smtp.dooray.com', port: 465, secure: true }
  });
}

// 명령어 핸들러
async function handleCommand() {
  switch (command) {
    case 'config':
      await configCommand();
      break;
    case 'list':
      await listCommand(args.slice(1));
      break;
    case 'recent':
      await recentCommand(args.slice(1));
      break;
    case 'read':
      await readCommand(args[1]);
      break;
    case 'send':
      await sendCommand(args.slice(1));
      break;
    case 'reply':
      await replyCommand(args[1], args.slice(2));
      break;
    case 'forward':
      await forwardCommand(args[1], args.slice(2));
      break;
    case 'delete':
      await deleteCommand(args[1], args.slice(2));
      break;
    case 'mark':
      await markCommand(args[1], args.slice(2));
      break;
    case 'attachments':
      await attachmentsCommand(args[1]);
      break;
    case 'download':
      await downloadCommand(args[1], args.slice(2));
      break;
    case 'search':
      await searchCommand(args.slice(1));
      break;
    case 'unread':
      await unreadCountCommand();
      break;
    case 'test':
      await testCommand();
      break;
    case 'version':
    case '--version':
    case '-v':
      console.log(`dooray-cli v${VERSION}`);
      break;
    case 'install-skill':
      await installSkillCommand();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.error(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// 비밀번호 입력 (숨김 처리)
function readPassword(prompt) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    
    stdout.write(prompt);
    
    let password = '';
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    
    const onData = (char) => {
      char = char.toString('utf8');
      
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
          break;
        default:
          if (char.charCodeAt(0) >= 32) {
            password += char;
            stdout.write('*');
          }
          break;
      }
    };
    
    stdin.on('data', onData);
  });
}

// config: 설정 저장
async function configCommand() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (q) => new Promise(resolve => readline.question(q, resolve));

  try {
    console.log('\n📧 Dooray Configuration Setup\n');
    
    const email = await question('Email: ');
    readline.close();
    
    const password = await readPassword('Password: ');
    
    const security = new SecurityManager();
    const encryptedPassword = await security.encryptToken(password);
    
    const config = {
      email,
      password: encryptedPassword,
      imap: { host: 'imap.dooray.com', port: 993, secure: true },
      smtp: { host: 'smtp.dooray.com', port: 465, secure: true }
    };
    
    saveConfig(config);
    console.log(`\n✅ Configuration saved to ${CONFIG_PATH}`);
  } catch (error) {
    readline.close();
    throw error;
  }
}

// list: 읽지 않은 메일 목록
async function listCommand(args) {
  // 첫 번째 인자로 개수 지정 가능
  const limit = args && args[0] && !isNaN(args[0]) ? parseInt(args[0]) : 1000;
  
  const config = loadConfig();
  const client = await createClient(config);
  
  try {
    const mails = await client.getUnreadMail(limit);
    
    if (mails.length === 0) {
      console.log('📭 No unread mails');
      return;
    }
    
    console.log(`\n📬 Unread Mails (${mails.length}${limit < 1000 ? ` / showing ${limit}` : ''})\n`);
    mails.forEach((mail, idx) => {
      const fromText = typeof mail.from === 'object' ? `${mail.from.name} <${mail.from.email}>` : mail.from;
      console.log(`${idx + 1}. [UID: ${mail.id}] ${fromText}`);
      console.log(`   Subject: ${mail.subject}`);
      console.log(`   Date: ${mail.receivedAt}\n`);
    });
  } finally {
    await client.close();
  }
}

// recent: 최근 메일 목록 (읽음/안읽음 모두)
async function recentCommand(args) {
  // 옵션 파싱
  let limit = 1000;
  let since, before;
  
  if (args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--since' && args[i + 1]) {
        since = args[++i];
      } else if (args[i] === '--before' && args[i + 1]) {
        before = args[++i];
      } else if (!isNaN(args[i])) {
        limit = parseInt(args[i]);
      }
    }
  }
  
  const config = loadConfig();
  const client = await createClient(config);
  
  try {
    let mails;
    
    // 날짜 필터가 있으면 searchMail 사용
    if (since || before) {
      mails = await client.searchMail([], { since, before });
      // limit 적용
      if (mails.length > limit) {
        mails = mails.slice(0, limit);
      }
    } else {
      // 날짜 필터 없으면 기존 getRecentMail 사용
      mails = await client.getRecentMail(limit);
    }
    
    if (mails.length === 0) {
      console.log('📭 No mails found');
      return;
    }
    
    const filters = [];
    if (since) filters.push(`since: ${since}`);
    if (before) filters.push(`before: ${before}`);
    const filterStr = filters.length > 0 ? ` (${filters.join(', ')})` : '';
    
    console.log(`\n📬 Recent Mails${filterStr} (${mails.length}${limit < 1000 ? ` / showing ${limit}` : ''})\n`);
    mails.forEach((mail, idx) => {
      const readStatus = mail.isRead ? '✓' : '●';
      const fromText = typeof mail.from === 'object' ? `${mail.from.name} <${mail.from.email}>` : mail.from;
      console.log(`${idx + 1}. ${readStatus} [UID: ${mail.id || mail.uid}] ${fromText}`);
      console.log(`   Subject: ${mail.subject}`);
      console.log(`   Date: ${mail.receivedAt || mail.date}\n`);
    });
  } finally {
    await client.close();
  }
}

// read: 특정 메일 읽기
async function readCommand(uid) {
  if (!uid) {
    console.error('❌ Usage: dooray-cli read <uid>');
    process.exit(1);
  }
  
  const config = loadConfig();
  const client = await createClient(config);
  
  try {
    const mail = await client.getMailById(uid);
    
    if (!mail) {
      console.error('❌ Mail not found');
      process.exit(1);
    }
    
    // 메일 정보 캐시에 저장 (답장용)
    const cache = loadCache();
    cache[uid] = {
      messageId: mail.messageId,
      subject: mail.subject,
      from: mail.from,
      references: mail.references || []
    };
    saveCache(cache);
    
    const fromText = typeof mail.from === 'object' ? `${mail.from.name} <${mail.from.email}>` : mail.from;
    const toText = Array.isArray(mail.to) 
      ? mail.to.map(t => typeof t === 'object' ? `${t.name} <${t.email}>` : t).join(', ')
      : mail.to;
    
    console.log('\n📧 Mail Details\n');
    console.log(`UID: ${uid}`);
    console.log(`From: ${fromText}`);
    console.log(`To: ${toText}`);
    console.log(`Subject: ${mail.subject}`);
    console.log(`Date: ${mail.receivedAt}`);
    console.log(`Read: ${mail.isRead ? 'Yes' : 'No'}`);
    
    if (mail.attachments && mail.attachments.length > 0) {
      console.log(`Attachments: ${mail.attachments.length} file(s)`);
      mail.attachments.forEach((att, idx) => {
        const sizeKB = (att.size / 1024).toFixed(2);
        console.log(`  ${idx + 1}. ${att.filename} (${sizeKB} KB)`);
      });
      console.log();
    } else {
      console.log(`Attachments: No\n`);
    }
    console.log('─'.repeat(50));
    console.log(mail.body || mail.bodyHtml || '(No content)');
    console.log('─'.repeat(50));
  } finally {
    await client.close();
  }
}

// reply: 답장 보내기
async function replyCommand(uid, args) {
  if (!uid) {
    console.error('❌ Usage: dooray-cli reply <uid> [--body "message"]');
    process.exit(1);
  }
  
  // 캐시에서 원본 메일 정보 로드
  const cache = loadCache();
  const originalMail = cache[uid];
  
  if (!originalMail) {
    console.error('❌ Mail not found in cache. Please read the mail first using: dooray-cli read ' + uid);
    process.exit(1);
  }
  
  // --body 옵션 파싱
  let body;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--body' && args[i + 1]) {
      body = args[++i];
    }
  }
  
  const config = loadConfig();
  const client = await createClient(config);
  
  try {
    // 인터랙티브 모드
    if (!body) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      console.log(`\n💬 Reply to: ${originalMail.from.name} <${originalMail.from.email}>`);
      console.log(`   Subject: Re: ${originalMail.subject}\n`);
      console.log('Body (type message, press Ctrl+D when done):');
      
      body = '';
      readline.on('line', (line) => {
        body += line + '\n';
      });
      
      await new Promise(resolve => readline.on('close', resolve));
    }
    
    // 답장 제목 생성
    const replySubject = originalMail.subject.startsWith('Re:') 
      ? originalMail.subject 
      : `Re: ${originalMail.subject}`;
    
    // References 헤더 생성
    const references = [...(originalMail.references || [])];
    if (originalMail.messageId && !references.includes(originalMail.messageId)) {
      references.push(originalMail.messageId);
    }
    
    // 답장 발송
    await client.sendMail({
      to: originalMail.from.email,
      subject: replySubject,
      text: body.trim(),
      inReplyTo: originalMail.messageId,
      references: references.join(' ')
    });
    
    console.log('\n✅ Reply sent successfully');
    console.log(`   To: ${originalMail.from.name} <${originalMail.from.email}>`);
    console.log(`   Subject: ${replySubject}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// forward: 메일 전달
async function forwardCommand(uid, args) {
  if (!uid) {
    console.error('❌ Usage: dooray-cli forward <uid> --to <email> [--body "message"]');
    process.exit(1);
  }
  
  // --to, --body 옵션 파싱
  let to, body;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--to' && args[i + 1]) {
      to = args[++i];
    } else if (args[i] === '--body' && args[i + 1]) {
      body = args[++i];
    }
  }
  
  if (!to) {
    console.error('❌ --to option is required');
    console.error('Usage: dooray-cli forward <uid> --to <email> [--body "message"]');
    process.exit(1);
  }
  
  const config = loadConfig();
  const client = await createClient(config);
  
  try {
    const mail = await client.getMailById(uid);
    
    if (!mail) {
      console.error('❌ Mail not found');
      process.exit(1);
    }
    
    // 전달 제목 생성
    const fwdSubject = mail.subject.startsWith('Fwd:') || mail.subject.startsWith('FW:')
      ? mail.subject
      : `Fwd: ${mail.subject}`;
    
    // 전달 본문 생성 (원본 메일 포함)
    const fromText = typeof mail.from === 'object' ? `${mail.from.name} <${mail.from.email}>` : mail.from;
    const originalMessage = `
---------- Forwarded message ---------
From: ${fromText}
Date: ${mail.receivedAt}
Subject: ${mail.subject}

${mail.body || mail.bodyHtml || ''}
`;
    
    const finalBody = body ? `${body}\n\n${originalMessage}` : originalMessage;
    
    // 메일 전송 (첨부파일 포함)
    await client.sendMail({
      to: to,
      subject: fwdSubject,
      text: finalBody,
      attachments: mail.attachments && mail.attachments.length > 0 
        ? mail.attachments.map(att => ({
            filename: att.filename,
            content: att.content,
            contentType: att.contentType
          }))
        : undefined
    });
    
    console.log('\n✅ Mail forwarded successfully');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${fwdSubject}`);
    if (mail.attachments && mail.attachments.length > 0) {
      console.log(`   Attachments: ${mail.attachments.length} file(s)`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// delete: 메일 삭제
async function deleteCommand(uid, args) {
  if (!uid) {
    console.error('❌ Usage: dooray-cli delete <uid> [--force]');
    process.exit(1);
  }
  
  const permanent = args.includes('--force');
  
  const config = loadConfig();
  const client = await createClient(config);
  
  try {
    const result = await client.deleteMail(uid, permanent);
    
    if (result.success) {
      if (permanent) {
        console.log('✅ Mail permanently deleted');
      } else {
        console.log('✅ Mail moved to trash');
        console.log('💡 Use --force to permanently delete');
      }
    } else {
      console.error('❌ Failed to delete mail');
      process.exit(1);
    }
  } finally {
    await client.close();
  }
}

// mark: 읽음/안읽음 표시
async function markCommand(uid, args) {
  if (!uid) {
    console.error('❌ Usage: dooray-cli mark <uid> --read|--unread');
    process.exit(1);
  }
  
  const asRead = args.includes('--read');
  const asUnread = args.includes('--unread');
  
  if (!asRead && !asUnread) {
    console.error('❌ Specify --read or --unread');
    process.exit(1);
  }
  
  const config = loadConfig();
  const client = await createClient(config);
  
  try {
    const result = await client.markMail(uid, asRead);
    
    if (result.success) {
      console.log(`✅ Mail marked as ${asRead ? 'read' : 'unread'}`);
    } else {
      console.error('❌ Failed to mark mail');
      process.exit(1);
    }
  } finally {
    await client.close();
  }
}

// attachments: 첨부파일 목록 보기
async function attachmentsCommand(uid) {
  if (!uid) {
    console.error('❌ Usage: dooray-cli attachments <uid>');
    process.exit(1);
  }
  
  const config = loadConfig();
  const client = await createClient(config);
  
  try {
    const mail = await client.getMailById(uid);
    
    if (!mail) {
      console.error('❌ Mail not found');
      process.exit(1);
    }
    
    if (!mail.attachments || mail.attachments.length === 0) {
      console.log('📎 No attachments in this mail');
      return;
    }
    
    console.log(`\n📎 Attachments (${mail.attachments.length})\n`);
    mail.attachments.forEach((att, idx) => {
      const sizeKB = (att.size / 1024).toFixed(2);
      console.log(`${idx + 1}. ${att.filename}`);
      console.log(`   Type: ${att.contentType}`);
      console.log(`   Size: ${sizeKB} KB\n`);
    });
    
    console.log('💡 To download: dooray-cli download ' + uid);
  } finally {
    await client.close();
  }
}

// download: 첨부파일 다운로드
async function downloadCommand(uid, args) {
  if (!uid) {
    console.error('❌ Usage: dooray-cli download <uid> [--output <path>] [--file <index>]');
    process.exit(1);
  }
  
  // 옵션 파싱
  let outputPath = './downloads';
  let fileIndex = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) {
      outputPath = args[++i];
    } else if (args[i] === '--file' && args[i + 1]) {
      fileIndex = parseInt(args[++i]) - 1;
    }
  }
  
  const config = loadConfig();
  const client = await createClient(config);
  
  try {
    const mail = await client.getMailById(uid);
    
    if (!mail) {
      console.error('❌ Mail not found');
      process.exit(1);
    }
    
    if (!mail.attachments || mail.attachments.length === 0) {
      console.log('📎 No attachments to download');
      return;
    }
    
    // 다운로드 디렉토리 생성
    const mailDir = path.join(outputPath, `mail-${uid}`);
    if (!fs.existsSync(mailDir)) {
      fs.mkdirSync(mailDir, { recursive: true });
    }
    
    // 특정 파일만 다운로드
    if (fileIndex !== null) {
      if (fileIndex < 0 || fileIndex >= mail.attachments.length) {
        console.error(`❌ Invalid file index. Use 1-${mail.attachments.length}`);
        process.exit(1);
      }
      
      const att = mail.attachments[fileIndex];
      const filePath = path.join(mailDir, att.filename);
      fs.writeFileSync(filePath, att.content);
      
      const sizeKB = (att.size / 1024).toFixed(2);
      console.log(`✅ Downloaded: ${att.filename} (${sizeKB} KB)`);
      console.log(`   Location: ${filePath}`);
      return;
    }
    
    // 모든 파일 다운로드
    console.log(`\n📎 Downloading ${mail.attachments.length} file(s)...\n`);
    
    for (const att of mail.attachments) {
      const filePath = path.join(mailDir, att.filename);
      fs.writeFileSync(filePath, att.content);
      
      const sizeKB = (att.size / 1024).toFixed(2);
      console.log(`✅ ${att.filename} (${sizeKB} KB)`);
    }
    
    console.log(`\n📁 All files saved to: ${mailDir}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// send: 메일 발송
async function sendCommand(args) {
  // 비인터랙티브 모드: --to, --subject, --body, --cc, --bcc, --attach, --html 옵션 사용
  let to, subject, body, cc, bcc, attachFiles = [], isHtml = false;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--to' && args[i + 1]) {
      to = args[++i];
    } else if (args[i] === '--subject' && args[i + 1]) {
      subject = args[++i];
    } else if (args[i] === '--body' && args[i + 1]) {
      body = args[++i];
    } else if (args[i] === '--cc' && args[i + 1]) {
      cc = args[++i];
    } else if (args[i] === '--bcc' && args[i + 1]) {
      bcc = args[++i];
    } else if (args[i] === '--attach' && args[i + 1]) {
      attachFiles.push(args[++i]);
    } else if (args[i] === '--html' && args[i + 1]) {
      body = args[++i];
      isHtml = true;
    }
  }

  // 비인터랙티브 모드로 전달된 경우
  if (to && subject && body) {
    const config = loadConfig();
    const client = await createClient(config);
    
    try {
      // 첨부파일 처리
      const attachments = [];
      for (const filePath of attachFiles) {
        if (!fs.existsSync(filePath)) {
          console.error(`❌ File not found: ${filePath}`);
          process.exit(1);
        }
        attachments.push({
          filename: path.basename(filePath),
          content: fs.readFileSync(filePath)
        });
      }
      
      const mailParams = {
        to,
        subject,
        cc: cc ? cc.split(',').map(e => e.trim()) : undefined,
        bcc: bcc ? bcc.split(',').map(e => e.trim()) : undefined,
        attachments: attachments.length > 0 ? attachments : undefined
      };
      
      if (isHtml) {
        mailParams.html = true;
        mailParams.body = body;
      } else {
        mailParams.text = body;
      }
      
      await client.sendMail(mailParams);
      console.log('✅ Mail sent successfully');
      console.log(`   To: ${to}`);
      if (cc) console.log(`   CC: ${cc}`);
      if (bcc) console.log(`   BCC: ${bcc}`);
      console.log(`   Subject: ${subject}`);
      if (attachments.length > 0) {
        console.log(`   Attachments: ${attachments.length} file(s)`);
      }
      return;
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    } finally {
      await client.close();
    }
  }

  // 인터랙티브 모드
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (q) => new Promise(resolve => readline.question(q, resolve));

  try {
    to = to || await question('To: ');
    subject = subject || await question('Subject: ');
    
    if (!body) {
      console.log('Body (type message, press Ctrl+D when done):');
      
      body = '';
      readline.on('line', (line) => {
        body += line + '\n';
      });
      
      await new Promise(resolve => readline.on('close', resolve));
    }
    
    const config = loadConfig();
    const client = await createClient(config);
    
    try {
      await client.sendMail({ to, subject, text: body.trim() });
      console.log('\n✅ Mail sent successfully');
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// search: 메일 검색 (키워드, 날짜, 발신자 필터 지원)
async function searchCommand(args) {
  if (args.length === 0) {
    console.error('❌ Usage: dooray-cli search <keyword> [--from <email>] [--since <YYYY-MM-DD>] [--before <YYYY-MM-DD>]');
    process.exit(1);
  }
  
  // 옵션 파싱
  let from, since, before;
  const keywords = [];
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from' && args[i + 1]) {
      from = args[++i];
    } else if (args[i] === '--since' && args[i + 1]) {
      since = args[++i];
    } else if (args[i] === '--before' && args[i + 1]) {
      before = args[++i];
    } else {
      keywords.push(args[i]);
    }
  }
  
  const config = loadConfig();
  const client = await createClient(config);
  
  try {
    const mails = await client.searchMail(keywords, { from, since, before });
    
    if (mails.length === 0) {
      console.log('📭 No matching mails found');
      return;
    }
    
    const filters = [];
    if (keywords.length > 0) filters.push(`keywords: "${keywords.join(' ')}"`);
    if (from) filters.push(`from: ${from}`);
    if (since) filters.push(`since: ${since}`);
    if (before) filters.push(`before: ${before}`);
    
    console.log(`\n🔍 Search Results (${filters.join(', ')}): ${mails.length} found\n`);
    mails.forEach((mail, idx) => {
      const fromText = typeof mail.from === 'object' ? `${mail.from.name} <${mail.from.email}>` : mail.from;
      console.log(`${idx + 1}. [UID: ${mail.uid}] ${fromText}`);
      console.log(`   Subject: ${mail.subject}`);
      console.log(`   Date: ${mail.date}\n`);
    });
  } finally {
    await client.close();
  }
}

// unread: 읽지 않은 메일 개수
async function unreadCountCommand() {
  const config = loadConfig();
  const client = await createClient(config);
  
  try {
    const count = await client.getUnreadCount();
    console.log(`📬 Unread mails: ${count}`);
  } finally {
    await client.close();
  }
}

// test: 연결 테스트
async function testCommand() {
  const config = loadConfig();
  const client = await createClient(config);
  
  try {
    const result = await client.testConnection();
    
    if (result) {
      console.log('\n🎉 All connections successful!');
    } else {
      console.error('❌ Connection test failed');
      process.exit(1);
    }
  } finally {
    await client.close();
  }
}

// OpenClaw 설치 위치 찾기
function findOpenClawInstallation() {
  const { execSync } = require('child_process');
  
  try {
    // where (Windows) 또는 which (Unix) 명령어로 실행 파일 찾기
    const command = process.platform === 'win32' ? 'where openclaw' : 'which openclaw';
    const result = execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const openclawPath = result.trim().split('\n')[0];
    
    if (openclawPath && fs.existsSync(openclawPath)) {
      // 실행 파일의 디렉토리에서 상위로 올라가며 skills 폴더 찾기
      let currentPath = path.dirname(openclawPath);
      for (let i = 0; i < 5; i++) {
        const skillsPath = path.join(currentPath, 'skills');
        if (fs.existsSync(skillsPath)) {
          return skillsPath;
        }
        const newPath = path.dirname(currentPath);
        if (newPath === currentPath) break;
        currentPath = newPath;
      }
      
      return path.dirname(openclawPath);
    }
  } catch (error) {
    // OpenClaw 실행 파일을 찾지 못함
  }
  
  return null;
}

// install-skill: OpenClaw Skill 자동 설치
async function installSkillCommand() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (q) => new Promise(resolve => readline.question(q, resolve));
  
  try {
    console.log('\n📦 Installing Dooray Skill for OpenClaw...\n');
    
    // 1. SKILL.md 위치 찾기
    const currentDir = __dirname || path.dirname(process.argv[1]);
    const localSkillMd = path.join(currentDir, 'SKILL.md');
    
    if (!fs.existsSync(localSkillMd)) {
      console.error('❌ SKILL.md not found in package directory');
      console.log('💡 Try reinstalling: npm install -g dooray-mail-cli');
      readline.close();
      process.exit(1);
    }
    
    // 2. OpenClaw 설치 위치 찾기
    console.log('🔍 Searching for OpenClaw installation...');
    const openclawInstall = findOpenClawInstallation();
    
    if (openclawInstall) {
      console.log(`✅ Found OpenClaw installation: ${openclawInstall}`);
    } else {
      console.log('⚠️  OpenClaw executable not found in PATH');
    }
    
    // 3. OpenClaw skills 디렉토리 찾기 (여러 가능한 위치)
    const possiblePaths = [
      openclawInstall ? path.join(openclawInstall, 'skills') : null,
      path.join(os.homedir(), 'skills'),
      path.join(os.homedir(), '.openclaw', 'skills'),
      path.join(os.homedir(), 'OpenClaw', 'skills'),
      path.join(os.homedir(), '.config', 'openclaw', 'skills'),
    ].filter(p => p !== null);
    
    let skillsDir = null;
    
    // 기존 skills 폴더 찾기
    for (const dir of possiblePaths) {
      if (fs.existsSync(dir)) {
        skillsDir = dir;
        console.log(`✅ Found OpenClaw skills directory: ${skillsDir}`);
        break;
      }
    }
    
    // 찾지 못한 경우 사용자에게 물어보기
    if (!skillsDir) {
      console.log('\n⚠️  OpenClaw skills directory not found in common locations.');
      console.log('\nCommon locations:');
      possiblePaths.forEach((p, i) => console.log(`   ${i + 1}. ${p}`));
      console.log('   0. Enter custom path');
      
      const choice = await question('\nSelect location (0-' + possiblePaths.length + '): ');
      const idx = parseInt(choice);
      
      if (idx === 0) {
        const customPath = await question('Enter skills directory path: ');
        skillsDir = customPath.trim();
      } else if (idx >= 1 && idx <= possiblePaths.length) {
        skillsDir = possiblePaths[idx - 1];
      } else {
        skillsDir = possiblePaths[0]; // 기본값
      }
      
      console.log(`\nUsing: ${skillsDir}`);
    }
    
    const dooraySkillDir = path.join(skillsDir, 'dooray');
    
    // 디렉토리 생성
    if (!fs.existsSync(skillsDir)) {
      fs.mkdirSync(skillsDir, { recursive: true });
      console.log(`✅ Created skills directory: ${skillsDir}`);
    }
    
    if (!fs.existsSync(dooraySkillDir)) {
      fs.mkdirSync(dooraySkillDir, { recursive: true });
      console.log(`✅ Created dooray skill directory: ${dooraySkillDir}`);
    }
    
    // 4. SKILL.md 복사
    const targetSkillMd = path.join(dooraySkillDir, 'SKILL.md');
    fs.copyFileSync(localSkillMd, targetSkillMd);
    
    console.log(`✅ SKILL.md copied to: ${targetSkillMd}`);
    console.log('\n🎉 Dooray Skill installed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart OpenClaw');
    console.log('   2. Try: "dooray 메일 확인해줘"');
    console.log(`\nSkill location: ${dooraySkillDir}`);
    
  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    console.log('\n💡 Manual installation:');
    console.log(`   1. Find your OpenClaw skills directory`);
    console.log(`   2. Create subdirectory: dooray`);
    console.log(`   3. Copy SKILL.md to: [skills]/dooray/SKILL.md`);
    process.exit(1);
  } finally {
    readline.close();
  }
}

// help: 도움말
function showHelp() {
  console.log(`
📧 Dooray CLI - IMAP/SMTP mail client for Dooray

Usage: dooray-cli <command> [options]

Commands:
  config              Set up email configuration
  list [count]        List unread mails (default: 1000)
  list 50             Show 50 unread mails
  recent [count]      List recent mails (default: 1000)
  recent 100          Show 100 recent mails
  recent --since <YYYY-MM-DD> --before <YYYY-MM-DD>
                      Filter by date range
  read <uid>          Read a specific mail by UID
  send                Send a new mail (interactive)
  send --to <email> --subject <subject> --body <body>
                      Send a mail (non-interactive)
  send --to <email> --subject <subject> --body <body> --cc <email> --bcc <email>
                      Send with CC/BCC
  send --to <email> --subject <subject> --html <html>
                      Send HTML mail
  send --to <email> --subject <subject> --body <body> --attach <file>
                      Send with attachments
  reply <uid>         Reply to a mail (interactive)
  reply <uid> --body <body>
                      Reply to a mail (non-interactive)
  forward <uid> --to <email> [--body <message>]
                      Forward a mail
  delete <uid>        Delete a mail (move to trash)
  delete <uid> --force
                      Permanently delete a mail
  mark <uid> --read   Mark a mail as read
  mark <uid> --unread Mark a mail as unread
  attachments <uid>   List attachments in a mail
  download <uid>      Download all attachments
  download <uid> --file <index>
                      Download a specific attachment
  download <uid> --output <path>
                      Download to a custom path
  search <keywords>   Search mails by keywords
  search <keywords> --from <email>
                      Search by sender
  search <keywords> --since <YYYY-MM-DD>
                      Search since date
  search <keywords> --before <YYYY-MM-DD>
                      Search before date
  unread              Show unread mail count
  test                Test IMAP/SMTP connection
  install-skill       Install Dooray skill for OpenClaw
  version, -v, --version
                      Show version number
  help, -h, --help    Show this help message

Examples:
  dooray-cli config
  dooray-cli list
  dooray-cli list 50
  dooray-cli recent
  dooray-cli recent 100
  dooray-cli recent --since "2026-01-01" --before "2026-02-01"
  dooray-cli recent 50 --since "2026-02-01"
  dooray-cli read 123
  dooray-cli send --to "user@example.com" --subject "Hello" --body "Test"
  dooray-cli send --to "user@example.com" --subject "Hello" --body "Test" --cc "cc@example.com" --attach "./file.pdf"
  dooray-cli send --to "user@example.com" --subject "Hello" --html "<h1>Title</h1><p>Content</p>"
  dooray-cli reply 123
  dooray-cli reply 123 --body "Thank you for your email."
  dooray-cli forward 123 --to "another@example.com" --body "FYI"
  dooray-cli delete 123
  dooray-cli delete 123 --force
  dooray-cli mark 123 --read
  dooray-cli mark 123 --unread
  dooray-cli attachments 123
  dooray-cli download 123
  dooray-cli download 123 --file 1
  dooray-cli download 123 --output ./my-files
  dooray-cli search "meeting" --from "boss@example.com"
  dooray-cli search "report" --since "2026-01-01"
  dooray-cli search "invoice" --before "2026-02-01"
  dooray-cli unread
  dooray-cli install-skill
  dooray-cli --version

Configuration file: ${CONFIG_PATH}
`);
}

// 메인 실행
handleCommand().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
