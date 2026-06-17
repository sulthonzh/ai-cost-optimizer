#!/usr/bin/env node

// Simple test to verify the CLI works
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🧪 Testing AI Cost Optimizer CLI...\n');

try {
  // Test help command
  console.log('📖 Testing help command...');
  const helpOutput = execSync('node dist/cli.js --help', { encoding: 'utf8' });
  console.log('✅ Help command works');
  console.log('📋 Available commands:');
  
  const lines = helpOutput.split('\n');
  lines.forEach(line => {
    if (line.match(/^\s*[a-z]/)) {
      console.log(`   ${line.trim()}`);
    }
  });

  console.log('\n🚀 Testing status command...');
  const statusOutput = execSync('node dist/cli.js status', { encoding: 'utf8' });
  console.log('✅ Status command works');
  console.log(statusOutput);

  console.log('\n📊 Creating a test tracker...');
  const trackerOutput = execSync('node dist/cli.js track --model gpt-4 --input 100 --output 50 --operation test --cost 0.0045', { encoding: 'utf8' });
  console.log('✅ Track command works');
  console.log(trackerOutput);

  console.log('\n📈 Testing analyze command...');
  const analyzeOutput = execSync('node dist/cli.js analyze', { encoding: 'utf8' });
  console.log('✅ Analyze command works');
  console.log(analyzeOutput);

  console.log('\n🎉 All tests passed! CLI is working correctly.');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}