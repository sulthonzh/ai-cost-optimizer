# AI Cost Optimizer

A zero-dependency CLI tool for optimizing AI operational costs and improving cost efficiency.

## 🎯 Problem

AI operations are becoming prohibitively expensive as adoption accelerates (84% of developers use AI tools daily). Teams struggle with:

- Unpredictable token costs scaling with usage
- No visibility into cost drivers across AI operations
- Inefficient prompting strategies leading to unnecessary costs
- Lack of cost optimization tools specifically for AI
- Difficulty forecasting and budgeting for AI operations

## ✨ Features

### 🔍 Cost Visibility
- Real-time tracking of token usage across all AI operations
- Historical usage analysis with customizable time ranges
- Cost breakdown by model, operation, and time period

### 🧮 Cost Analysis
- Identify cost drivers, inefficiencies, and optimization opportunities
- Automatic detection of high-cost operations and expensive models
- Output ratio analysis to identify inefficient prompts

### 💡 Recommendations Engine
- Automated cost reduction suggestions
- Prioritized recommendations with estimated savings
- Implementation guidance for each recommendation

### 📊 Reporting
- Comprehensive cost analysis reports
- Usage history visualization
- Export to JSON for integration with other tools

### 🚀 CLI Interface
- Simple command-line interface
- Easy tracking of AI usage
- Real-time cost analysis

## 🚀 Installation

```bash
npm install -g ai-cost-optimizer
```

Or use npx for immediate usage:

```bash
npx ai-cost-optimizer --help
```

## 📖 Usage

### Track AI Usage

```bash
# Track a single AI operation
ai-cost-optimizer track \\
  --model "gpt-4" \\
  --input 1500 \\
  --output 500 \\
  --operation "generate-code" \\
  --cost 0.023

# Track with automatic cost calculation
ai-cost-optimizer track \\
  --model "claude-3" \\
  --input 800 \\
  --output 200 \\
  --operation "analyze-text"
```

### Analyze Costs

```bash
# Get current cost analysis
ai-cost-optimizer analyze

# Analyze last 7 days
ai-cost-optimizer analyze --since 168

# Get detailed analysis with recommendations
ai-cost-optimizer analyze --verbose
```

### View Usage History

```bash
# Show last 24 hours
ai-cost-optimizer history

# Show last 7 days
ai-cost-optimizer history --hours 168
```

### Check Status

```bash
# Show current tracking status
ai-cost-optimizer status
```

## 📊 Sample Output

```
📊 Cost Analysis Report

💰 Total Cost: $342.56
📝 Total Tokens: 2,847,392
💎 Average Cost per Token: $0.00012

🔬 Cost by Model:
┌────────────┬────────────┐
│ Model      │ Cost       │
├────────────┼────────────┤
│ gpt-4      │ $234.12    │
│ claude-3   │ $108.44    │
└────────────┴────────────┘

🔧 Cost by Operation:
┌────────────┬────────────┐
│ Operation  │ Cost       │
├────────────┼────────────┤
│ generate-code │ $156.78  │
│ analyze-text  │ $85.32    │
│ translate    │ $100.46   │
└────────────┴────────────┘

⚠️  Cost Inefficiencies Found:

   [HIGH] Operation "generate-code" has high token usage (284,739 tokens)
   Impact: $234.12
   Potential Savings: $46.82

   [MEDIUM] Model "gpt-4" is expensive ($0.00015 per token)
   Impact: $234.12
   Potential Savings: $35.12

💡 Optimization Recommendations:

   1. [HIGH] Use cheaper model for less critical operations
      💰 Potential Savings: $46.82
      📊 Confidence: 80%
      🛠️  Consider using a more cost-effective model for operations with generate-code

   2. [MEDIUM] Optimize prompts to reduce output tokens
      💰 Potential Savings: $21.35
      📊 Confidence: 60%
      🛠️  Improve prompts for analyze-text to reduce output token usage

   3. [MEDIUM] Batch multiple requests into single operations
      💰 Potential Savings: $18.92
      📊 Confidence: 70%
      🛠️  Group related requests and process them together
```

## 🔧 Configuration

### Cost Tracking Configuration

Create a `.ai-cost-optimizer.json` file in your project:

```json
{
  "trackers": [
    {
      "name": "OpenAI GPT-4",
      "model": "gpt-4",
      "costPerInputToken": 0.00003,
      "costPerOutputToken": 0.00006,
      "currency": "USD",
      "trackedOperations": ["generate", "analyze", "translate"]
    },
    {
      "name": "Anthropic Claude",
      "model": "claude-3",
      "costPerInputToken": 0.000015,
      "costPerOutputToken": 0.000075,
      "currency": "USD",
      "trackedOperations": ["analyze", "summarize", "write"]
    }
  ]
}
```

### Environment Variables

```bash
# Default currency for all costs
AICO_COST_CURRENCY=USD

# Default cost tracking file
AICO_CONFIG_FILE=.ai-cost-optimizer.json

# Enable verbose logging
AICO_VERBOSE=true
```

## 🧪 Development

```bash
# Clone the repository
git clone https://github.com/sulthonzh/ai-cost-optimizer.git
cd ai-cost-optimizer

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run in development mode
npm run dev
```

## 🏗️ Architecture

```
src/
├── index.ts          # Main exports
├── cli.ts           # CLI interface
├── tracker.ts       # Cost tracking logic
├── analyzer.ts      # Cost analysis and recommendations
├── types.ts         # TypeScript interfaces
└── utils.ts         # Utility functions
```

### Core Components

- **CostTrackerManager**: Tracks token usage and cost data
- **CostAnalyzer**: Analyzes costs and generates recommendations
- **CLI Interface**: Command-line interface for easy usage
- **Recommendation Engine**: AI-powered optimization suggestions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 Roadmap

- [ ] Integration with popular AI APIs (OpenAI, Anthropic, etc.)
- [ ] Automated cost forecasting
- [ ] Budget management with alerts
- [ ] Web dashboard for visualization
- [ ] Team-based cost attribution
- [ ] Cost-optimization for AI agents
- [ ] Integration with CI/CD pipelines

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the growing need for AI cost optimization
- Built for the 84% of developers using AI tools daily
- Dedicated to making AI operations more sustainable and cost-effective

## 📞 Support

If you have any questions or suggestions, please open an issue or contact us:

- GitHub Issues: [https://github.com/sulthonzh/ai-cost-optimizer/issues](https://github.com/sulthonzh/ai-cost-optimizer/issues)
- Email: support@ai-cost-optimizer.dev

---

Made with 💚 by [Sulthonzh](https://github.com/sulthonzh) for the AI community