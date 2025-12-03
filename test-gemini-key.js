/**
 * Test script to verify Gemini API key works with gemini-1.5-pro
 * Run with: node test-gemini-key.js
 *
 * This will tell us if the issue is:
 * - API key doesn't have access to gemini-1.5-pro
 * - Generative Language API not enabled
 * - Or if the key works fine (meaning the issue is in our Cloud Function code)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGeminiKey() {
  console.log('='.repeat(80));
  console.log('GEMINI API KEY TEST');
  console.log('='.repeat(80));
  console.log('');

  // Get API key from environment variable
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ ERROR: GEMINI_API_KEY environment variable not set');
    console.log('');
    console.log('Please set your Google Cloud API key:');
    console.log('Windows: set GEMINI_API_KEY=your-key-here && node test-gemini-key.js');
    console.log('');
    process.exit(1);
  }

  console.log(`🔑 API Key: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 5)}`);
  console.log('');

  try {
    console.log('📡 Testing gemini-1.5-pro-latest model...');
    console.log('-'.repeat(80));

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });

    const result = await model.generateContent('Reply with exactly: "API key works with gemini-1.5-pro-latest!"');
    const response = result.response;
    const text = response.text();

    console.log('');
    console.log('✅ SUCCESS! gemini-1.5-pro-latest is working!');
    console.log('');
    console.log('Response:', text);
    console.log('');
    console.log('='.repeat(80));
    console.log('CONCLUSION: Your API key is functioning correctly!');
    console.log('='.repeat(80));
    console.log('');
    console.log('Next steps:');
    console.log('1. The API key itself is fine');
    console.log('2. The issue must be in the Cloud Function code or configuration');
    console.log('3. Check Cloud Function logs for detailed error messages');
    console.log('4. Verify Secret Manager is using the correct key version');
    console.log('');

  } catch (error) {
    console.log('');
    console.error('❌ ERROR: API key test failed');
    console.log('='.repeat(80));
    console.error('Error message:', error.message);
    console.log('');

    if (error.message.includes('API_KEY_INVALID')) {
      console.log('🔍 DIAGNOSIS: Invalid API key');
      console.log('   - The API key format is wrong or has been revoked');
      console.log('   - Create a new API key in Google Cloud Console');
      console.log('');
    } else if (error.message.includes('403') || error.message.includes('permission')) {
      console.log('🔍 DIAGNOSIS: Permission denied');
      console.log('   - The API key does not have access to Generative Language API');
      console.log('   - Enable it: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
      console.log('');
    } else if (error.message.includes('404')) {
      console.log('🔍 DIAGNOSIS: Model not found');
      console.log('   - gemini-1.5-pro is not available with this API key type');
      console.log('   - This key may be an AI Studio key (limited model access)');
      console.log('   - Create a Google Cloud managed API key instead');
      console.log('');
    } else if (error.message.includes('429') || error.message.includes('quota')) {
      console.log('🔍 DIAGNOSIS: Quota exceeded');
      console.log('   - You have hit your API quota limits');
      console.log('   - Check usage: https://aistudio.google.com/app/apikey');
      console.log('');
    } else {
      console.log('🔍 DIAGNOSIS: Unknown error');
      console.log('   - See full error below for details');
      console.log('');
    }

    console.error('Full error details:');
    console.error(error);
    console.log('');
  }
}

testGeminiKey();
