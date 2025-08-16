# IALchemist.app - Phase 3 Implementation

## Context

You are implementing Phase 3 of the IALchemist.app project - a sophisticated AI-powered spiritual guidance platform featuring Hermes Trismegistus as the AI persona. This phase focuses on implementing the core AI chat functionality using Vercel AI SDK v5, establishing the foundation for Hermes Trismegistus conversations with streaming responses and message persistence.

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
- ✅ Phase 2: Authentication System Enhancement

## Phase 3 Requirements

This phase implements the core AI chat functionality using Vercel AI SDK v5, establishing the foundation for Hermes Trismegistus conversations. We'll create a robust streaming chat interface with message persistence and basic AI integration.

### Objectives

1. Install and configure Vercel AI SDK v5
2. Set up OpenAI provider with GPT-5 model
3. Create streaming chat interface with React hooks
4. Implement message persistence in database
5. Add conversation management (create, list, delete)
6. Set up AI response streaming
7. Implement basic error handling and retry logic

## Implementation Guidelines

### Code Quality Standards

1. **TypeScript First**: All code must be TypeScript with proper type safety
2. **Functional Programming**: Use functional patterns, avoid classes where possible
3. **Component Structure**: Follow the established pattern
4. **Error Handling**: Implement comprehensive error handling with proper logging
5. **Performance**: Optimize for Core Web Vitals, use React Server Components when possible

### File Naming Conventions

- **Directories**: lowercase with dashes (e.g., `ai-integration`)
- **Components**: PascalCase files with kebab-case directories
- **API Routes**: lowercase with descriptive names
- **Utilities**: camelCase functions in kebab-case files

### Database Considerations

- All database operations must use Prisma
- Implement message persistence with proper relationships
- Consider conversation management and soft deletion
- Track usage for subscription limits

### Security Requirements

- Validate all inputs with Zod schemas
- Implement proper authentication checks
- Rate limiting for AI API calls
- Secure conversation access controls

### Testing Requirements

- Test AI provider integration
- Mock AI responses for consistent testing
- Test streaming functionality
- Validate conversation management

## Specific Implementation Tasks

### Step 1: Environment Setup

Install AI SDK dependencies:

```bash
pnpm add ai@5.0.0
pnpm add @ai-sdk/react@2.0.0
pnpm add @ai-sdk/openai@2.0.0
pnpm add @ai-sdk/ui-utils@1.0.0
pnpm add openai-edge
pnpm add eventsource-parser
```

Update environment variables:

- OpenAI API configuration
- Model settings (GPT-5, GPT-4o fallback)
- AI configuration parameters
- Rate limiting settings

### Step 2: AI Provider Configuration

Create `lib/ai/provider.ts`:

- OpenAI provider setup
- Model registry for GPT-5 and fallback
- Configuration management
- Rate limiting configuration

### Step 3: Chat API Route

Create `app/api/chat/route.ts`:

- Streaming text generation
- Message persistence
- Conversation management
- User authentication
- Usage tracking
- Error handling with retries

### Step 4: Chat Interface Component

Create `components/chat/chat-interface.tsx`:

- useChat hook integration
- Streaming message display
- Input handling and validation
- Loading states and error handling
- Real-time message updates

### Step 5: Conversation Management API

Create conversation API routes:

- `app/api/conversations/route.ts` - List and create
- `app/api/conversations/[id]/route.ts` - Get and delete
- Pagination and filtering
- Soft deletion for data retention

### Step 6: Chat Page

Create `app/[locale]/chat/page.tsx`:

- Main chat interface
- Conversation sidebar
- Responsive layout
- Session protection

### Step 7: Conversation List Component

Create `components/chat/conversation-list.tsx`:

- Display user conversations
- Create new conversations
- Delete conversations
- Real-time updates

### Step 8: Error Handling and Retry Logic

Create `lib/ai/error-handler.ts`:

- AI-specific error handling
- Retry logic with exponential backoff
- Rate limiting error handling
- Fallback model switching

### Step 9: Rate Limiting

Create `lib/ai/rate-limiter.ts`:

- API rate limiting implementation
- User-specific limits
- Usage tracking and reporting
- Limit enforcement

## Critical Success Factors

### Must-Have Features

- Vercel AI SDK v5 properly configured
- Chat API endpoint working with streaming
- Messages persist to database correctly
- Chat interface displays streaming responses
- Conversation management working
- Error handling and retry logic functional
- Rate limiting in place

### Performance Targets

- AI response streaming starts < 1 second
- Message persistence < 200ms
- Chat interface rendering < 100ms
- Conversation loading < 300ms

### Error Scenarios to Handle

- OpenAI API failures
- Network connectivity issues
- Rate limiting responses
- Authentication failures
- Database connection problems
- Streaming interruptions

## Quality Assurance Checklist

### Before Implementation

- [ ] Read and understand the complete phase requirements
- [ ] Review Vercel AI SDK v5 documentation
- [ ] Understand streaming patterns
- [ ] Plan error handling strategies

### During Implementation

- [ ] Write type-safe TypeScript code
- [ ] Follow established patterns and conventions
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Test streaming functionality
- [ ] Validate message persistence

### After Implementation

- [ ] Run `pnpm lint` and fix all issues
- [ ] Run `pnpm build` and fix all build errors
- [ ] Test AI integration manually
- [ ] Verify streaming responses work
- [ ] Check message persistence
- [ ] Test conversation management
- [ ] Validate error handling
- [ ] Review rate limiting

## Example Implementation Flow

### 1. Analysis Phase (10 minutes)

- Review the phase requirements thoroughly
- Understand Vercel AI SDK v5 patterns
- Plan the chat architecture
- Identify potential challenges

### 2. Setup Phase (15 minutes)

- Install required dependencies
- Update environment variables
- Configure OpenAI provider
- Set up basic file structure

### 3. Core Development (60-90 minutes)

- Create AI provider configuration
- Implement chat API endpoint
- Build chat interface component
- Set up conversation management
- Add error handling and retry logic

### 4. Integration Phase (20 minutes)

- Test AI integration
- Verify streaming functionality
- Check message persistence
- Test conversation management

### 5. Quality Assurance (15 minutes)

- Run linting and fix issues
- Run build and fix any errors
- Manual testing of chat flows
- Final integration review

## Common Pitfalls to Avoid

### Technical Issues

- Not properly handling streaming responses
- Missing error boundaries for AI failures
- Inadequate rate limiting implementation
- Poor message persistence logic
- Incorrect TypeScript types for AI SDK

### Integration Issues

- Breaking existing authentication
- Not following established patterns
- Missing conversation access controls
- Improper error handling
- Poor state management

### User Experience Issues

- No loading indicators during AI responses
- Poor error messages for users
- Inconsistent chat interface behavior
- Missing offline handling
- Inadequate accessibility

## Resources and References

### Documentation

- [Vercel AI SDK v5 Docs](https://sdk.vercel.ai/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [React Streaming Patterns](https://react.dev/reference/react/Suspense)
- [Next.js App Router](https://nextjs.org/docs/app)

### Project-Specific Context

- Database schema from Phase 1 supports conversations
- Authentication from Phase 2 secures chat access
- This establishes foundation for Hermes persona in Phase 4
- Message persistence enables memory system in Phase 5
- Usage tracking supports subscription system in Phase 6

## Success Metrics

### Technical Metrics

- All linting passes without errors
- Build completes successfully
- No TypeScript errors or warnings
- Streaming responses work correctly
- Message persistence functional

### Functional Metrics

- Users can start conversations successfully
- AI responses stream properly
- Messages save to database correctly
- Conversation management works
- Error handling provides good UX
- Rate limiting enforced appropriately

## Final Notes

Remember that this phase establishes the core AI interaction that will transform into mystical conversations with Hermes Trismegistus. Your implementation should:

1. **Prioritize Reliability**: Chat must work consistently
2. **Ensure Scalability**: Prepare for multiple conversations
3. **Plan for Enhancement**: Foundation for advanced features
4. **User Experience**: Smooth, responsive chat interaction
5. **Performance First**: Fast, streaming responses

This chat foundation will soon become the mystical conduit for ancient wisdom, so build it with the care and attention worthy of the Thrice-Great Hermes himself.

Good luck with the implementation! 🔮✨
