/**
 * Seed script that uses the Next.js API route to add the story
 * This is more reliable since it runs server-side
 * 
 * Usage:
 * 1. Make sure your dev server is running: npm run dev
 * 2. Run: npx tsx scripts/seed-via-api.ts
 */

async function seedStory() {
  console.log('🌱 Seeding story via API route...\n');
  console.log('⚠️  Make sure your dev server is running (npm run dev)\n');

  // Try port 3000 first, then 3001
  let port = 3000;
  let response;
  let lastError;
  
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const url = `http://localhost:${port}/api/seed-story`;
      console.log(`Trying ${url}...`);
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(`✅ Connected to server on port ${port}\n`);
      break; // Success, exit loop
    } catch (error: any) {
      lastError = error;
      if (port === 3000) {
        port = 3001; // Try next port
        continue;
      }
    }
  }
  
  if (!response) {
    console.error('❌ Failed to connect to server:', lastError?.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Your dev server is running: npm run dev');
    console.log('   2. The server is accessible at http://localhost:3000 or http://localhost:3001');
    process.exit(1);
  }
  
  try {
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Story seeded successfully!');
      console.log(`📚 Story ID: ${data.storyId}`);
      console.log(`\n✨ Story available at: /stories/${data.storyId}`);
      console.log(`📖 Chapter available at: /stories/${data.storyId}/chapters/1`);
    } else {
      console.error('❌ Error:', data.error);
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Failed to parse response:', error.message);
    process.exit(1);
  }
}

seedStory();

