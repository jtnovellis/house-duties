# Docker Deployment Guide

This guide explains how to run the House Duties application using Docker.

## Dockerfile Structure

The Dockerfile uses **multi-stage builds** following best practices:

### Stage 1: Dependencies
- Base image: `node:20-alpine` (minimal footprint)
- Installs pnpm package manager
- Copies and installs all dependencies
- Uses `--frozen-lockfile` to ensure reproducible builds

### Stage 2: Test
- Inherits from Dependencies stage
- Sets test environment variables
- Generates Prisma Client for type checking
- Copies source code and test configuration
- **Runs all unit tests** (build fails if tests fail)
- Supports optional test skipping via `SKIP_TESTS` build argument

### Stage 3: Builder
- Inherits from Test stage (ensures tests pass before building)
- Builds TypeScript source code to JavaScript
- Creates optimized production build

### Stage 4: Production (Runner)
- Minimal production image
- Installs only production dependencies
- Creates non-root user for security
- Copies only necessary files from builder
- Sets up proper ownership and permissions
- Includes health check
- Runs as non-root user

## Docker Compose Configuration

The `docker-compose.yml` includes two services:

1. **postgres**: PostgreSQL 16 database
   - Persistent volume for data
   - Health checks enabled
   - Exposed on port 5432

2. **app**: House Duties CLI application
   - Built from Dockerfile
   - Auto-runs migrations on startup
   - Interactive terminal enabled (stdin/tty)
   - Depends on healthy postgres service

## Usage

### Build the Docker Image

```bash
# Build manually (includes running tests)
docker build -t house-duties:latest .

# Or use the npm script
pnpm docker:build

# Skip tests (emergency use only - NOT RECOMMENDED)
docker build --build-arg SKIP_TESTS=true -t house-duties:latest .
```

**Note:** By default, the Docker build process runs all unit tests. The build will fail if any tests fail, ensuring only tested code is deployed. You can skip tests using the `SKIP_TESTS` build argument, but this is only recommended for emergency situations.

### Run Only Tests (Without Full Build)

If you want to run tests without building the full production image (useful for CI/CD):

```bash
# Run only up to the test stage
docker build --target test -t house-duties:test .

# This verifies tests pass without building the production image
```

### Run with Docker Compose

```bash
# Start all services (database + app)
docker-compose up -d

# Or use the npm script
pnpm docker:run
```

### View Application Logs

```bash
# View app logs
docker-compose logs -f app

# Or use the npm script
pnpm docker:logs
```

### Execute Commands in Running Container

```bash
# Access the container shell
docker exec -it house-duties-app sh

# Run specific commands
docker exec -it house-duties-app node dist/index.js bills:list

# Or use the npm script
pnpm docker:exec
```

### Attach to Interactive Session

```bash
# Attach to the running interactive session
docker attach house-duties-app

# Detach without stopping: Ctrl+P, Ctrl+Q
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Or use the npm script
pnpm docker:stop

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## Running Specific Commands

You can override the default command to run specific operations:

```bash
# Run bills list command
docker-compose run --rm app node dist/index.js bills:list

# Run summary command
docker-compose run --rm app node dist/index.js summary

# Run any other command
docker-compose run --rm app node dist/index.js payments:generate
```

## Database Migrations

Migrations run automatically on container startup. To run manually:

```bash
# Run migrations
docker exec -it house-duties-app npx prisma migrate deploy

# View migration status
docker exec -it house-duties-app npx prisma migrate status
```

## Environment Variables

The app uses these environment variables (configured in docker-compose.yml):

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to "production"

To use custom environment variables, create a `.env.docker` file and update docker-compose.yml:

```yaml
app:
  env_file:
    - .env.docker
```

## Volume Management

### Persistent Data

The PostgreSQL data is stored in a named volume:

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect house-duties_postgres_data

# Backup database
docker exec house-duties-db pg_dump -U postgres house_duties > backup.sql

# Restore database
docker exec -i house-duties-db psql -U postgres house_duties < backup.sql
```

## Best Practices Implemented

1. **Multi-stage builds**: Reduces final image size
2. **Automated testing**: Tests run during build (Stage 2)
3. **Alpine Linux**: Minimal base image (~5MB vs ~900MB)
4. **Non-root user**: Enhanced security
5. **Layer caching**: Optimized build times
6. **Health checks**: Container monitoring
7. **.dockerignore**: Excludes unnecessary files
8. **Frozen lockfile**: Reproducible builds
9. **Production dependencies only**: Smaller image
10. **Proper file ownership**: Security best practice
11. **Network isolation**: Services in private network

## Troubleshooting

### Build fails during test stage

If the Docker build fails during the test stage:

```bash
# View the full build output to see which tests failed
docker build -t house-duties:latest .

# Run tests locally to debug
pnpm test

# Skip tests temporarily (not recommended)
docker build --build-arg SKIP_TESTS=true -t house-duties:latest .
```

### Container won't start

```bash
# Check container logs
docker-compose logs app

# Check database health
docker-compose ps postgres
```

### Database connection issues

```bash
# Verify network
docker network inspect house-duties_house-duties-network

# Test database connection
docker exec house-duties-app nc -zv postgres 5432
```

### Rebuild from scratch

```bash
# Remove all containers and images
docker-compose down
docker rmi house-duties:latest

# Rebuild
docker-compose up --build
```

## Image Size Comparison

- **Full Node image**: ~900MB
- **Alpine Node image**: ~180MB
- **Final production image**: ~250MB (includes app + dependencies)

## Security Features

- Runs as non-root user (uid 1001)
- Minimal attack surface (Alpine Linux)
- No unnecessary packages
- Production-only dependencies
- Health checks enabled
- Network isolation via Docker networks

## Production Deployment

For production deployments, consider:

1. Using specific version tags instead of `latest`
2. Setting up proper logging (e.g., to ELK stack)
3. Implementing backup strategies for database
4. Using Docker secrets for sensitive data
5. Setting resource limits (CPU/Memory)
6. Using orchestration (Kubernetes, Docker Swarm)
7. Implementing monitoring (Prometheus, Grafana)

Example with resource limits:

```yaml
app:
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
      reservations:
        cpus: '0.25'
        memory: 256M
```
