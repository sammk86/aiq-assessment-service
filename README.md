# AIQ Assessment Service

Assessment management service that handles assessment creation, question management, framework imports, and response submission.

## Overview

The Assessment Service manages the core assessment workflow, including assessment creation, framework imports, question management, and response handling. It integrates with MongoDB for framework storage and PostgreSQL for assessment data.

## Features

- **Assessment Management**: Create, update, and manage assessments
- **Framework Import**: Import assessment frameworks from CSV
- **Question Management**: Handle questions and responses
- **Response Submission**: Process and validate assessment responses
- **Event-Driven**: Publishes NATS events for score calculation
- **REST API**: Comprehensive REST API for all assessment operations

## Repository Structure

```
aiq-assessment-service/
├── src/
│   ├── assessments/      # Assessment module
│   ├── frameworks/        # Framework import module
│   ├── events/           # NATS event handling
│   ├── prisma/           # Prisma service
│   └── main.ts           # Application entry point
├── prisma/               # Prisma schema and migrations
├── shared/               # Shared TypeScript types
│   └── types/
├── test/                 # E2E tests
├── k8s/                  # Kubernetes manifests
├── Dockerfile            # Docker build file
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript configuration
├── nest-cli.json         # NestJS CLI configuration
├── .env.example          # Environment template
└── README.md             # This file
```

## Prerequisites

- Node.js 22+
- PostgreSQL database
- MongoDB database
- NATS message bus
- Docker & Docker Compose (for containerized deployment)

## Local Development

### Using Docker

```bash
# Build image
docker build -t aiq-assessment:local .

# Run container
docker run -p 3002:3002 --env-file .env aiq-assessment:local
```

### Running Locally

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Run in development mode
npm run start:dev

# Run tests
npm test
```

## Environment Variables

See `.env.example` for all required environment variables. Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `MONGODB_URL` - MongoDB connection string
- `REDIS_URL` - Redis connection string (optional)
- `NATS_URL` - NATS connection URL
- `PORT` - Service port (default: 3002)
- `API_PREFIX` - API prefix (default: `api/v1`)
- `FRONTEND_URL` - Frontend URL for CORS

## API Documentation

- **Health Check**: `GET /health`
- **Assessments**: `GET/POST /api/v1/assessments`
- **Framework Import**: `POST /api/v1/frameworks/import`
- **Responses**: `POST /api/v1/assessments/{id}/responses`

OpenAPI documentation available at `/api` when running the service.

## Docker Hub

Images are automatically built and pushed to Docker Hub on:
- Push to `main` branch → `latest` tag
- Git tags (e.g., `v1.0.0`) → version tags

### Manual Build and Push

```bash
# Build
docker build -t {dockerhub-username}/aiq-assessment:{version} .

# Push
docker push {dockerhub-username}/aiq-assessment:{version}
docker push {dockerhub-username}/aiq-assessment:latest
```

## CI/CD

GitHub Actions automatically:
1. Runs tests on PRs
2. Builds Docker image on push to main
3. Publishes to Docker Hub with appropriate tags

Configure GitHub Secrets:
- `DOCKERHUB_USERNAME` - Your Docker Hub username
- `DOCKERHUB_TOKEN` - Docker Hub access token

## Database

- **PostgreSQL**: Stores assessments, questions, and responses
- **MongoDB**: Stores framework definitions

## NATS Events

Publishes:
- `response.submitted` - When a response is submitted (triggers scoring)

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:cov
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Submit a pull request

## Versioning

This service follows [Semantic Versioning](https://semver.org/).

## License

PROPRIETARY

