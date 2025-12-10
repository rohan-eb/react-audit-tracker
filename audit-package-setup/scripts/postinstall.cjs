#!/usr/bin/env node

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

console.log('\n' + colorize('═'.repeat(60), 'cyan'));
console.log(colorize('  ✓ react-audit-tracker installed successfully!', 'green'));
console.log(colorize('═'.repeat(60), 'cyan') + '\n');

console.log(colorize('🚀 Quick Setup (Choose one):', 'bright') + '\n');

console.log(colorize('Option 1: Interactive Setup Wizard (Recommended)', 'yellow'));
console.log('   ' + colorize('npx audit-tracker-setup', 'cyan'));
console.log('   Guides you through configuration with prompts\n');

console.log(colorize('Option 2: Manual Setup', 'yellow'));
console.log('   1. Wrap your app with AuditProvider:');
console.log('      ' + colorize('import { AuditProvider } from "react-audit-tracker";', 'cyan'));
console.log('      ' + colorize('<AuditProvider mode="local"><App /></AuditProvider>', 'cyan'));
console.log('   2. Track events:');
console.log('      ' + colorize('const { track } = useAudit();', 'cyan'));
console.log('      ' + colorize('await track({ action: "...", entity: "...", ... });', 'cyan') + '\n');

console.log(colorize('📚 Resources:', 'bright'));
console.log('   • Documentation: ' + colorize('https://rohan-eb.github.io/react-audit-tracker/', 'blue'));
console.log('   • npm Package: ' + colorize('https://www.npmjs.com/package/react-audit-tracker', 'blue'));
console.log('   • Integration Guide: Included in package (INTEGRATION_GUIDE.md)');
console.log('   • Examples: Included in package (EXAMPLES.md)' + '\n');

console.log(colorize('💡 Storage Options:', 'bright'));
console.log('   • Local Storage (default) - No setup needed');
console.log('   • Firebase - Scalable cloud storage');
console.log('   • REST API - Your own backend\n');

console.log(colorize('Need help?', 'bright'));
console.log('   Visit: ' + colorize('https://www.npmjs.com/package/react-audit-tracker', 'blue') + '\n');

console.log(colorize('═'.repeat(60), 'cyan') + '\n');
