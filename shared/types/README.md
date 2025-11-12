# @aiq-platform/shared-types

Shared TypeScript type definitions for the AI Maturity Assessment Platform.

## Installation

This package is part of the workspace. Install dependencies:

```bash
npm install
```

## Building

Build the TypeScript definitions:

```bash
npm run build
```

This generates:
- `dist/index.js` - Compiled JavaScript
- `dist/index.d.ts` - TypeScript definitions

## Usage

Import types in your services:

```typescript
import { 
  Organization, 
  User, 
  Assessment, 
  MaturityScore,
  Recommendation 
} from '@aiq-platform/shared-types';
```

## Types Included

- **User & Organization**: `User`, `Organization`, `OrganizationSettings`
- **Assessments**: `Assessment`, `Question`, `Response`, `Framework`
- **Scoring**: `MaturityScore`, `DimensionScore`, `SubDimensionScore`
- **Recommendations**: `Recommendation`, `Priority`, `Effort`
- **Policies**: `Policy`, `PolicyCategory`, `PolicyStatus`
- **Evidence**: Evidence-related types
- **Events**: `DomainEvent`, `EventMetadata` for NATS events
- **Common**: Enums and utility types

## Development

Watch mode for development:

```bash
npm run watch
```

Clean build artifacts:

```bash
npm run clean
```

