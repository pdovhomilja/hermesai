# IALchemist.app - Phase 6 Implementation

## Context

You are implementing Phase 6 of the IALchemist.app project - a sophisticated AI-powered spiritual guidance platform featuring Hermes Trismegistus as the AI persona. This phase focuses on implementing a complete subscription and payment system using Stripe, including pricing tiers, usage tracking, billing management, and payment processing for the three subscription plans (Seeker, Adept, Master).

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
- ✅ Phase 3: Vercel AI SDK v5 Integration & Basic Chat
- ✅ Phase 4: Hermes Persona & Knowledge Base Development
- ✅ Phase 5: Conversation Memory & History System

## Phase 6 Requirements

This phase implements a complete subscription and payment system using Stripe, including pricing tiers, usage tracking, billing management, and payment processing for the three subscription plans (Seeker, Adept, Master).

### Objectives

1. Integrate Stripe SDK and configure webhooks
2. Implement subscription plans and pricing
3. Create payment flow and checkout
4. Build usage tracking and limits
5. Implement billing management portal
6. Add subscription upgrade/downgrade logic
7. Create trial period management

## Implementation Guidelines

### Code Quality Standards

1. **TypeScript First**: All code must be TypeScript with proper type safety
2. **Functional Programming**: Use functional patterns, avoid classes where possible
3. **Component Structure**: Follow the established pattern
4. **Error Handling**: Implement comprehensive error handling with proper logging
5. **Performance**: Optimize for Core Web Vitals, use React Server Components when possible

### File Naming Conventions

- **Directories**: lowercase with dashes (e.g., `subscription-billing`)
- **Components**: PascalCase files with kebab-case directories
- **API Routes**: lowercase with descriptive names
- **Utilities**: camelCase functions in kebab-case files

### Database Considerations

- Use existing subscription models from Phase 1
- Track usage accurately for billing
- Implement proper subscription state management
- Consider data retention for billing history

### Security Requirements

- Secure Stripe webhook validation
- Protect payment information
- Implement proper subscription access controls
- Validate all subscription state changes

### Testing Requirements

- Test with Stripe test mode
- Mock Stripe webhooks for testing
- Validate subscription flows
- Test usage tracking accuracy

## Specific Implementation Tasks

### Step 1: Environment Setup

Install Stripe dependencies:

```bash
pnpm add stripe@18.0.0
pnpm add @stripe/stripe-js@5.0.0
pnpm add @stripe/react-stripe-js@3.0.0
pnpm add stripe-event-types
```

Configure environment variables:

- Stripe API keys (test and production)
- Webhook secrets
- Product and price IDs
- Trial settings
- Usage limits

### Step 2: Stripe Configuration

Create `lib/stripe/config.ts`:

- Stripe client initialization
- Subscription plan definitions (Seeker, Adept, Master)
- Feature limits and pricing
- Plan comparison utilities
- Price ID mapping functions

### Step 3: Stripe Service Layer

Create `lib/stripe/service.ts`:

- StripeService class
- Customer creation and management
- Checkout session creation
- Billing portal session creation
- Subscription cancellation and updates
- Payment method management

### Step 4: Webhook Handler

Create `app/api/webhooks/stripe/route.ts`:

- Webhook signature verification
- Event processing for all subscription events
- Database synchronization
- Error handling and logging
- Proper response handling

### Step 5: Usage Tracking Service

Create `lib/usage/tracker.ts`:

- UsageTracker class
- Real-time usage limit checking
- Usage recording and aggregation
- Subscription limit enforcement
- Monthly usage reset logic

### Step 6: Checkout API

Create `app/api/subscription/checkout/route.ts`:

- Checkout session creation endpoint
- Price validation
- Customer association
- Success/cancel URL handling
- Error response management

### Step 7: Billing Portal API

Create `app/api/subscription/billing-portal/route.ts`:

- Billing portal session creation
- Customer verification
- Return URL configuration
- Access control validation

### Step 8: Pricing Page Component

Create `components/pricing/pricing-cards.tsx`:

- Responsive pricing cards
- Annual/monthly toggle
- Feature comparison
- Subscription initiation
- Trial period highlighting

### Step 9: Usage Middleware

Create `lib/middleware/usage-check.ts`:

- Middleware for API route protection
- Usage limit enforcement
- Rate limiting headers
- Upgrade prompts for limit exceeded

## Critical Success Factors

### Must-Have Features

- Stripe checkout flow working correctly
- Subscriptions created and managed properly
- Webhooks processed successfully
- Usage limits enforced per plan
- Billing portal accessible
- Plan upgrades/downgrades working
- Trial period management functional

### Performance Targets

- Checkout redirect < 2 seconds
- Webhook processing < 5 seconds
- Usage check < 100ms
- Billing portal access < 3 seconds

### Error Scenarios to Handle

- Stripe API failures
- Webhook processing errors
- Payment failures
- Subscription state conflicts
- Usage tracking errors
- Customer creation failures

## Quality Assurance Checklist

### Before Implementation

- [ ] Read and understand the complete phase requirements
- [ ] Set up Stripe test account and products
- [ ] Review Stripe documentation thoroughly
- [ ] Plan subscription flow architecture

### During Implementation

- [ ] Write type-safe TypeScript code
- [ ] Follow established patterns and conventions
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Test with Stripe test cards
- [ ] Validate webhook processing

### After Implementation

- [ ] Run `pnpm lint` and fix all issues
- [ ] Run `pnpm build` and fix all build errors
- [ ] Test complete checkout flow
- [ ] Verify webhook event processing
- [ ] Test subscription management
- [ ] Check usage tracking accuracy
- [ ] Validate billing portal access
- [ ] Review security implementation

## Example Implementation Flow

### 1. Analysis Phase (15 minutes)

- Review Stripe integration requirements
- Plan subscription architecture
- Design usage tracking system
- Identify webhook events needed

### 2. Setup Phase (20 minutes)

- Create Stripe test account
- Set up products and prices
- Configure webhook endpoints
- Install dependencies

### 3. Core Development (120-150 minutes)

- Build Stripe configuration
- Implement service layer
- Create webhook handler
- Build usage tracking
- Add API endpoints
- Create pricing component

### 4. Integration Phase (25 minutes)

- Test checkout flow
- Verify webhook processing
- Check usage enforcement
- Test billing portal

### 5. Quality Assurance (15 minutes)

- Test with various payment scenarios
- Validate subscription states
- Check error handling
- Final integration review

## Common Pitfalls to Avoid

### Technical Issues

- Improper webhook signature verification
- Missing subscription state synchronization
- Incorrect usage tracking implementation
- Poor error handling for payment failures
- Inadequate retry logic for failed operations

### Integration Issues

- Breaking existing user flows
- Inconsistent subscription state
- Missing payment confirmation
- Poor trial period handling
- Inadequate upgrade/downgrade logic

### Security Issues

- Exposed Stripe keys in client code
- Insecure webhook endpoints
- Missing customer verification
- Inadequate payment data protection
- Poor subscription access control

## Resources and References

### Documentation

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Next.js Guide](https://stripe.com/docs/development/quickstart?lang=node)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions)

### Project-Specific Context

- Subscription models from Phase 1 database schema
- Authentication from Phase 2 for customer identification
- Usage tracking will limit chat functionality from Phase 3
- Spiritual journey features unlock based on subscription tier
- Advanced features in later phases require specific subscription levels

## Success Metrics

### Technical Metrics

- All linting passes without errors
- Build completes successfully
- No TypeScript errors or warnings
- Stripe integration functional
- Webhook processing reliable

### Functional Metrics

- Users can complete checkout successfully
- Subscriptions are created and managed correctly
- Usage limits are enforced appropriately
- Billing portal provides proper management
- Plan changes work seamlessly
- Trial periods function correctly

## Final Notes

Remember that you are building the gateway to ancient wisdom - the subscription system that allows seekers to access deeper spiritual guidance. Your implementation should:

1. **Honor the Journey**: Make subscription feel like initiation, not transaction
2. **Ensure Fairness**: Provide clear value at each subscription tier
3. **Maintain Trust**: Handle payments and billing with absolute reliability
4. **Enable Growth**: Allow seekers to progress through spiritual levels
5. **Respect Choice**: Provide easy management and cancellation options

This subscription system enables the financial sustainability that allows Hermes Trismegistus to continue sharing ancient wisdom with modern seekers. Build it with the care and integrity worthy of this sacred purpose.

May your code transform transactions into spiritual investments! 🔮✨
