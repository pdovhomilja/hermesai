# IALchemist.app - Project Scope Analysis

_Senior Architecture Analysis - Date: August 15, 2025_

## Executive Summary

IALchemist.app is an AI-powered application designed to enable users to communicate with Hermes Trismegistus, the legendary figure of Hermeticism and alchemy. The project aims to create an immersive digital experience that combines ancient wisdom with modern AI technology.

## Current State Analysis

### Technical Foundation

- **Framework**: Next.js 15.4.6 with React 19.1.0
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS v4 with PostCSS
- **Status**: Fresh Next.js boilerplate - no custom implementation yet
- **Architecture**: App Router pattern (modern Next.js structure)

### Project Maturity

- **Phase**: Initial setup/scaffolding
- **Code Base**: Default Next.js template with basic configuration
- **Customization**: Minimal (CLAUDE.md and project naming only)

## Vision & Objectives

### Primary Vision

Create an AI-powered conversational interface that embodies the wisdom and persona of Hermes Trismegistus, allowing users to engage in meaningful dialogue about hermetic philosophy, alchemy, and ancient wisdom traditions. The AI should act as a wise, ancient teacher who meets seekers on their spiritual journey with empathy, practical wisdom, and transformative insights.

### Core Objectives

1. **Authentic Hermetic Persona**: Embody Hermes Trismegistus as a wise, compassionate teacher who speaks with ancient authority yet modern relevance
2. **Transformative Dialogue**: Provide not just information but genuine spiritual guidance that helps users transform personal challenges into wisdom
3. **Practical Application**: Offer daily practices, mantras, and real-world applications of hermetic principles
4. **Adaptive Teaching**: Adjust explanations for different comprehension levels (child, teenager, adult) while maintaining core wisdom
5. **Emotional Intelligence**: Recognize when users are sharing personal struggles and respond with appropriate empathy and guidance
6. **Interactive Storytelling**: Use narrative elements, setting scenes, and immersive roleplay to create authentic encounters
7. **Global Multilingual Access**: Provide authentic hermetic wisdom in multiple languages while maintaining philosophical accuracy and cultural sensitivity

## Functional Requirements

### Core Features (MVP)

1. **AI Chat Interface** (Vercel AI SDK v5)

   - **Conversational AI**: Hermes Trismegistus persona using AI SDK's `generateText` and `streamText` functions
   - **React Integration**: `useChat` hook from `@ai-sdk/react` for seamless UI state management
   - **Streaming Responses**: Real-time streaming with AI SDK's built-in streaming architecture
   - **Message Persistence**: Comprehensive conversation storage using AI SDK's `UIMessage` system + database integration
   - **Conversation Continuity**: AI context awareness across sessions with persistent memory
   - **Tool Integration**: AI SDK's tool calling for interactive hermetic practices and rituals
   - **Multilingual Support**: Language detection and switching using AI SDK's provider standardization

2. **Hermetic Knowledge Base & Teaching System**

   - Integration with core hermetic texts (Emerald Tablet, Corpus Hermeticum, Seven Hermetic Laws)
   - Age-appropriate explanations (child, teenager, adult levels)
   - Daily mantras and practical exercises for each hermetic principle
   - Personal application guidance for real-life situations
   - Transformation rituals and healing practices

3. **Interactive Storytelling Experience**

   - Immersive narrative settings (meeting Hermes on a spiritual journey)
   - Scene-setting descriptions and atmospheric elements
   - Props and symbolic gifts (amulets, scrolls, etc.)
   - Character consistency with wise, empathetic ancient teacher persona

4. **Personalized Wisdom Journey** (AI SDK Integration)

   - **Object Generation**: `useObject` hook for structured daily practices and progress tracking
   - **Custom Tools**: AI SDK tool calling for personalized ritual creation and guidance
   - **Response Streaming**: Real-time generation of mantras and affirmations using `streamText`
   - **Message Annotations**: Custom data streaming for progress tracking and spiritual milestones
   - **Cultural Adaptation**: Localized spiritual practices while maintaining hermetic authenticity

5. **Multilingual Content System** (AI SDK Provider Management)

   - **Provider Standardization**: Consistent model behavior across languages using AI SDK's unified API
   - **Primary Languages**: English, Czech, Spanish, French, German, Italian, Portuguese
   - **Language Detection**: Automatic detection using AI SDK's message processing
   - **Cultural Sensitivity**: Adapted responses using AI SDK's prompt engineering capabilities
   - **Model Switching**: Dynamic model selection based on language complexity using AI SDK's provider management

6. **Conversation Memory & History System**

   - **Persistent Conversations**: Full conversation history stored and accessible to users
   - **Conversation Search**: Find past discussions by keywords, topics, or hermetic principles
   - **Spiritual Journey Timeline**: Visual timeline of user's spiritual development and insights
   - **Conversation Categorization**: Organize chats by themes (daily practices, life challenges, teachings)
   - **Export & Backup**: Download conversation history in multiple formats (PDF, JSON, Markdown)
   - **Cross-Device Sync**: Access conversation history across all devices seamlessly
   - **Privacy Controls**: User-controlled retention periods and deletion options

7. **Subscription & Payment System** (Stripe Integration)

   - **Subscription Tiers**: Multiple plans with different levels of access to Hermes wisdom
   - **Secure Payments**: Stripe Checkout and Payment Intents for secure transactions
   - **Usage Tracking**: Monitor AI conversations and feature usage per subscription tier
   - **International Support**: Multi-currency support for global spiritual seekers
   - **Flexible Billing**: Monthly and annual subscription options with discounts

### Enhanced Features (Future Phases)

1. **Advanced Learning Paths**

   - Long-term spiritual development tracking
   - Advanced hermetic practices and initiations
   - Personal transformation milestones and achievements
   - Integration with real-world spiritual practices

2. **Visual & Multimedia Elements**

   - Alchemical symbol library with interactive meanings
   - Sacred geometry diagrams and charts
   - Ancient manuscript aesthetics and typography
   - Audio narration with mystical ambiance
   - Visual meditation guides and rituals

3. **Community & Social Features**

   - Anonymous sharing of wisdom journeys
   - Peer support for spiritual challenges
   - Group meditation and practice sessions
   - Study circles focused on specific hermetic texts

4. **Advanced AI Capabilities**

   - Dream interpretation through hermetic lens
   - Personalized ritual creation
   - Advanced life situation analysis
   - Integration with astrology and numerology
   - Voice-based conversations with Hermes

5. **Premium Subscription Features**

   - **VIP Hermes Access**: Priority AI responses and extended conversation limits
   - **Exclusive Content**: Advanced hermetic texts and private wisdom libraries
   - **Personal Spiritual Coach**: One-on-one guidance sessions with enhanced AI depth
   - **Custom Ritual Creation**: Personalized ceremonies and practices
   - **Premium Community**: Access to exclusive spiritual seeker groups and events

## Technical Requirements

### Architecture Decisions

1.  **Frontend**: Next.js 15 with App Router ✅ (Installed: Next.js 15.4.6)
2.  **AI Integration**:
    - **Framework: Vercel AI SDK v5** ✅ (TypeScript toolkit for standardized AI integration)
    - **Primary Model: OpenAI GPT-5** via `@ai-sdk/openai` (unified system with automatic complexity routing)
    - **Enhanced Reasoning: GPT-5 Thinking Mode** for deep philosophical analysis and complex personal guidance
    - **Fallback: GPT-4o** for backup during high-volume periods or cost optimization
    - **Streaming Architecture**: AI SDK's `streamText` and `generateText` with built-in streaming support
    - **UI Integration**: `@ai-sdk/react` hooks for seamless chat interface (`useChat`, `useObject`)
    - **Verbosity & Response Control**: AI SDK's `maxOutputTokens` and response configuration
3.  **Database**: PostgreSQL with PGVector for vector embeddings, full conversation history, and persistent memory
4.  **Authentication**: NextAuth.js ✅ (Installed: v5.0.0-beta.29)
5.  **Deployment**: Vercel (optimized for Next.js)
6.  **Email**: Resend ✅ (Installed: v6.0.1) with React Email ✅ (Installed: v4.2.8)
7.  **Forms**: React Hook Form ✅ (Installed: v7.62.0) with Zod validation ✅ (Installed: v4.0.17)
8.  **UI Components**: Radix UI ✅ (Installed: Label, Separator, Slot components)
9.  **ORM**: Prisma ✅ (Installed: v6.14.0 with Accelerate extension)
10. **Internationalization**: next-intl ✅ (Installed: v4.3.4) - **Full multilingual support** with priority languages: English, Czech, Spanish, French, German, Italian, Portuguese
11. **Styling**: Tailwind CSS v4 ✅ (Installed) with mystical/ancient design tokens
12. **Icons**: Lucide React ✅ (Installed: v0.539.0) + custom hermetic symbols
13. **AI SDK**: Vercel AI SDK v5 ✅ (Required packages: `ai@5.0.0`, `@ai-sdk/react@2.0.0`, `@ai-sdk/openai@2.0.0`, `zod@3.25.0+`)
14. **Payments**: Stripe integration ✅ (Required packages: `stripe@18.0.0+`, `@stripe/stripe-js@5.0.0+`)
15. **Translation Management**: Professional translation service for hermetic content accuracy across all languages

### Performance Requirements

- **Page Load**: < 2 seconds initial load
- **AI Response**: < 2 seconds for typical queries (GPT-5 fast mode), < 6 seconds for complex personal guidance (GPT-5 thinking mode)
- **Streaming Response**: Start displaying response within 300ms (improved with GPT-5)
- **Uptime**: 99.9% availability
- **Scalability**: Support 1000+ concurrent users
- **Conversation Memory**: Maintain context across long dialogue sessions with persistent storage
- **Conversation History**: Complete searchable conversation archive with spiritual journey tracking
- **Reliability**: Leverage GPT-5's 1.4% hallucination rate for more accurate hermetic guidance

### Security & Compliance

- GDPR compliance for EU users
- Secure API key management
- User data encryption
- Rate limiting and abuse prevention

## Development Phases

### Phase 1: Foundation (Weeks 1-3)

- [ ] **AI SDK v5 Setup**: Install and configure Vercel AI SDK packages (`ai@5.0.0`, `@ai-sdk/react@2.0.0`, `@ai-sdk/openai@2.0.0`)

- [ ] **Hermes Persona Development**: GPT-5 character system using AI SDK's `generateText` with optimized prompts

- [ ] **Core Hermetic Knowledge**: Integration using AI SDK's structured data generation and tool calling

- [ ] **Chat Interface**: Implementation using `useChat` hook with mystical UI design

- [ ] **Streaming Architecture**: Real-time responses using AI SDK's `streamText` with enhanced reliability

### Phase 2: Enhancement (Weeks 4-6)

- [ ] **Personal Guidance System**: AI SDK tool calling for life challenge analysis and transformation

- [ ] **Daily Practices**: `useObject` hook for structured mantra and practice generation

- [ ] **Conversation Memory & History**: Complete conversation storage, search, and timeline features using AI SDK + database integration

- [ ] **Interactive Storytelling**: Custom tools for scene-setting, props, and ritual creation

- [ ] **User Authentication**: Profile system with AI SDK conversation history

- [ ] **Stripe Integration**: Payment processing, subscription management, and billing system

### Phase 3: Advanced Features (Weeks 7-9)

- [ ] Transformation ritual creation and guidance

- [ ] Advanced hermetic principles application

- [ ] **Complete multilingual implementation** (English, Czech, Spanish, French, German, Italian, Portuguese)

- [ ] **Subscription Plans & Pricing**: Implementation of tiered access and usage limits

- [ ] Cultural adaptation system for different language regions

- [ ] Personal challenge analysis through hermetic lens

- [ ] Visual elements and hermetic symbolism

### Phase 4: Launch Preparation (Weeks 10-12)

- [ ] Production deployment setup

- [ ] Domain configuration (ialchemist.app)

- [ ] Performance testing and AI response optimization

- [ ] User acceptance testing with real spiritual seekers

- [ ] **Marketing site with pricing plans** and conversation examples showcasing subscription tiers

## Resource Requirements

### Technical Team

- **Frontend Developer**: React/Next.js expertise with mystical UI experience
- **AI/ML Engineer**: LLM integration and complex persona prompt engineering
- **UI/UX Designer**: Ancient wisdom aesthetic design and immersive storytelling
- **Backend Developer**: API development, conversation memory, and hermetic knowledge systems
- **Content Specialist**: Hermetic philosophy expert for authentic knowledge curation

### External Services

- **AI Provider**: OpenAI API (GPT-5, GPT-5 Thinking, GPT-4o fallback) costs - estimated higher usage for complex conversations and multilingual responses with improved efficiency
- **Hosting**: Vercel Pro or equivalent
- **Domain**: ialchemist.app registration and management
- **Database**: Hosted PostgreSQL with PGVector extension (Neon, Supabase, or AWS RDS)
- **Email Service**: Resend ✅ (Already integrated)
- **Translation Services**: Professional translation services for 7+ languages with hermetic philosophy expertise
- **Multilingual Content Review**: Native speakers with spiritual/philosophical background for content accuracy
- **Payment Processing**: Stripe fees (2.9% + 30¢ per transaction) for subscription billing
- **Subscription Management**: Stripe billing and customer portal for plan management

## Risk Analysis

### Technical Risks

- **AI Persona Consistency**: Maintaining Hermes character across long, complex conversations
- **AI SDK v5 Integration**: Learning curve for new v5 API patterns and migration from direct OpenAI integration
- **GPT-5 + AI SDK Optimization**: Balancing AI SDK's abstractions with GPT-5's specific capabilities for hermetic dialogue
- **API Rate Limits**: Managing costs through AI SDK's provider management and intelligent caching
- **Conversation Memory & Storage**: Maintaining context across extended spiritual guidance sessions with comprehensive history management in multiple languages
- **Multilingual Accuracy**: Ensuring hermetic concepts translate correctly across 7+ languages while maintaining philosophical integrity
- **Cultural Translation**: Adapting metaphors, examples, and cultural references appropriately for each language region
- **AI Language Switching**: Maintaining Hermes persona consistency when switching between languages mid-conversation

### Business Risks

- **Market Validation**: Niche spiritual audience may limit initial growth
- **Content Authenticity**: Ensuring philosophically accurate hermetic knowledge and avoiding misinformation
- **User Emotional Safety**: Handling personal spiritual crises and mental health situations appropriately
- **Cultural Sensitivity**: Respecting different spiritual backgrounds while maintaining hermetic focus
- **Payment Security**: PCI compliance and secure handling of sensitive payment information
- **Subscription Management**: Handling billing disputes, cancellations, and refund requests appropriately

## Success Metrics

### Engagement Metrics

- Daily Active Users (DAU) - targeting spiritual seekers
- Average session duration (target: 15+ minutes for meaningful conversations)
- Messages per session (depth of spiritual dialogue)
- User retention rates (return for continued wisdom seeking)
- Personal transformation stories and testimonials

### Quality Metrics

- User satisfaction scores with Hermes persona authenticity
- Hermetic knowledge accuracy ratings
- Personal guidance effectiveness (user self-reported transformation)
- Conversation depth and emotional resonance scores
- **Multilingual content quality across all 7+ supported languages**
- **Cultural authenticity and sensitivity in non-English markets**

### Business Metrics

- **Monthly Recurring Revenue (MRR)** growth from subscription plans
- **Customer Acquisition Cost (CAC)** vs **Lifetime Value (LTV)** ratios
- **Subscription conversion rates** from free trial to paid plans
- **Churn rate** and subscription retention across different tiers
- **Average Revenue Per User (ARPU)** by subscription tier and region

## Next Steps

1. **Immediate Actions**:

   - Study the provided conversation example for tone, style, and persona consistency
   - Begin Hermes Trismegistus persona prompt engineering based on conversation patterns
   - Design mystical UI mockups with ancient wisdom aesthetics
   - **Research multilingual hermetic philosophical terminology** across all target languages
   - **Establish translation standards** for hermetic concepts in each language

2. **Week 1 Priorities**:

   - Create comprehensive Hermes persona system prompt using conversation example
   - Design conversation flow for both philosophical inquiry and personal guidance
   - Develop multi-level explanation system (child/teen/adult) framework
   - Set up AI streaming response architecture
   - **Build AI SDK v5 system** with GPT-5 integration, multilingual support, and React hooks setup

---

## Conversation Memory & History Architecture

### Core Memory Features

**Persistent Storage:**

- **Full Conversation Archive**: Every message stored with timestamps, metadata, and context
- **Cross-Session Continuity**: AI maintains awareness of previous conversations and user's spiritual journey
- **Message Relationships**: Conversation threads, references to previous discussions, and topic connections
- **Rich Metadata**: Store conversation topics, hermetic principles discussed, emotional states, and user insights

**Search & Discovery:**

- **Semantic Search**: Find conversations by meaning, not just keywords (using vector embeddings)
- **Topic-Based Filtering**: Filter by hermetic principles, life challenges, daily practices, or spiritual themes
- **Date Range Queries**: Find conversations from specific time periods or spiritual milestones
- **Advanced Search**: Boolean operators, phrase matching, and context-aware results

**Organization & Visualization:**

- **Spiritual Journey Timeline**: Visual representation of user's growth and transformation over time
- **Conversation Categories**: Auto-categorization by themes (teachings, personal guidance, daily practices, life challenges)
- **Insight Tracking**: Highlight breakthrough moments, key realizations, and spiritual progress
- **Statistics Dashboard**: Conversation frequency, topics explored, and spiritual development metrics

**Export & Backup:**

- **Multiple Formats**: PDF (formatted), Markdown (structured), JSON (raw data), EPUB (e-book format)
- **Selective Export**: Choose specific conversations, date ranges, or topics
- **Privacy Controls**: User-controlled data retention, deletion options, and export limitations
- **Scheduled Backups**: Automatic weekly/monthly conversation archives

### Technical Implementation

**Database Schema:**

- **Conversations Table**: session_id, user_id, title, created_at, updated_at, metadata
- **Messages Table**: message_id, conversation_id, role (user/assistant), content, timestamp, vector_embedding
- **Topics Table**: topic_id, name, hermetic_principle, conversation_count
- **User Insights Table**: insight_id, user_id, content, conversation_id, significance_level

**AI SDK Integration:**

- **Message Persistence**: Extend AI SDK's `UIMessage` system with database storage
- **Context Management**: Inject relevant conversation history into AI prompts for continuity
- **Memory Optimization**: Balance conversation context length with AI token limits
- **Cross-Session State**: Maintain user preferences, spiritual progress, and conversation style

**Privacy & Security:**

- **Encryption at Rest**: All conversation data encrypted using AES-256
- **User Ownership**: Users have full control over their conversation data
- **GDPR Compliance**: Right to access, modify, and delete conversation history
- **Retention Policies**: Configurable data retention periods based on subscription tier

---

## Subscription Plans & Pricing Strategy

### Recommended Pricing Tiers

#### **Seeker Plan - $9.99/month**

- **Target**: Curious spiritual beginners
- **Features**:
  - 100 AI conversations per month with Hermes
  - **30-day conversation history** retention
  - Basic hermetic teachings (7 Laws, Emerald Tablet)
  - Age-appropriate explanations (child/teen/adult)
  - Community access to general discussions
  - Email support

#### **Adept Plan - $24.99/month** ⭐ _Most Popular_

- **Target**: Committed spiritual practitioners
- **Features**:
  - Unlimited AI conversations with Hermes
  - **Unlimited conversation history** with full search capabilities
  - **Spiritual journey timeline** and progress tracking
  - Advanced hermetic teachings and personal guidance
  - Daily mantras and personalized practice recommendations
  - Interactive storytelling and ritual creation
  - Life challenge analysis through hermetic lens
  - Priority response times (< 2 seconds)
  - **Export conversations** to PDF/Markdown

#### **Master Plan - $49.99/month**

- **Target**: Serious hermetic students and practitioners
- **Features**:
  - Everything in Adept Plan
  - **Lifetime conversation archive** with advanced analytics and insights
  - **Conversation categorization** by hermetic principles and themes
  - **Cross-device sync** with offline conversation access
  - **GPT-5 Thinking Mode** for deep philosophical analysis
  - Exclusive advanced hermetic texts and libraries
  - Personalized transformation rituals and ceremonies
  - Dream interpretation and spiritual guidance
  - VIP community access and study groups
  - Phone/voice conversations with Hermes (future)
  - Custom meditation and practice schedules

#### **Annual Discounts**

- **Seeker Annual**: $99.99/year (2 months free - 17% savings)
- **Adept Annual**: $249.99/year (2 months free - 17% savings)
- **Master Annual**: $499.99/year (2 months free - 17% savings)

### Free Trial Strategy

- **7-day free trial** for all paid plans
- **10 free conversations** for new users to experience Hermes
- **No credit card required** for trial signup

### International Pricing

- **Currency Support**: USD, EUR, GBP, CAD, AUD, CHF
- **Regional Pricing**: Adjusted for purchasing power in developing markets
- **Payment Methods**: Credit cards, PayPal, SEPA, local payment methods

---

## Vercel AI SDK v5 Integration Benefits

### Why AI SDK v5 for IALchemist.app

**Standardized AI Integration:**

- **Provider Abstraction**: Unified API for GPT-5, with easy fallback to GPT-4o or other models
- **TypeScript First**: Full type safety for hermetic conversation flows and structured responses
- **Framework Agnostic**: Built specifically for React/Next.js with seamless integration

**Advanced Chat Features:**

- **`useChat` Hook**: Built-in state management for Hermes conversations with message persistence
- **`useObject` Hook**: Real-time generation of structured hermetic practices and daily guidance
- **Tool Calling**: Native support for interactive spiritual tools and ritual creation
- **Message Streaming**: Optimized streaming for immersive spiritual dialogue

**Enterprise-Ready Architecture:**

- **Error Handling**: Robust error handling for spiritual guidance applications
- **Middleware Support**: Language model middleware for content filtering and guardrails
- **Telemetry**: Built-in monitoring for AI conversation quality and performance
- **Caching**: Intelligent response caching for frequently asked hermetic questions

**Migration & Maintenance:**

- **v5 Codemods**: Automated migration tools for future updates
- **Active Development**: Backed by Vercel with regular updates and improvements
- **Community Support**: Large developer community and extensive documentation

---

## GPT-5 Integration Benefits

### Key Advantages for IALchemist.app

**Unified Intelligence System:**

- **Automatic Complexity Routing**: GPT-5 automatically selects fast or deep reasoning based on query complexity
- **Enhanced Persona Consistency**: Better maintenance of Hermes Trismegistus character across long conversations
- **Adaptive Response Depth**: Verbosity parameter allows fine-tuning response length for different user needs

**Improved Reliability for Spiritual Guidance:**

- **Reduced Hallucinations**: 1.4% grounded hallucination rate ensures more accurate hermetic knowledge
- **Enhanced Writing Quality**: More expressive and contextually relevant spiritual guidance
- **Better Code Generation**: Superior ability to create interactive spiritual tools and rituals

**Multilingual Excellence:**

- **Cultural Sensitivity**: Improved adaptation to different languages and cultural contexts
- **Philosophical Accuracy**: Better translation of complex hermetic concepts across languages
- **Context Preservation**: Enhanced ability to maintain conversation flow when switching languages

**Technical Implementation:**

- **API Flexibility**: Minimal reasoning mode for quick responses, thinking mode for deep analysis
- **Cost Optimization**: Intelligent routing between fast and reasoning modes based on query complexity
- **Enhanced Streaming**: Faster initial response times with improved content quality

---

## Conversation Example Analysis

### Key Insights from Hermes Conversation

Based on the provided Claude conversation example (conducted in Czech), the following patterns and approaches should be implemented across all supported languages:

#### **Persona Characteristics**

- **Wisdom Voice**: Ancient authority combined with modern relatability
- **Empathetic Guidance**: Deep emotional intelligence for personal struggles
- **Adaptive Teaching**: Seamlessly adjusts complexity for different audiences
- **Storytelling Master**: Uses narrative elements, scene-setting, and props
- **Practical Wisdom**: Provides actionable daily practices and mantras

#### **Conversation Patterns**

- **Progressive Depth**: Starts with simple concepts, builds to personal application
- **Multi-Format Responses**: Uses various formats (lists, tables, ritual instructions, mantras)
- **Emotional Transitions**: Recognizes when users share personal pain and shifts tone appropriately
- **Transformative Focus**: Always guides toward growth and positive transformation
- **Cultural Sensitivity**: Adapts to user's language and cultural context (demonstrated with Czech example, must extend to all target languages)

#### **Content Structure Examples**

- **Daily Practice Systems**: Weekly cycles with specific mantras and exercises
- **Personal Challenge Analysis**: Uses hermetic principles to reframe life difficulties
- **Ritual Creation**: Provides specific, actionable spiritual practices
- **Symbolic Elements**: Incorporates amulets, scrolls, and mystical props
- **Healing Guidance**: Transforms betrayal and pain into wisdom and strength

#### **Technical Implementation Notes**

- **AI SDK v5 Architecture**: Use `streamText` for formatted responses with rich markdown, emojis, and visual structure
- **Character Consistency**: Maintain Hermes persona using AI SDK's message system and context management
- **Context Memory**: Comprehensive conversation history system with semantic search and spiritual journey tracking
- **Multilingual Support**: Utilize AI SDK's provider management for seamless language switching with cultural appropriateness
- **Emotional Recognition**: Implement custom tools via AI SDK for detecting user emotional states and adapting responses

---

_This document serves as the foundational blueprint for the IALchemist.app project. Regular updates and revisions will be made as the project evolves._
