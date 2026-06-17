#!/usr/bin/env node

// Simple test to verify core functionality works
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing AI Cost Optimizer Core Functionality...\n');

try {
  // Import core modules
  const { costTrackerManager } = await import('./dist/index.js');
  const { costAnalyzer } = await import('./dist/index.js');

  console.log('✅ Core modules imported successfully\n');

  // Test 1: Create a tracker
  console.log('📊 Creating cost tracker...');
  const trackerId = costTrackerManager.createTracker({
    name: 'GPT-4 Test Tracker',
    model: 'gpt-4',
    costPerInputToken: 0.00003,
    costPerOutputToken: 0.00006,
    currency: 'USD',
    trackedOperations: ['generate', 'analyze']
  });
  console.log(`✅ Tracker created with ID: ${trackerId}`);

  // Test 2: Track some usage
  console.log('\n📝 Tracking usage data...');
  costTrackerManager.trackUsage({
    model: 'gpt-4',
    inputTokens: 1000,
    outputTokens: 500,
    operation: 'generate',
    cost: 0.045
  });

  costTrackerManager.trackUsage({
    model: 'gpt-4',
    inputTokens: 2000,
    outputTokens: 1000,
    operation: 'analyze',
    cost: 0.09
  });

  console.log('✅ Usage data tracked');

  // Test 3: Get total usage
  console.log('\n📈 Calculating total usage...');
  const totalStats = costTrackerManager.getTotalUsage();
  console.log(`✅ Total tokens: ${totalStats.totalTokens}`);
  console.log(`✅ Total cost: $${totalStats.cost}`);

  // Test 4: Analyze costs
  console.log('\n🧮 Analyzing costs...');
  const analysis = costAnalyzer.analyzeCost();
  console.log(`✅ Analysis complete`);
  console.log(`✅ Found ${analysis.inefficiencies.length} inefficiencies`);
  console.log(`✅ Generated ${analysis.recommendations.length} recommendations`);

  // Test 5: Get usage history
  console.log('\n📊 Getting usage history...');
  const history = costTrackerManager.getUsageHistory(24);
  console.log(`✅ History entries: ${history.length}`);

  // Test 6: Show summary
  console.log('\n📋 Summary:');
  console.log(`   Trackers: ${costTrackerManager.getAllTrackers().length}`);
  console.log(`   Total operations: ${costTrackerManager.getUsage().length}`);
  console.log(`   Total cost: $${analysis.totalCost}`);
  console.log(`   Total tokens: ${analysis.totalTokens}`);

  if (analysis.recommendations.length > 0) {
    console.log('\n💡 Top Recommendations:');
    analysis.recommendations.slice(0, 2).forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec.title} (Save $${rec.estimatedSavings})`);
    });
  }

  console.log('\n🎉 All core functionality tests passed!');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}