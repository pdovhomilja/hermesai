# Phase Implementation Prompt Example

## Overview

This document provides a template prompt for effectively communicating with AI coders when implementing any phase of the IALchemist.app project. Use this as a guide to ensure consistent, high-quality implementation.

## Standard Phase Implementation Prompt Template

```
# IALchemist.app - Phase [X] Implementation

## Context
You are implementing Phase [X] of the IALchemist.app project - a sophisticated AI-powered spiritual guidance platform featuring Hermes Trismegistus as the AI persona. This phase focuses on [PHASE_DESCRIPTION].

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
- [List completed phases based on current status]

## Phase [X] Requirements
[Paste the specific phase requirements from the phase file here]

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
[Detail environment variables, dependencies, and configuration needed]

### Step 2: Database Changes
[Detail Prisma schema changes, migrations, and data seeding if needed]

### Step 3: Core Implementation
[Break down the main implementation into logical steps]

### Step 4: API Development
[Detail API endpoints, their schemas, and business logic]

### Step 5: Frontend Implementation
[Detail UI components, state management, and user interactions]

### Step 6: Integration & Testing
[Detail how components integrate and testing approach]

## Critical Success Factors

### Must-Have Features
- [List essential features that must work perfectly]

### Performance Targets
- API responses < 200ms (excluding AI generation)
- Page loads < 2 seconds
- Core Web Vitals in green
- Mobile-first responsive design

### Error Scenarios to Handle
- Network failures
- Database connectivity issues
- AI API rate limits
- Invalid user inputs
- Authentication failures

## Quality Assurance Checklist

### Before Implementation
- [ ] Read and understand the complete phase requirements
- [ ] Review previous phases for context and dependencies
- [ ] Understand the overall architecture and patterns
- [ ] Identify potential integration points

### During Implementation
- [ ] Write type-safe TypeScript code
- [ ] Follow established patterns and conventions
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Write unit tests for new functionality
- [ ] Test edge cases and error scenarios

### After Implementation
- [ ] Run `pnpm lint` and fix all issues
- [ ] Run `pnpm build` and fix all build errors
- [ ] Test all new functionality manually
- [ ] Verify integration with existing features
- [ ] Check responsive design on mobile/desktop
- [ ] Validate accessibility requirements
- [ ] Review security implications

## Example Implementation Flow

### 1. Analysis Phase (10 minutes)
- Review the phase requirements thoroughly
- Identify dependencies on previous phases
- Plan the implementation approach
- Identify potential challenges

### 2. Setup Phase (15 minutes)
- Install required dependencies
- Update environment variables
- Create necessary database migrations
- Set up basic file structure

### 3. Core Development (60-90 minutes)
- Implement core functionality step by step
- Write tests as you go
- Handle errors appropriately
- Follow TypeScript best practices

### 4. Integration Phase (20 minutes)
- Integrate with existing systems
- Test API endpoints
- Verify UI components work correctly
- Check responsive design

### 5. Quality Assurance (15 minutes)
- Run linting and fix issues
- Run build and fix any errors
- Manual testing of key functionality
- Final code review

## Common Pitfalls to Avoid

### Technical Issues
- Forgetting to handle loading states
- Not implementing proper error boundaries
- Missing TypeScript types or using `any`
- Ignoring accessibility requirements
- Poor performance optimization

### Integration Issues
- Breaking existing functionality
- Not following established patterns
- Missing authentication checks
- Incorrect database relationships
- Improper state management

### User Experience Issues
- Poor mobile responsiveness
- Confusing navigation or UI
- Missing loading indicators
- Unclear error messages
- Inconsistent styling

## Resources and References

### Documentation
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Vercel AI SDK v5 Docs](https://sdk.vercel.ai/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js v5 Docs](https://authjs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Project-Specific Files
- `/lib/ai/personas/hermes-core.ts` - Core AI persona
- `/styles/mystical-theme.css` - Design system
- `/lib/db/client.ts` - Database client
- `/auth.ts` - Authentication configuration
- `/middleware.ts` - Request middleware

## Success Metrics

### Technical Metrics
- All linting passes without errors
- Build completes successfully
- Test coverage > 80% for new code
- No TypeScript errors or warnings
- Performance benchmarks met

### Functional Metrics
- All required features implemented
- Error handling works correctly
- User experience is smooth and intuitive
- Integration with existing features is seamless
- Security requirements are met

## Final Notes

Remember that this phase is part of a larger, interconnected system. Your implementation should:

1. **Maintain Consistency**: Follow the established patterns and conventions
2. **Think Holistically**: Consider how your changes affect the entire system
3. **Plan for Scale**: Implement solutions that can handle growth
4. **Prioritize Security**: Never compromise on security requirements
5. **Focus on UX**: Ensure the user experience remains magical and intuitive

Good luck with the implementation! 🔮✨
```

## Usage Instructions

### How to Use This Template

1. **Copy the template** above and replace the bracketed placeholders with specific information:

   - `[X]` → Actual phase number (1, 2, 3, etc.)
   - `[PHASE_DESCRIPTION]` → Brief description of what the phase accomplishes
   - `[List completed phases...]` → Actual list of completed phases
   - `[Paste the specific phase requirements...]` → Copy-paste the requirements from the specific phase file

2. **Customize the implementation tasks** based on the specific phase requirements

3. **Adjust the timeline** based on phase complexity

4. **Add phase-specific considerations** that might not be covered in the general template

### Example Customization for Phase 1

```
# IALchemist.app - Phase 1 Implementation

## Context
You are implementing Phase 1 of the IALchemist.app project - a sophisticated AI-powered spiritual guidance platform featuring Hermes Trismegistus as the AI persona. This phase focuses on establishing the core infrastructure foundation including PostgreSQL with PGVector, Prisma ORM, and essential utility functions.

## Current Implementation Status
Previous phases completed:
- None (this is the foundation phase)

## Phase 1 Requirements
This phase establishes the foundational infrastructure for the IALchemist.app project...
[Continue with specific Phase 1 requirements]
```

### Key Benefits of Using This Template

1. **Consistency**: Ensures all AI coders receive the same level of context and guidance
2. **Completeness**: Covers all critical aspects of implementation
3. **Quality Assurance**: Built-in checklist ensures high-quality deliverables
4. **Efficiency**: Reduces back-and-forth communication with clear expectations
5. **Success Metrics**: Provides measurable criteria for completion

### Adaptation for Different AI Systems

- **For GPT-4/GPT-5**: Use the full template with detailed context
- **For Specialized Models**: Focus on the specific technical sections relevant to the model's strengths
- **For Code-Only Models**: Emphasize the implementation tasks and code quality sections
- **For Review Models**: Highlight the quality assurance checklist and success metrics

This template ensures that regardless of which AI coder implements a phase, the quality and consistency remain high across the entire project.
