# IALchemist.app - Phase 2 Implementation

## Context

You are implementing Phase 2 of the IALchemist.app project - a sophisticated AI-powered spiritual guidance platform featuring Hermes Trismegistus as the AI persona. This phase focuses on enhancing the existing authentication system with comprehensive user management, secure registration, email verification, password reset, and session management using NextAuth.js v5.

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

- ✅ Phase 1: Core Infrastructure & Database Setup

## Phase 2 Requirements

This phase enhances the existing authentication system with comprehensive user management, secure registration, email verification, password reset, and session management using NextAuth.js v5 with the database schema from Phase 1.

### Objectives

1. Enhance NextAuth configuration with database adapter
2. Implement secure user registration with email verification
3. Add password reset functionality
4. Create protected route middleware
5. Implement session management
6. Add OAuth providers (Google, GitHub)
7. Create user profile management

## Implementation Guidelines

### Code Quality Standards

1. **TypeScript First**: All code must be TypeScript with proper type safety
2. **Functional Programming**: Use functional patterns, avoid classes where possible
3. **Component Structure**: Follow the established pattern
4. **Error Handling**: Implement comprehensive error handling with proper logging
5. **Performance**: Optimize for Core Web Vitals, use React Server Components when possible

### File Naming Conventions

- **Directories**: lowercase with dashes (e.g., `auth-verification`)
- **Components**: PascalCase files with kebab-case directories
- **API Routes**: lowercase with descriptive names
- **Utilities**: camelCase functions in kebab-case files

### Database Considerations

- All database operations must use Prisma
- Use transactions for multi-table operations
- Implement proper user creation flow with related records
- Consider data retention and privacy requirements

### Security Requirements

- Hash passwords with bcryptjs (12 rounds minimum)
- Validate all inputs with Zod schemas
- Implement JWT token verification
- Use secure session management
- Protect against common vulnerabilities

### Testing Requirements

- Test authentication flows thoroughly
- Mock external dependencies (OAuth providers)
- Test email verification process
- Validate security measures

## Specific Implementation Tasks

### Step 1: Environment Setup

Install additional dependencies:

```bash
pnpm add @auth/prisma-adapter
pnpm add bcryptjs jsonwebtoken
pnpm add -D @types/bcryptjs @types/jsonwebtoken
pnpm add uuid
pnpm add -D @types/uuid
```

Update environment variables:

- Authentication secrets
- OAuth provider credentials
- Email service configuration
- JWT secrets

### Step 2: Enhanced Authentication Configuration

Update `auth.ts` with:

- PrismaAdapter integration
- Credentials provider with secure password handling
- OAuth providers (Google, GitHub)
- JWT and session callbacks
- User creation events
- Email verification requirements

### Step 3: Registration API Route

Create `app/api/auth/register/route.ts`:

- Secure user registration
- Password hashing with bcryptjs
- Email verification token generation
- User profile creation (spiritual profile, preferences)
- Input validation with Zod
- Comprehensive error handling

### Step 4: Email Verification System

Create email verification components:

- `lib/auth/tokens.ts` - JWT token management
- `lib/email/verification.ts` - Email sending utilities
- `app/api/auth/verify/route.ts` - Verification endpoint
- Email templates for verification and welcome

### Step 5: Database Schema Updates

Add verification token model to Prisma schema:

- VerificationToken model
- TokenType enum
- Proper relationships and indexes

### Step 6: Middleware for Protected Routes

Update `middleware.ts`:

- Route protection logic
- Session redirection
- Public/protected path definitions
- Internationalization integration

### Step 7: Session Provider Setup

Update `app/[locale]/layout.tsx`:

- SessionProvider wrapper
- NextIntlClientProvider integration
- Proper session handling

### Step 8: Authentication Hooks

Create `hooks/use-auth.ts`:

- Client-side authentication utilities
- Session management
- Profile updates
- Redirect helpers

## Critical Success Factors

### Must-Have Features

- User registration works with email verification
- Email verification completes successfully
- Sign in with credentials works
- Protected routes redirect unauthenticated users
- Session management works correctly
- OAuth providers configured properly

### Performance Targets

- Registration API response < 500ms
- Email sending < 2 seconds
- Authentication checks < 100ms
- Session loading < 200ms

### Error Scenarios to Handle

- Invalid credentials
- Unverified email attempts
- Expired verification tokens
- OAuth provider failures
- Database connection issues
- Email service outages

## Quality Assurance Checklist

### Before Implementation

- [ ] Read and understand the complete phase requirements
- [ ] Review Phase 1 implementation for context
- [ ] Understand NextAuth.js v5 patterns
- [ ] Plan OAuth provider setup

### During Implementation

- [ ] Write type-safe TypeScript code
- [ ] Follow established patterns and conventions
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Test authentication flows
- [ ] Validate security measures

### After Implementation

- [ ] Run `pnpm lint` and fix all issues
- [ ] Run `pnpm build` and fix all build errors
- [ ] Test user registration manually
- [ ] Verify email verification flow
- [ ] Test sign in with credentials
- [ ] Check protected route access
- [ ] Validate OAuth provider setup
- [ ] Review security implications

## Example Implementation Flow

### 1. Analysis Phase (10 minutes)

- Review the phase requirements thoroughly
- Understand NextAuth.js v5 integration
- Plan the authentication flow
- Identify potential challenges

### 2. Setup Phase (15 minutes)

- Install required dependencies
- Update environment variables
- Configure OAuth applications
- Set up email service

### 3. Core Development (60-90 minutes)

- Update auth.ts configuration
- Create registration API endpoint
- Implement email verification system
- Set up middleware protection
- Create authentication hooks

### 4. Integration Phase (20 minutes)

- Test registration flow
- Verify email verification
- Test authentication flows
- Check protected routes

### 5. Quality Assurance (15 minutes)

- Run linting and fix issues
- Run build and fix any errors
- Manual testing of auth flows
- Final security review

## Common Pitfalls to Avoid

### Technical Issues

- Not properly configuring PrismaAdapter
- Missing error handling for edge cases
- Improper JWT token validation
- Inadequate password security
- Poor session management

### Integration Issues

- Breaking existing functionality
- OAuth provider misconfiguration
- Email service integration issues
- Middleware conflicts
- Database relationship problems

### Security Issues

- Weak password hashing
- Exposed sensitive information
- Missing input validation
- Inadequate session security
- Poor token management

## Resources and References

### Documentation

- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma)
- [Resend Documentation](https://resend.com/docs)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [JWT Documentation](https://jwt.io/)

### Project-Specific Context

- Database schema from Phase 1 supports user management
- Spiritual profiles and preferences created automatically
- Email verification required for mystical experience
- OAuth providers enhance user experience
- Session management crucial for spiritual journey tracking

## Success Metrics

### Technical Metrics

- All linting passes without errors
- Build completes successfully
- No TypeScript errors or warnings
- Authentication flows work correctly
- Email verification functional

### Functional Metrics

- Users can register successfully
- Email verification works end-to-end
- Sign in flows work for all providers
- Protected routes properly secured
- Session management reliable
- User profiles created correctly

## Final Notes

Remember that this phase builds the trust foundation for users beginning their spiritual journey. Your implementation should:

1. **Prioritize Security**: Never compromise on authentication security
2. **Ensure Reliability**: Users must trust the system with their journey
3. **Plan for Scale**: Authentication must handle growth
4. **User Experience**: Make onboarding smooth and mystical
5. **Privacy First**: Respect user data and spiritual privacy

This authentication system will welcome seekers into their mystical journey with Hermes Trismegistus, so create an experience worthy of ancient wisdom and modern security standards.

Good luck with the implementation! 🔮✨
