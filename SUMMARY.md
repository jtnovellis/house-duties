# House Duties - Project Summary

## Overview
A production-ready console application for tracking rent and utility bills built with modern best practices.

## Technologies Used
- **Runtime**: Node.js 20
- **Language**: TypeScript with ES Modules
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Package Manager**: pnpm
- **CLI Framework**: Commander.js
- **UI**: Inquirer.js (interactive prompts), Chalk (colors), cli-table3 (tables)
- **Containerization**: Docker with multi-stage builds

## Key Features

### Bill Management
- Create, read, update, delete bills
- Support for multiple bill types (Rent, Electricity, Water, Gas, Internet, Phone, Other)
- Active/inactive status tracking
- Recurring billing with customizable due dates

### Payment Tracking
- Track payments with status (Paid, Pending, Overdue)
- Mark payments as paid with date tracking
- Monthly payment generation from active bills
- Automatic overdue detection

### User Experience
- **Interactive Mode**: Friendly menu-driven interface
- **CLI Commands**: Direct command execution for automation
- **Colombian Localization**:
  - Currency: Colombian Pesos (COP)
  - Date format: Spanish (es-CO)
  - Translated labels
- **Visual Indicators**: Colors, emojis, formatted tables

## Architecture

### Multi-Stage Docker Build
1. **Stage 1 (deps)**: Install all dependencies
2. **Stage 2 (builder)**: Build TypeScript and generate Prisma client
3. **Stage 3 (runner)**: Production-ready minimal image

### Project Structure
```
src/
├── commands/       # CLI command implementations
├── services/       # Business logic layer
├── utils/          # Helper functions (formatters, display)
└── index.ts        # Main entry point

prisma/
└── schema.prisma   # Database schema

docker-compose.yml  # Container orchestration
Dockerfile          # Multi-stage build
```

## Best Practices Implemented

### Code Quality
- ✅ TypeScript with strict mode
- ✅ ES Modules
- ✅ Separation of concerns
- ✅ Type-safe database operations with Prisma
- ✅ Error handling

### Docker Best Practices
- ✅ Multi-stage builds (reduced image size)
- ✅ Alpine Linux base (minimal footprint)
- ✅ Non-root user execution
- ✅ Layer caching optimization
- ✅ .dockerignore for build efficiency
- ✅ Health checks
- ✅ Production-only dependencies in final image
- ✅ Network isolation

### Database
- ✅ Migrations for version control
- ✅ Indexes for performance
- ✅ Foreign key relationships
- ✅ Cascade deletes
- ✅ Enums for type safety

### Security
- ✅ Non-root container user (UID 1001)
- ✅ Environment variable configuration
- ✅ No secrets in code
- ✅ Minimal attack surface

## Quick Start

### Using Docker (Production)
```bash
pnpm docker:run
pnpm docker:logs
```

### Local Development
```bash
pnpm install
pnpm db:start
pnpm db:generate
pnpm db:migrate
pnpm dev
```

## Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment (development/production)

### Localization
All formatters use Colombian locale:
- Currency: `es-CO` / `COP`
- Dates: Spanish format
- Labels: Spanish translations

## Scripts Available

### Development
- `pnpm dev` - Run in development mode
- `pnpm build` - Build TypeScript to JavaScript

### Database
- `pnpm db:start` - Start PostgreSQL container
- `pnpm db:stop` - Stop database
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Prisma Studio GUI
- `pnpm db:reset` - Reset database (⚠️  deletes data)

### Docker
- `pnpm docker:build` - Build Docker image
- `pnpm docker:run` - Start all services
- `pnpm docker:stop` - Stop all services
- `pnpm docker:logs` - View application logs
- `pnpm docker:exec` - Access container shell

## Database Schema

### Bills
- Recurring bill definitions
- Types, amounts, due dates
- Active/inactive status

### Payments
- Monthly payment records
- Status tracking (Paid/Pending/Overdue)
- Date tracking (due date, paid date)
- Notes and metadata

## Docker Image Details
- **Base Image**: node:20-alpine
- **Final Size**: ~695MB
- **Security**: Runs as non-root user
- **Health Check**: Enabled
- **Network**: Isolated Docker network

## Future Enhancements
- Web interface
- Email notifications for overdue payments
- Payment history reports
- Budget tracking
- Multiple currency support
- API endpoints for integrations

## Documentation
- `README.md` - Main documentation
- `QUICKSTART.md` - Quick start guide
- `DOCKER.md` - Docker deployment guide
- `SUMMARY.md` - This file

## License
MIT

---

**Built with ❤️ using TypeScript, Docker, and PostgreSQL**
