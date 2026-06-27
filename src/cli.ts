#!/usr/bin/env node

import { Command } from 'commander';
import * as trackerModule from './tracker';
import * as analyzerModule from './analyzer';
const { costTrackerManager } = trackerModule;
const { costAnalyzer } = analyzerModule;
import { formatCurrency, formatTokens, formatTable } from './utils';

const program = new Command();

program
  .name('ai-cost-optimizer')
  .description('CLI tool for optimizing AI operational costs')
  .version('1.0.0');

// Track command
program
  .command('track')
  .description('Track AI token usage and costs')
  .option('-m, --model <model>', 'Model name (e.g., gpt-4, claude-3)')
  .option('-i, --input <tokens>', 'Input token count', parseInt)
  .option('-o, --output <tokens>', 'Output token count', parseInt)
  .option('-c, --cost <cost>', 'Total cost', parseFloat)
  .option('-O, --operation <operation>', 'Operation type (e.g., generate, analyze)')
  .action((options) => {
    if (!options.model || !options.input || !options.output) {
      console.error('Error: model, input, and output are required');
      process.exit(1);
    }

    const usage = {
      model: options.model,
      inputTokens: options.input,
      outputTokens: options.output,
      totalTokens: options.input + options.output,
      operation: options.operation || 'unknown',
      cost: options.cost
    };

    costTrackerManager.trackUsage(usage);
    
    console.log('✅ Usage tracked successfully');
    console.log(`   Model: ${usage.model}`);
    console.log(`   Tokens: ${formatTokens(usage.totalTokens)}`);
    console.log(`   Cost: ${formatCurrency(usage.cost || 0)}`);
  });

// Analyze command
program
  .command('analyze')
  .description('Analyze costs and generate optimization recommendations')
  .option('-s, --since <hours>', 'Analyze usage since N hours ago', parseInt)
  .option('-v, --verbose', 'Show detailed analysis')
  .action((options) => {
    const since = options.since ? Date.now() - (options.since * 60 * 60 * 1000) : undefined;
    const analysis = costAnalyzer.analyzeCost(since);

    console.log('\n📊 Cost Analysis Report\n');
    
    // Summary
    console.log(`💰 Total Cost: ${formatCurrency(analysis.totalCost)}`);
    console.log(`📝 Total Tokens: ${formatTokens(analysis.totalTokens)}`);
    console.log(`💎 Average Cost per Token: ${formatCurrency(analysis.averageCostPerToken)}\n`);

    // Cost by model
    if (Object.keys(analysis.costByModel || {}).length > 0) {
      console.log('🔬 Cost by Model:');
      const modelTable = Object.entries(analysis.costByModel || {})
        .map(([model, cost]) => [model, formatCurrency(cost || 0)])
        .sort((a, b) => parseFloat((b[1] ?? '').replace(/[^\d.-]/g, '') || '0') - parseFloat((a[1] ?? '').replace(/[^\d.-]/g, '') || '0'));
      
      console.log(formatTable(['Model', 'Cost'], modelTable));
    }

    // Cost by operation
    if (Object.keys(analysis.costByOperation || {}).length > 0) {
      console.log('\n🔧 Cost by Operation:');
      const operationTable = Object.entries(analysis.costByOperation || {})
        .map(([operation, cost]) => [operation, formatCurrency(cost || 0)])
        .sort((a, b) => parseFloat((b[1] ?? '').replace(/[^\d.-]/g, '') || '0') - parseFloat((a[1] ?? '').replace(/[^\d.-]/g, '') || '0'));

      console.log(formatTable(['Operation', 'Cost'], operationTable));
    }

    // Inefficiencies
    if (analysis.inefficiencies.length > 0) {
      console.log('\n⚠️  Cost Inefficiencies Found:');
      analysis.inefficiencies.forEach(inefficiency => {
        console.log(`\n   [${inefficiency.severity.toUpperCase()}] ${inefficiency.description}`);
        console.log(`   Impact: ${formatCurrency(inefficiency.impact)}`);
        console.log(`   Potential Savings: ${formatCurrency(inefficiency.suggestedSavings)}`);
      });
    }

    // Recommendations
    if (analysis.recommendations.length > 0) {
      console.log('\n💡 Optimization Recommendations:');
      analysis.recommendations.forEach((rec, index) => {
        console.log(`\n   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
        console.log(`      💰 Potential Savings: ${formatCurrency(rec.estimatedSavings)}`);
        console.log(`      📊 Confidence: ${Math.round(rec.confidence * 100)}%`);
        console.log(`      🛠️  ${rec.description}`);
        if (options.verbose) {
          console.log(`      📝 Implementation: ${rec.implementation}`);
        }
      });
    } else {
      console.log('\n✅ No optimization recommendations found. Your AI usage is already efficient!');
    }
  });

// History command
program
  .command('history')
  .description('Show usage history')
  .option('-h, --hours <hours>', 'Show last N hours', parseInt, 24)
  .action((options) => {
    const history = costTrackerManager.getUsageHistory(options.hours);
    
    console.log(`\n📈 Usage History (Last ${options.hours} Hours)\n`);
    
    if (history.length === 0) {
      console.log('No usage data found in the specified time period.');
      return;
    }

    const table = history.map(h => [
      h.hour,
      formatTokens(h.tokens),
      formatCurrency(h.cost)
    ]);

    console.log(formatTable(['Hour', 'Tokens', 'Cost'], table));
  });

// Status command
program
  .command('status')
  .description('Show current cost tracking status')
  .action(() => {
    const trackers = costTrackerManager.getAllTrackers();
    const recentUsage = costTrackerManager.getUsage(undefined, undefined, Date.now() - 24 * 60 * 60 * 1000);
    const totalStats = costTrackerManager.getTotalUsage();

    console.log('\n🚀 AI Cost Optimizer Status\n');
    console.log(`📊 Trackers Configured: ${trackers.length}`);
    console.log(`📝 Recent Operations: ${recentUsage.length}`);
    console.log(`💰 Total Cost (24h): ${formatCurrency(totalStats.cost)}`);
    console.log(`📦 Total Tokens (24h): ${formatTokens(totalStats.totalTokens)}\n`);

    if (trackers.length > 0) {
      console.log('Configured Trackers:');
      trackers.forEach(tracker => {
        console.log(`  • ${tracker.name} (${tracker.model}) - ${formatCurrency(tracker.costPerInputToken)}/input, ${formatCurrency(tracker.costPerOutputToken)}/output`);
      });
    }
  });

// Budget command
program
  .command('budget')
  .description('Set and monitor budgets')
  .option('-n, --name <name>', 'Budget name')
  .option('-a, --amount <amount>', 'Budget amount', parseFloat)
  .option('-p, --period <period>', 'Budget period (daily|weekly|monthly)', 'monthly')
  .option('-t, --threshold <threshold>', 'Alert threshold (0-1)', parseFloat, 0.8)
  .option('-l, --list', 'List existing budgets')
  .action(() => {
    // Budget functionality would be implemented here
    console.log('🏗️  Budget management coming soon!');
  });

program.parse();