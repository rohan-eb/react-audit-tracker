#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function showBanner() {
  console.log('\n' + colorize('╔════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║     @audit-tracker/react Setup Wizard     ║', 'cyan'));
  console.log(colorize('╚════════════════════════════════════════════╝', 'cyan') + '\n');
  console.log(colorize('Welcome! Let\'s set up audit tracking in your project.\n', 'bright'));
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(colorize(prompt, 'blue'), (answer) => {
      resolve(answer.trim());
    });
  });
}

async function selectStorageMode() {
  console.log(colorize('\n📦 Select Storage Mode:', 'bright'));
  console.log('  1. Local Storage (Browser localStorage - No setup needed)');
  console.log('  2. Firebase (Cloud Firestore - Requires Firebase project)');
  console.log('  3. REST API (Your own backend - Requires API endpoint)');
  console.log('  4. Skip - I\'ll configure manually\n');

  const choice = await question('Enter your choice (1-4): ');
  return choice;
}

async function getFirebaseConfig() {
  console.log(colorize('\n🔥 Firebase Configuration:', 'bright'));
  console.log('You need a Firebase project. Get config from: https://console.firebase.google.com\n');

  const apiKey = await question('API Key: ');
  const projectId = await question('Project ID: ');
  const authDomain = await question('Auth Domain (optional, press Enter to skip): ');
  const storageBucket = await question('Storage Bucket (optional, press Enter to skip): ');
  const messagingSenderId = await question('Messaging Sender ID (optional, press Enter to skip): ');
  const appId = await question('App ID (optional, press Enter to skip): ');
  const collectionName = await question('Firestore Collection Name (default: audit_events): ') || 'audit_events';

  return {
    apiKey,
    projectId,
    authDomain: authDomain || `${projectId}.firebaseapp.com`,
    storageBucket: storageBucket || `${projectId}.appspot.com`,
    messagingSenderId,
    appId,
    collectionName
  };
}

async function getApiConfig() {
  console.log(colorize('\n🌐 REST API Configuration:', 'bright'));
  const baseUrl = await question('API Base URL (e.g., https://api.example.com): ');
  return { baseUrl };
}

async function shouldCreateExamples() {
  console.log(colorize('\n📄 Example Pages:', 'bright'));
  const answer = await question('Create example pages? (AuditDemo.tsx & AuditLogs.tsx) [Y/n]: ');
  return !answer || answer.toLowerCase() === 'y';
}

function generateProviderCode(mode, config) {
  let providerSetup = '';

  if (mode === '1') {
    // Local Storage
    providerSetup = `import { AuditProvider } from '@audit-tracker/react';

function App() {
  return (
    <AuditProvider mode="local">
      {/* Your app components */}
    </AuditProvider>
  );
}

export default App;`;
  } else if (mode === '2') {
    // Firebase
    providerSetup = `import { AuditProvider } from '@audit-tracker/react';

const firebaseConfig = {
  config: {
    apiKey: "${config.apiKey}",
    authDomain: "${config.authDomain}",
    projectId: "${config.projectId}",
    storageBucket: "${config.storageBucket}",
    messagingSenderId: "${config.messagingSenderId}",
    appId: "${config.appId}"
  },
  collectionName: '${config.collectionName}'
};

function App() {
  return (
    <AuditProvider mode="firebase" firebaseConfig={firebaseConfig}>
      {/* Your app components */}
    </AuditProvider>
  );
}

export default App;

// Note: Install Firebase SDK if not already installed:
// npm install firebase`;
  } else if (mode === '3') {
    // REST API
    providerSetup = `import { AuditProvider } from '@audit-tracker/react';

const apiConfig = {
  baseUrl: '${config.baseUrl}'
};

function App() {
  return (
    <AuditProvider mode="api" apiConfig={apiConfig}>
      {/* Your app components */}
    </AuditProvider>
  );
}

export default App;`;
  }

  return providerSetup;
}

function generateUsageExample() {
  return `// Example: Track user actions in your components

import { useAudit } from '@audit-tracker/react';

function MyComponent() {
  const { track, loading } = useAudit();

  const handleSave = async () => {
    try {
      // Your business logic here
      
      // Track the action
      await track({
        action: 'DOCUMENT_CREATED',
        entity: 'Document',
        entityId: '123',
        userId: currentUser?.id,
        userName: currentUser?.name,
        description: 'User created a new document',
        metadata: {
          fileName: 'report.pdf',
          fileSize: 1024
        }
      });
      
      console.log('Action tracked successfully!');
    } catch (error) {
      console.error('Failed to track action:', error);
    }
  };

  return (
    <button onClick={handleSave} disabled={loading}>
      Save Document
    </button>
  );
}`;
}

function generateDisplayExample() {
  return `// Example: Display audit logs

import { AuditTable } from '@audit-tracker/react';

function AuditLogsPage() {
  return (
    <div>
      <h1>Audit Logs</h1>
      <AuditTable 
        pageSize={20}
        showFilters={true}
      />
    </div>
  );
}`;
}

function saveToFile(filename, content) {
  try {
    const outputDir = path.join(process.cwd(), 'audit-tracker-setup');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, content, 'utf8');
    return filepath;
  } catch (error) {
    return null;
  }
}

async function main() {
  showBanner();

  const mode = await selectStorageMode();

  if (mode === '4') {
    console.log(colorize('\n✅ No problem! Here are the manual setup resources:', 'green'));
    console.log('\n📚 Documentation:');
    console.log('   • Full Documentation: https://rohan-eb.github.io/react-audit-tracker/');
    console.log('   • npm Package: https://www.npmjs.com/package/@audit-tracker/react');
    console.log('   • Integration Guide: Included in package (INTEGRATION_GUIDE.md)');
    console.log('   • Examples: Included in package (EXAMPLES.md)');
    console.log('\n💡 Tip: Run ' + colorize('npx audit-tracker-setup', 'cyan') + ' anytime to use the wizard.\n');
    rl.close();
    return;
  }

  let config = null;

  if (mode === '2') {
    config = await getFirebaseConfig();
  } else if (mode === '3') {
    config = await getApiConfig();
  }

  const createExamples = await shouldCreateExamples();

  console.log(colorize('\n✨ Generating setup files...', 'yellow'));

  // Generate provider code
  const providerCode = generateProviderCode(mode, config);
  const providerFile = saveToFile('AuditProvider.setup.tsx', providerCode);

  // Generate usage example
  const usageCode = generateUsageExample();
  const usageFile = saveToFile('usage-example.tsx', usageCode);

  // Generate display example
  const displayCode = generateDisplayExample();
  const displayFile = saveToFile('display-example.tsx', displayCode);

  console.log(colorize('\n✅ Setup Complete!', 'green'));
  console.log(colorize('\n📁 Generated Files:', 'bright'));
  if (providerFile) console.log(`   • ${providerFile}`);
  if (usageFile) console.log(`   • ${usageFile}`);
  if (displayFile) console.log(`   • ${displayFile}`);

  console.log(colorize('\n📋 Next Steps:', 'bright'));
  console.log('   1. Copy the provider setup code to your App.tsx/main.tsx');
  console.log('   2. Use the useAudit hook in your components (see usage-example.tsx)');
  console.log('   3. Display logs using AuditTable component (see display-example.tsx)');

  if (mode === '2') {
    console.log(colorize('\n🔥 Firebase Setup:', 'yellow'));
    console.log('   • Install Firebase SDK: npm install firebase');
    console.log('   • Configure security rules in Firebase Console');
    console.log('   • See INTEGRATION_GUIDE.md in package for Firebase setup details');
  }

  console.log(colorize('\n📚 Resources:', 'bright'));
  console.log('   • Documentation: https://rohan-eb.github.io/react-audit-tracker/');
  console.log('   • npm Package: https://www.npmjs.com/package/@audit-tracker/react');
  console.log('   • Integration Guide: Included in package (INTEGRATION_GUIDE.md)');
  console.log('   • Support: Visit npm package page');

  console.log(colorize('\n💚 Thank you for using @audit-tracker/react!\n', 'green'));

  rl.close();
}

// Handle errors
process.on('SIGINT', () => {
  console.log(colorize('\n\n👋 Setup cancelled. Run again anytime with: npx audit-tracker-setup\n', 'yellow'));
  process.exit(0);
});

main().catch((error) => {
  console.error(colorize('\n❌ Setup failed:', 'red'), error.message);
  console.log(colorize('\n📚 Please refer to INTEGRATION_GUIDE.md included in the package or visit: https://rohan-eb.github.io/react-audit-tracker/\n', 'yellow'));
  process.exit(1);
});
