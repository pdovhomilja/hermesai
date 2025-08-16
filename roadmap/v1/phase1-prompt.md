# IALchemist.app - Phase 1 Implementation

## Context

You are implementing Phase 1 of the IALchemist.app project - a sophisticated AI-powered spiritual guidance platform featuring Hermes Trismegistus as the AI persona. This phase focuses on establishing the core infrastructure foundation including PostgreSQL with PGVector, Prisma ORM, and essential utility functions.

## Project Overview

- **Framework**: Next.js 15.4.6 with React 19.1.0 (App Router)
- **Language**: TypeScript (strict configuration)
- **Styling**: Tailwind CSS v4 with mystical theme
- **AI**: Vercel AI SDK v5, OpenAI GPT-5/GPT-4o
- **Database**: PostgreSQL with PGVector, Prisma ORM
- **Auth**: NextAuth.js v5.0.0-beta.29
- **Deployment**: Vercel
- **Email**: Resend with React Email
- **UI**: Radix UI components with mystical design system
- **i18n**: next-intl (EN, CS, ES, FR, DE, IT, PT)

## Current Implementation Status

Previous phases completed:

- None (this is the foundation phase)

## Phase 1 Requirements

This phase establishes the foundational infrastructure for the IALchemist.app project, including database schema design with PostgreSQL & PGVector, environment configuration, and core utilities.

### Objectives

1. Set up PostgreSQL with PGVector extension
2. Design and implement comprehensive database schema
3. Configure Prisma ORM with all required models
4. Set up environment variables and configuration
5. Create database utilities and connection pooling
6. Implement base error handling and logging

## Implementation Guidelines

### Code Quality Standards

1. **TypeScript First**: All code must be TypeScript with proper type safety
2. **Functional Programming**: Use functional patterns, avoid classes where possible
3. **Component Structure**: Follow the established pattern:
   ```
   - Exported component
   - Subcomponents
   - Helper functions
   - Static content
   - Type definitions
   ```
4. **Error Handling**: Implement comprehensive error handling with proper logging
5. **Performance**: Optimize for Core Web Vitals, use React Server Components when possible

### File Naming Conventions

- **Directories**: lowercase with dashes (e.g., `spiritual-guidance`)
- **Components**: PascalCase files with kebab-case directories
- **API Routes**: lowercase with descriptive names
- **Utilities**: camelCase functions in kebab-case files

### Database Considerations

- All database operations must use Prisma
- Include proper indexing for performance
- Use transactions for multi-table operations
- Consider data retention and privacy requirements

### Security Requirements

- Validate all inputs with Zod schemas
- Implement proper authentication checks
- Use CSRF protection where needed
- Sanitize user content appropriately
- Follow secure coding practices

### Testing Requirements

- Write unit tests for utility functions
- Include integration tests for API endpoints
- Add component tests for complex UI logic
- Mock external dependencies appropriately

## Specific Implementation Tasks

### Step 1: Environment Setup

Install required dependencies:

```bash
pnpm add @prisma/client@6.14.0 prisma@6.14.0
pnpm add pgvector
pnpm add @neondatabase/serverless
pnpm add winston pino pino-pretty
pnpm add dotenv zod
pnpm add -D @types/node
```

Create environment configuration files:

- `.env.local` for development
- `.env.production` for production

### Step 2: Database Schema Design

Update `prisma/schema.prisma` with comprehensive schema including:

- User management (User, Account, Session)
- Conversation system (Conversation, Message)
- Knowledge & topics (Topic, ConversationTopic)
- Spiritual journey (UserInsight, SpiritualProfile)
- Subscription & billing (Subscription, UsageRecord)
- User preferences (UserPreference)
- All necessary enums

### Step 3: Core Infrastructure

Create essential utility files:

- `lib/db/client.ts` - Prisma client configuration
- `lib/db/vector.ts` - Vector search utilities
- `lib/logger.ts` - Logging configuration
- `lib/config.ts` - Environment validation
- `lib/errors.ts` - Error handling classes
- `types/database.ts` - Prisma type extensions

### Step 4: Database Migrations

Create migration script:

- `scripts/migrate.ts` - Database migration automation
- Update `package.json` scripts for database operations

## Critical Success Factors

### Must-Have Features

- PostgreSQL database connected successfully
- PGVector extension enabled
- All Prisma models generated without errors
- Database migrations executed successfully
- Environment variables properly configured
- Logger functioning in both dev and prod modes

### Performance Targets

- Database connection establishment < 500ms
- Prisma client initialization < 200ms
- Migration execution without timeout
- Proper indexing for all frequently queried fields

### Error Scenarios to Handle

- Database connectivity issues
- Missing environment variables
- Migration failures
- Invalid schema definitions
- PGVector extension installation issues

## Quality Assurance Checklist

### Before Implementation

- [ ] Read and understand the complete phase requirements
- [ ] Review the project overview and architecture
- [ ] Understand the database design requirements
- [ ] Identify potential integration points

### During Implementation

- [ ] Write type-safe TypeScript code
- [ ] Follow established patterns and conventions
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Test database connections and migrations
- [ ] Verify PGVector functionality

### After Implementation

- [ ] Run `pnpm lint` and fix all issues
- [ ] Run `pnpm build` and fix all build errors
- [ ] Test all database operations
- [ ] Verify environment variable loading
- [ ] Check Prisma client generation
- [ ] Test vector operations
- [ ] Review security implications

## Example Implementation Flow

### 1. Analysis Phase (10 minutes)

- Review the phase requirements thoroughly
- Understand the database schema needs
- Plan the implementation approach
- Identify potential challenges

### 2. Setup Phase (15 minutes)

- Install required dependencies
- Create environment files
- Set up basic file structure
- Configure Prisma

### 3. Core Development (60-90 minutes)

- Create comprehensive Prisma schema
- Implement database utilities
- Set up logging and error handling
- Create migration scripts
- Test database connectivity

### 4. Integration Phase (20 minutes)

- Run database migrations
- Test PGVector functionality
- Verify all utilities work correctly
- Check environment configuration

### 5. Quality Assurance (15 minutes)

- Run linting and fix issues
- Run build and fix any errors
- Test database operations
- Final code review

## Common Pitfalls to Avoid

### Technical Issues

- Not properly configuring PGVector extension
- Missing database indexes for performance
- Incorrect TypeScript types for Prisma
- Poor error handling for database operations
- Inadequate logging configuration

### Integration Issues

- Environment variables not loaded correctly
- Database connection pool issues
- Migration script failures
- Prisma client generation problems
- Vector search setup issues

### Security Issues

- Exposed database credentials
- Missing input validation
- Improper error message exposure
- Inadequate connection security
- Poor secret management

## Resources and References

### Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PGVector Documentation](https://github.com/pgvector/pgvector)
- [Zod Validation](https://zod.dev/)
- [Winston Logging](https://github.com/winstonjs/winston)

### Project-Specific Context

- This is the foundation phase - all subsequent phases depend on this
- Database schema must support complex spiritual journey tracking
- Vector embeddings will be used for semantic search in later phases
- Subscription system requires robust usage tracking
- Multilingual support requires flexible content structure

## Success Metrics

### Technical Metrics

- All linting passes without errors
- Build completes successfully
- Database migrations run without issues
- PGVector extension working correctly
- All utilities properly tested

### Functional Metrics

- Database schema supports all planned features
- Environment configuration is secure and complete
- Error handling provides useful information
- Logging captures necessary information
- Performance meets requirements

## Final Notes

Remember that this phase is the foundation for the entire application. Your implementation should:

1. **Prioritize Reliability**: Every component must work consistently
2. **Plan for Scale**: Design for growth from the beginning
3. **Security First**: Never compromise on security requirements
4. **Document Decisions**: Include clear comments and documentation
5. **Test Thoroughly**: Verify every component works as expected

This foundation will support a sophisticated AI-powered spiritual guidance platform, so attention to detail and robust implementation are crucial for success.

Good luck with the implementation! 🔮✨
