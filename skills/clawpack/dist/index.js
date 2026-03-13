#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import { stat } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
const execAsync = promisify(exec);
// Check if clawpack is installed
async function checkClawpack() {
    try {
        await execAsync('clawpack --version', { timeout: 5000 });
        return true;
    }
    catch {
        return false;
    }
}
// Helper to run clawpack commands
async function runClawpack(args) {
    return execAsync(`clawpack ${args}`, { timeout: 120000 });
}
// Tool implementations
export const tools = {
    // Pack configuration to local file
    async pack(params) {
        if (!await checkClawpack()) {
            return {
                success: false,
                message: "clawpack is not installed. Please install it first: npm install -g clawpack"
            };
        }
        try {
            const args = params.outputFile ? `pack "${params.outputFile}"` : 'pack';
            const { stdout } = await runClawpack(args);
            const match = stdout.match(/文件[:：]\s*(.+)/);
            const filename = match ? match[1].trim() : 'clawpack-backup.zip';
            return {
                success: true,
                message: `Configuration packed successfully!`,
                details: stdout,
                filename,
                location: join(homedir(), filename)
            };
        }
        catch (error) {
            return {
                success: false,
                message: "Failed to pack configuration",
                error: error.message
            };
        }
    },
    // Unpack configuration from file
    async unpack(params) {
        if (!await checkClawpack()) {
            return {
                success: false,
                message: "clawpack is not installed. Please install it first: npm install -g clawpack"
            };
        }
        try {
            await stat(params.file);
        }
        catch {
            return {
                success: false,
                message: `File not found: ${params.file}`
            };
        }
        try {
            const { stdout } = await runClawpack(`unpack "${params.file}"`);
            return {
                success: true,
                message: "Configuration restored successfully!",
                details: stdout,
                nextSteps: ["Run 'openclaw gateway restart' to apply changes"]
            };
        }
        catch (error) {
            return {
                success: false,
                message: "Failed to unpack configuration",
                error: error.message
            };
        }
    },
    // Backup to GitHub
    async backup(params) {
        if (!await checkClawpack()) {
            return {
                success: false,
                message: "clawpack is not installed. Please install it first: npm install -g clawpack"
            };
        }
        let args = 'backup';
        if (params.full)
            args += ' --full';
        if (params.workspace)
            args += ' --workspace';
        if (params.repo)
            args += ` --repo ${params.repo}`;
        if (params.profile)
            args += ` --profile ${params.profile}`;
        try {
            const { stdout } = await runClawpack(args);
            const gistMatch = stdout.match(/Gist ID[:：]\s*([a-f0-9]+)/);
            const gistId = gistMatch ? gistMatch[1] : null;
            return {
                success: true,
                message: "Backup created successfully!",
                details: stdout,
                gistId,
                restoreCommand: gistId ? `clawpack restore ${gistId} --full` : undefined
            };
        }
        catch (error) {
            if (error.message?.includes('GitHub Token')) {
                return {
                    success: false,
                    message: "GitHub authentication required",
                    instructions: [
                        "1. Get a token from https://github.com/settings/tokens (enable 'gist' permission)",
                        "2. Set it: export GITHUB_TOKEN=your_token",
                        "3. Or use 'clawpack pack' for local backup without GitHub"
                    ]
                };
            }
            return {
                success: false,
                message: "Failed to create backup",
                error: error.message
            };
        }
    },
    // Restore from GitHub
    async restore(params) {
        if (!await checkClawpack()) {
            return {
                success: false,
                message: "clawpack is not installed. Please install it first: npm install -g clawpack"
            };
        }
        let args = 'restore';
        if (params.source)
            args += ` ${params.source}`;
        if (params.full)
            args += ' --full';
        try {
            const { stdout } = await runClawpack(args);
            return {
                success: true,
                message: "Configuration restored successfully!",
                details: stdout,
                nextSteps: ["Run 'openclaw gateway restart' to apply changes"]
            };
        }
        catch (error) {
            return {
                success: false,
                message: "Failed to restore configuration",
                error: error.message
            };
        }
    },
    // Profile management
    async profileList() {
        if (!await checkClawpack()) {
            return {
                success: false,
                message: "clawpack is not installed"
            };
        }
        try {
            const { stdout } = await runClawpack('profile list');
            return {
                success: true,
                profiles: stdout
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },
    async profileAdd(params) {
        if (!await checkClawpack()) {
            return {
                success: false,
                message: "clawpack is not installed"
            };
        }
        if (!params.name || !params.gistId) {
            return {
                success: false,
                message: "Profile name and Gist ID are required"
            };
        }
        try {
            let args = `profile add ${params.name} ${params.gistId}`;
            if (params.description)
                args += ` "${params.description}"`;
            const { stdout } = await runClawpack(args);
            return {
                success: true,
                message: "Profile added successfully!",
                details: stdout
            };
        }
        catch (error) {
            return {
                success: false,
                message: "Failed to add profile",
                error: error.message
            };
        }
    },
    async profileUse(params) {
        if (!await checkClawpack()) {
            return {
                success: false,
                message: "clawpack is not installed"
            };
        }
        if (!params.name) {
            return {
                success: false,
                message: "Profile name is required"
            };
        }
        try {
            const { stdout } = await runClawpack(`profile use ${params.name}`);
            return {
                success: true,
                message: `Switched to profile "${params.name}"`,
                details: stdout
            };
        }
        catch (error) {
            return {
                success: false,
                message: "Failed to switch profile",
                error: error.message
            };
        }
    },
    async profileRemove(params) {
        if (!await checkClawpack()) {
            return {
                success: false,
                message: "clawpack is not installed"
            };
        }
        if (!params.name) {
            return {
                success: false,
                message: "Profile name is required"
            };
        }
        try {
            const { stdout } = await runClawpack(`profile remove ${params.name}`);
            return {
                success: true,
                message: `Profile "${params.name}" removed`,
                details: stdout
            };
        }
        catch (error) {
            return {
                success: false,
                message: "Failed to remove profile",
                error: error.message
            };
        }
    },
    // Check status
    async status() {
        if (!await checkClawpack()) {
            return {
                installed: false,
                message: "clawpack is not installed",
                installCommand: "npm install -g clawpack"
            };
        }
        try {
            const { stdout } = await runClawpack('status');
            return {
                installed: true,
                details: stdout
            };
        }
        catch (error) {
            return {
                installed: true,
                version: await execAsync('clawpack --version').then(r => r.stdout.trim()).catch(() => 'unknown'),
                error: error.message
            };
        }
    },
    // List skills
    async list() {
        if (!await checkClawpack()) {
            return {
                success: false,
                message: "clawpack is not installed"
            };
        }
        try {
            const { stdout } = await runClawpack('list');
            return {
                success: true,
                skills: stdout
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
};
// CLI entry for direct usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const [, , command, ...args] = process.argv;
    const params = {};
    args.forEach((arg, i) => {
        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const value = args[i + 1];
            if (value && !value.startsWith('--')) {
                params[key] = value;
            }
            else {
                params[key] = true;
            }
        }
        else if (!Object.values(params).includes(arg)) {
            params.file = arg;
        }
    });
    const tool = tools[command];
    if (tool) {
        tool(params).then((result) => {
            console.log(JSON.stringify(result, null, 2));
        });
    }
    else {
        console.log('Usage: clawpack-skill <command> [options]');
        console.log('');
        console.log('Commands:');
        console.log('  pack              Pack configuration to local file');
        console.log('  unpack            Unpack configuration from file');
        console.log('  backup            Backup to GitHub');
        console.log('  restore           Restore from GitHub');
        console.log('  profileList       List all profiles');
        console.log('  profileAdd        Add a new profile');
        console.log('  profileUse        Switch to a profile');
        console.log('  profileRemove     Remove a profile');
        console.log('  status            Check installation status');
        console.log('  list              List installed skills');
    }
}
