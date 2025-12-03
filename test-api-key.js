/**
 * Test script to verify Gemini API key is working
 * Run with: node test-api-key.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testApiKey() {
  // Get API key from Secret Manager value (you'll need to paste it)
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ ERROR: GEMINI_API_KEY environment variable not set');
    console.log('\nPlease run:');
    console.log('set GEMINI_API_KEY=your-key-here && node test-api-key.js');
    process.exit(1);
  }

  console.log('🔑 Testing Gemini API key...');
  console.log(`Key starts with: ${apiKey.substring(0, 10)}...`);
  console.log('');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Test with gemini-1.5-flash (same model as Cloud Function)
    console.log('📡 Attempting to connect to gemini-1.5-flash...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent('Say "API key is working!" if you can read this.');
    const response = result.response;
    const text = response.text();

    console.log('✅ SUCCESS! API key is working!');
    console.log('Response:', text);
    console.log('');
    console.log('✅ Your Gemini API key is functioning correctly via Google Cloud');

  } catch (error) {
    console.error('❌ ERROR: API key test failed');
    console.error('Error details:', error.message);

    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n🔍 The API key appears to be invalid or not properly formatted');
    } else if (error.message.includes('403')) {
      console.log('\n🔍 The API key does not have permission to access the Generative Language API');
      console.log('   Check: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
    } else if (error.message.includes('404')) {
      console.log('\n🔍 The Generative Language API may not be enabled for this project');
      console.log('   Enable it here: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?project=kpi-dashboardgit-9913298-66e65');
    }

    console.error('\nFull error:', error);
  }
}

testApiKey();
