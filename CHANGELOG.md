# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-29

### Added
- ESLint flat config with typescript-eslint v8
- Vitest coverage configuration (v8 provider)
- CLI integration tests (7 tests covering all commands)
- Index export tests (6 tests covering all exports)
- `test:coverage` script in package.json
- Real-world examples in README (GPT-4 spend audit, CI/CD cost gate, model cost comparison)
- Comparison table in README (vs Helicone, Langfuse, custom scripts)

### Changed
- Replaced `any` types with `unknown` in debounce/throttle generics
- Replaced `any` in deepClone with `Record<string, unknown>`
- Updated ESLint from broken v6 config to flat config
- Removed incompatible `@typescript-eslint/*` v6 packages
- Fixed: 20 broken tests (missing imports, wrong calculations, boundary bugs)
- Fixed: `trackUsage` not computing totalTokens from input + output
- Fixed: `getTotalUsage` recalculating cost instead of summing per-usage
- Fixed: `isValidEmail` regex double-escaping (emails always failed)
- Fixed: `isValidUrl` accepting non-HTTP protocols (ftp://)
- Fixed: `formatCurrency` not respecting custom currency symbols
- Fixed: trailing zeros in formatCurrency, formatTokens, formatDuration
- Bumped version to 1.1.0

## [Unreleased]

### Added
- ESLint flat config with typescript-eslint v8
- Vitest coverage configuration (v8 provider)
- CLI integration tests (7 tests covering all commands)
- Index export tests (6 tests covering all exports)
- `test:coverage` script in package.json

### Changed
- Replaced `any` types with `unknown` in debounce/throttle generics
- Replaced `any` in deepClone with `Record<string, unknown>`
- Updated ESLint from broken v6 config to flat config
- Removed incompatible `@typescript-eslint/*` v6 packages

## [1.0.0] - 2026-06-27

### Added
- Cost tracking with `CostTrackerManager` (create, update, delete, query)
- Token usage tracking per model, operation, and time range
- Cost analysis engine with inefficiency detection
- Optimization recommendation generator (model rightsize, prompt optimize, batch operations)
- CLI interface with commands: `track`, `analyze`, `history`, `status`, `budget`
- Utility functions: formatCurrency, formatTokens, formatTable, formatDuration, debounce, throttle, deepClone
- Support for custom cost trackers with per-token pricing
- Usage history aggregation (hourly buckets)
- TypeScript strict mode with all strict flags enabled
- Zero runtime dependencies (commander for CLI only)
- 63 tests across 3 test suites (tracker, analyzer, utils)
