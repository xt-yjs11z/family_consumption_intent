#!/usr/bin/env node
import { tools } from './index.js';

const [, , toolName, ...args] = process.argv;

if (!toolName) {
  console.error('Usage: clawpack-skill <tool-name> [json-params]');
  console.error('');
  console.error('Available tools:');
  console.error('  pack    - Pack configuration to local file');
  console.error('  unpack  - Unpack configuration from file');
  console.error('  backup  - Backup to GitHub');
  console.error('  restore - Restore from GitHub');
  console.error('  status  - Check installation status');
  console.error('  list    - List installed skills');
  process.exit(1);
}

const tool = (tools as any)[toolName];
if (!tool) {
  console.error(`Unknown tool: ${toolName}`);
  process.exit(1);
}

// Parse params from JSON or command line
let params: any = {};
if (args[0]) {
  try {
    params = JSON.parse(args[0]);
  } catch {
    // Treat as positional argument
    if (toolName === 'unpack' || toolName === 'pack') {
      params = { file: args[0], outputFile: args[0] };
    } else if (toolName === 'restore') {
      params = { source: args[0] };
    }
  }
}

tool(params).then((result: any) => {
  console.log(JSON.stringify(result, null, 2));
}).catch((error: any) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exit(1);
});
