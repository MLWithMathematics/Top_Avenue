/**
 * TopAvenue Project Health Checker
 * Checks environment variables, dependencies, and project structure before deployment.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(path.join(rootDir, filePath))) {
    log(`✓ ${description} found.`, colors.green);
    return true;
  } else {
    log(`✗ ${description} missing (${filePath})`, colors.red);
    return false;
  }
}

async function run() {
  log("=== TopAvenue Pre-Push Health Check ===\n", colors.cyan);

  let passed = true;

  // 1. Check Project Structure
  log("--- 1. Project Structure ---", colors.blue);
  const requiredFiles = [
    { path: '.env', desc: 'Environment configuration' },
    { path: 'package.json', desc: 'Package manifest' },
    { path: 'supabase/functions/send-email/index.ts', desc: 'Email Edge Function' },
    { path: 'supabase/functions/create-payment-intent/index.ts', desc: 'Payment Edge Function' },
  ];

  for (const f of requiredFiles) {
    if (!checkFile(f.path, f.desc)) passed = false;
  }

  // 2. Check Environment Variables
  log("\n--- 2. Environment Variables ---", colors.blue);
  if (fs.existsSync(path.join(rootDir, '.env'))) {
    const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf8');
    const requiredEnv = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    for (const key of requiredEnv) {
      if (envContent.includes(key)) {
        log(`✓ ${key} is defined.`, colors.green);
      } else {
        log(`✗ ${key} is missing in .env`, colors.red);
        passed = false;
      }
    }
  }

  // 3. Check Dependencies
  log("\n--- 3. Dependencies ---", colors.blue);
  if (fs.existsSync(path.join(rootDir, 'node_modules'))) {
    log("✓ node_modules found.", colors.green);
  } else {
    log("✗ node_modules missing. Run 'npm install' first.", colors.red);
    passed = false;
  }

  // 4. Try Build
  log("\n--- 4. Build Test ---", colors.blue);
  try {
    log("Running 'npm run build'...", colors.yellow);
    execSync('npm run build', { stdio: 'ignore', cwd: rootDir });
    log("✓ Build successful.", colors.green);
  } catch (err) {
    log("✗ Build failed. Check your code for errors.", colors.red);
    passed = false;
  }

  log("\n========================================", colors.cyan);
  if (passed) {
    log("HEALTH CHECK PASSED: Code is ready to push!", colors.green);
    process.exit(0);
  } else {
    log("HEALTH CHECK FAILED: Please fix the issues above.", colors.red);
    process.exit(1);
  }
}

run();
