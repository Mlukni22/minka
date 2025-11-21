/**
 * Script to check and ensure .env.local has all required Firebase variables
 * 
 * Usage: npx tsx scripts/check-env.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const envPath = path.join(process.cwd(), '.env.local');
const templatePath = path.join(process.cwd(), 'env-template.txt');

function checkEnvFile() {
  console.log('🔍 Checking .env.local file...\n');

  let envContent = '';
  let needsUpdate = false;
  const missingVars: string[] = [];
  const existingVars: string[] = [];

  // Read existing .env.local if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
    console.log('✅ .env.local file exists\n');
  } else {
    console.log('⚠️  .env.local file does not exist\n');
    needsUpdate = true;
  }

  // Check each required variable
  for (const varName of requiredVars) {
    const regex = new RegExp(`^${varName}=`, 'm');
    if (envContent.match(regex)) {
      existingVars.push(varName);
      console.log(`✅ ${varName} is set`);
    } else {
      missingVars.push(varName);
      console.log(`❌ ${varName} is missing`);
      needsUpdate = true;
    }
  }

  console.log('\n');

  if (!needsUpdate) {
    console.log('✨ All Firebase variables are configured!');
    return;
  }

  // Read template
  let templateContent = '';
  if (fs.existsSync(templatePath)) {
    templateContent = fs.readFileSync(templatePath, 'utf-8');
  } else {
    // Create template content
    templateContent = `# Firebase Configuration
# Get these values from Firebase Console > Project Settings > Your apps > Web app

${requiredVars.map(v => `${v}=your_value_here`).join('\n')}

# Instructions:
# 1. Go to https://console.firebase.google.com/
# 2. Create a new project or select existing one
# 3. Go to Project Settings (gear icon)
# 4. Scroll to "Your apps" section
# 5. Click "Add app" > Web app (</> icon)
# 6. Register your app with a nickname
# 7. Copy the config values above
# 8. Enable Authentication (Email/Password + Google)
# 9. Enable Firestore Database
`;
  }

  if (missingVars.length > 0) {
    console.log('📝 Missing variables:');
    missingVars.forEach(v => console.log(`   - ${v}`));
    console.log('\n');

    // Add missing variables to existing content
    if (envContent && !envContent.endsWith('\n')) {
      envContent += '\n';
    }

    // Add Firebase section header if not present
    if (!envContent.includes('# Firebase Configuration')) {
      envContent += '\n# Firebase Configuration\n';
      envContent += '# Get these values from Firebase Console > Project Settings > Your apps > Web app\n\n';
    }

    // Add missing variables
    for (const varName of missingVars) {
      envContent += `${varName}=your_value_here\n`;
    }

    // Write updated content
    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log('✅ Updated .env.local with missing variables');
    console.log('⚠️  Please replace "your_value_here" with your actual Firebase values\n');
  }

  console.log('📋 Next steps:');
  console.log('1. Open .env.local in your editor');
  console.log('2. Replace "your_value_here" with your actual Firebase configuration values');
  console.log('3. Get your Firebase config from: https://console.firebase.google.com/');
  console.log('   → Project Settings → Your apps → Web app → Config');
  console.log('4. Save the file');
  console.log('5. Run the seed script: npx tsx scripts/seed-brief-ohne-namen.ts\n');
}

checkEnvFile();

