#!/usr/bin/env node

/**
 * Phase 5 Testing Script
 * Tests the vector embeddings and semantic search functionality
 */

const API_BASE = 'http://localhost:3000';

async function testPhase5() {
  console.log('🧪 Testing Phase 5 - Memory System Implementation');
  console.log('='.repeat(50));

  // Test 1: Test embedding generation API
  console.log('\n1. Testing Embedding Generation...');
  try {
    const response = await fetch(`${API_BASE}/api/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'test_embedding',
        text: 'As above, so below. The principle of correspondence reveals the harmony between all planes of existence.'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Embedding generation test passed');
      console.log(`   - Generated ${result.embedding?.length || 0} dimensional vector`);
    } else {
      console.log('❌ Embedding generation test failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Embedding generation test error:', error.message);
  }

  // Test 2: Test search API structure
  console.log('\n2. Testing Search API Structure...');
  try {
    const response = await fetch(`${API_BASE}/api/conversations/search`, {
      method: 'GET',
    });

    if (response.status === 401) {
      console.log('✅ Search API properly requires authentication');
    } else {
      console.log('⚠️  Search API response:', response.status);
    }
  } catch (error) {
    console.log('❌ Search API test error:', error.message);
  }

  // Test 3: Test export API structure
  console.log('\n3. Testing Export API Structure...');
  try {
    const response = await fetch(`${API_BASE}/api/conversations/export`, {
      method: 'GET',
    });

    if (response.status === 401) {
      console.log('✅ Export API properly requires authentication');
    } else if (response.ok) {
      const result = await response.json();
      console.log('✅ Export API accessible');
      console.log(`   - Supports formats: ${result.supportedFormats?.join(', ') || 'unknown'}`);
    } else {
      console.log('⚠️  Export API response:', response.status);
    }
  } catch (error) {
    console.log('❌ Export API test error:', error.message);
  }

  // Test 4: Test journey timeline API
  console.log('\n4. Testing Journey Timeline API...');
  try {
    const response = await fetch(`${API_BASE}/api/journey/timeline`, {
      method: 'GET',
    });

    if (response.status === 401) {
      console.log('✅ Journey API properly requires authentication');
    } else if (response.ok) {
      const result = await response.json();
      console.log('✅ Journey API accessible');
      console.log(`   - Features: ${result.capabilities?.features?.length || 0} features available`);
    } else {
      console.log('⚠️  Journey API response:', response.status);
    }
  } catch (error) {
    console.log('❌ Journey API test error:', error.message);
  }

  // Test 5: Test privacy controls API
  console.log('\n5. Testing Privacy Controls API...');
  try {
    const response = await fetch(`${API_BASE}/api/privacy/data-retention`, {
      method: 'GET',
    });

    if (response.status === 401) {
      console.log('✅ Privacy API properly requires authentication');
    } else if (response.ok) {
      const result = await response.json();
      console.log('✅ Privacy API accessible');
      console.log(`   - User rights: ${result.privacyPolicy?.userRights?.length || 0} rights defined`);
    } else {
      console.log('⚠️  Privacy API response:', response.status);
    }
  } catch (error) {
    console.log('❌ Privacy API test error:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Phase 5 testing completed!');
  console.log('\nNext steps:');
  console.log('- Sign in to the application to test authenticated endpoints');
  console.log('- Create conversations to test embedding generation');
  console.log('- Test semantic search with actual conversation data');
  console.log('- Test export functionality with real conversations');
  console.log('- Explore the spiritual journey timeline features');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPhase5().catch(console.error);
}

module.exports = { testPhase5 };