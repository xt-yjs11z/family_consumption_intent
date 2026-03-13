/**
 * LYNQN OpenClaw Skill
 * Share text, generate QR codes, and shorten URLs
 */

const LYNQN_API = process.env.LYNQN_API_URL || 'https://lynqn.io/api';

// Helper to parse expiration times
function parseExpiration(expiresArg) {
  const map = {
    '1d': 60 * 60 * 24,
    '1w': 60 * 60 * 24 * 7,
    '1m': 60 * 60 * 24 * 30,
    '3m': 60 * 60 * 24 * 90,
  };
  return map[expiresArg] || map['1w'];
}

// Command: /lynqn share
async function shareText(agent, args) {
  const flags = agent.parseFlags(args, {
    syntax: { type: 'boolean', default: false },
    expires: { type: 'string', default: '1w' },
  });

  const content = flags._.join(' ');
  if (!content) {
    return agent.reply('⚠️ Please provide text to share');
  }

  try {
    const response = await fetch(`${LYNQN_API}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        format: flags.syntax ? 'code' : 'text',
        expiresIn: parseExpiration(flags.expires),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create share');
    }

    const shareUrl = `https://lynqn.io/s/${data.id}`;
    
    return agent.reply(
      `✅ Share created!\n\n` +
      `🔗 ${shareUrl}\n` +
      `⏰ Expires: ${flags.expires}\n` +
      `📱 QR code included in link`
    );
  } catch (error) {
    return agent.reply(`❌ Error: ${error.message}`);
  }
}

// Command: /lynqn qr
async function generateQR(agent, args) {
  const flags = agent.parseFlags(args, {
    size: { type: 'number', default: 300 },
    error: { type: 'string', default: 'M' },
  });

  const content = flags._.join(' ');
  if (!content) {
    return agent.reply('⚠️ Please provide content for QR code');
  }

  try {
    // For QR generation, we can use a client-side approach
    // or point users to the QR generator page
    const qrUrl = `https://lynqn.io/qr-generator?text=${encodeURIComponent(content)}&size=${flags.size}&error=${flags.error}`;
    
    return agent.reply(
      `✅ QR Code ready!\n\n` +
      `🔗 Generate and download: ${qrUrl}\n` +
      `📏 Size: ${flags.size}px\n` +
      `🛡️ Error correction: ${flags.error}`
    );
  } catch (error) {
    return agent.reply(`❌ Error: ${error.message}`);
  }
}

// Command: /lynqn shorten
async function shortenURL(agent, args) {
  const url = args.join(' ');
  
  if (!url) {
    return agent.reply('⚠️ Please provide a URL to shorten');
  }

  try {
    const response = await fetch(`${LYNQN_API}/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to shorten URL');
    }

    return agent.reply(
      `✅ URL shortened!\n\n` +
      `🔗 Short URL: ${data.shortUrl}\n` +
      `📊 Clicks: ${data.clicks}\n` +
      `📅 Created: ${new Date(data.createdAt).toLocaleString()}`
    );
  } catch (error) {
    return agent.reply(`❌ Error: ${error.message}`);
  }
}

// Command: /lynqn stats
async function getStats(agent, args) {
  try {
    const response = await fetch(`${LYNQN_API}/stats`);
    const data = await response.json();

    return agent.reply(
      `📊 LYNQN Stats\n\n` +
      `📝 Total shares: ${data.total?.toLocaleString() || 'N/A'}\n` +
      `🚀 Platform: lynqn.io`
    );
  } catch (error) {
    return agent.reply(`❌ Error: ${error.message}`);
  }
}

// Main skill export
module.exports = {
  name: 'lynqn',
  description: 'Share text, generate QR codes, and shorten URLs',
  
  commands: {
    'lynqn share': shareText,
    'lynqn qr': generateQR,
    'lynqn shorten': shortenURL,
    'lynqn stats': getStats,
  },
  
  // Skill initialization
  async init(agent) {
    agent.log('LYNQN skill loaded successfully');
    return true;
  },
};
