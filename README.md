# AI Cost Optimizer

Stop bleeding money on AI APIs. Track every token, spot inefficiencies, and cut your LLM bill by up to 30%.

**Single-dependency CLI tool** for monitoring and optimizing AI operational costs — real-time token tracking, cost analysis, and actionable recommendations.

## Why

AI API costs scale unpredictably. Teams waste 20-40% of their AI spend on:
- Overpowered models for simple tasks (GPT-4 where GPT-3.5 suffices)
- Bloated prompts with unnecessary output tokens
- No visibility into per-operation cost breakdowns

This tool surfaces those costs and tells you exactly where to save.

## Quick Start

```bash
npm install -g ai-cost-optimizer

# Track an AI operation
ai-cost-optimizer track --model "gpt-4" --input 1500 --output 500 --operation "generate-code" --cost 0.023

# See where your money goes
ai-cost-optimizer analyze

# Check current spend
ai-cost-optimizer status
```

## Features

### Cost Tracking
- Real-time token usage logging across all AI operations
- Per-model, per-operation, and time-range filtering
- Configurable cost trackers with per-token pricing

### Cost Analysis
- Automatic inefficiency detection (high token usage, expensive models, inefficient prompts)
- Actionable recommendations with estimated savings and confidence scores
- Historical trends with hourly aggregation

### CLI Interface
Five commands: `track`, `analyze`, `history`, `status`, `budget`

## Real-World Examples

### 1. Audit Your GPT-4 Spend
```bash
# After a week of AI operations, see what's costing the most
ai-cost-optimizer analyze --since 168 --verbose
# Output shows cost by model, by operation, inefficiencies, and savings recommendations
```

### 2. CI/CD Cost Gate
```bash
# In your CI pipeline, check AI costs haven't exceeded budget
ai-cost-optimizer status
# Parse output to fail build if costs exceed threshold
```

### 3. Compare Model Costs
```bash
# Track same operation across different models
ai-cost-optimizer track --model "gpt-4" --input 1000 --output 300 --operation "summarize" --cost 0.045
ai-cost-optimizer track --model "gpt-3.5" --input 1000 --output 300 --operation "summarize" --cost 0.003
ai-cost-optimizer analyze  # See side-by-side cost comparison
```

## How It Compares

| Feature | ai-cost-optimizer | Helicone | Langfuse | Custom scripts |
|---|---|---|---|---|
| Setup time | 30 seconds | Dashboard signup | Self-hosted | Hours |
| Dependencies | One (commander) | Proxy server | PostgreSQL | Whatever you wrote |
| Cost | Free | Free tier → $$ | Free tier → $$ | Free |
| Recommendations | ✅ Automated | ❌ Manual | ❌ Manual | ❌ None |
| Offline/Private | ✅ | ❌ Cloud | ✅ Self-host | ✅ |
| Token-level tracking | ✅ | ✅ | ✅ | Maybe |

## Configuration

Create `.ai-cost-optimizer.json` in your project:

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
    }
  ]
}
```

## Development

```bash
git clone https://github.com/sulthonzh/ai-cost-optimizer.git
cd ai-cost-optimizer
npm install
npm test          # 76 tests, 100% pass rate
npm run test:coverage  # 99.57% statements, 88.74% branches
npm run build     # ESM + CJS
```

## Tech Stack

- TypeScript 5 (strict mode, all strict flags)
- Vitest 1.6 + c8 coverage
- tsup (ESM + CJS dual build)
- ESLint 9 flat config + typescript-eslint 8
- Node >=18

## License

MIT — see [LICENSE](LICENSE)

---

Made by [Sulthonzh](https://github.com/sulthonzh)
