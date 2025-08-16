# IALchemist.app - Phase 7 Implementation

## Context

You are implementing Phase 7 of the IALchemist.app project - a sophisticated AI-powered spiritual guidance platform featuring Hermes Trismegistus as the AI persona. This phase focuses on implementing comprehensive multilingual support for 7+ languages, including dynamic language switching, culturally adapted hermetic content, and localized AI responses while maintaining philosophical accuracy.

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
- ✅ Phase 6: Subscription & Payment System

## Phase 7 Requirements

This phase implements comprehensive multilingual support for 7+ languages, including dynamic language switching, culturally adapted hermetic content, and localized AI responses while maintaining philosophical accuracy.

### Supported Languages

- English (en) - Default
- Czech (cs)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)

### Objectives

1. Expand language support to 7+ languages
2. Implement dynamic language detection and switching
3. Create localized hermetic content database
4. Adapt AI responses for cultural context
5. Build translation management system
6. Implement RTL support for applicable languages
7. Create language-specific UI adaptations

## Implementation Guidelines

### Code Quality Standards

1. **TypeScript First**: All code must be TypeScript with proper type safety
2. **Functional Programming**: Use functional patterns, avoid classes where possible
3. **Component Structure**: Follow the established pattern
4. **Error Handling**: Implement comprehensive error handling with proper logging
5. **Performance**: Optimize for Core Web Vitals, use React Server Components when possible

### File Naming Conventions

- **Directories**: lowercase with dashes (e.g., `multilingual-support`)
- **Components**: PascalCase files with kebab-case directories
- **API Routes**: lowercase with descriptive names
- **Utilities**: camelCase functions in kebab-case files

### Database Considerations

- Store language preferences in user profiles
- Support multilingual content in database
- Consider cultural context in spiritual guidance
- Implement language-specific conversation tracking

### Security Requirements

- Validate language inputs
- Secure translation management
- Protect cultural content
- Ensure appropriate content for each culture

### Testing Requirements

- Test all language implementations
- Validate cultural adaptations
- Test language switching
- Mock translation services

## Specific Implementation Tasks

### Step 1: Expand Message Files

Update all message files in `messages/` directory:

- Complete English translations (`messages/en.json`)
- Czech translations (`messages/cs.json`)
- Spanish translations (`messages/es.json`)
- French translations (`messages/fr.json`)
- German translations (`messages/de.json`)
- Italian translations (`messages/it.json`)
- Portuguese translations (`messages/pt.json`)

Include translations for:

- Common UI elements
- Authentication flows
- Hermes persona and principles
- Chat interface
- Subscription and billing
- Spiritual journey terminology
- Error messages

### Step 2: Localized Hermetic Content

Create `lib/i18n/hermetic-content.ts`:

- HERMETIC_TRANSLATIONS object for all languages
- HermeticContentLocalizer class
- Culturally adapted principle explanations
- Language-specific practices and mantras
- Emerald Tablet translations
- Cultural context considerations

### Step 3: Localized AI Response System

Create `lib/ai/i18n/localized-response.ts`:

- LocalizedHermesResponseBuilder class
- Cultural adaptation logic
- Language-specific greeting patterns
- Cultural context integration
- Philosophical accuracy maintenance
- Regional spiritual practice variations

### Step 4: Language Detection Service

Create `lib/i18n/detection.ts`:

- LanguageDetector class
- Automatic language detection from user input
- Language preference learning
- Cultural context detection
- Regional dialect support

### Step 5: Language Switching System

Create `lib/i18n/switcher.ts`:

- LanguageSwitcher class
- Dynamic language switching
- Cookie and preference management
- URL locale updates
- Session persistence

### Step 6: Enhanced Chat API with Localization

Update `app/api/chat/route.ts`:

- Integrate LocalizedHermesResponseBuilder
- Add LanguageDetector
- Cultural context awareness
- Language-specific response generation
- Maintain spiritual authenticity

### Step 7: Language Selector Component

Create `components/i18n/language-selector.tsx`:

- Dropdown language selector
- Flag icons for visual identification
- Smooth language transitions
- Accessibility support
- Mobile-friendly design

### Step 8: RTL Support Implementation

Create `lib/i18n/rtl.ts`:

- RTL language detection
- Layout direction utilities
- Text alignment helpers
- Cultural reading patterns
- Future Arabic/Hebrew support preparation

Update `app/[locale]/layout.tsx`:

- Apply `dir` attribute dynamically
- RTL-aware styling
- Cultural layout adaptations

### Step 9: Translation Management API

Create `app/api/translations/missing/route.ts`:

- Missing translation detection
- Translation completeness checking
- Quality assurance utilities
- Translation management endpoints

## Critical Success Factors

### Must-Have Features

- All 7 languages fully functional
- Dynamic language switching works
- Culturally adapted hermetic content
- Philosophically accurate translations
- Smooth user experience across languages
- Maintained spiritual authenticity
- Proper cultural sensitivity

### Performance Targets

- Language switching < 200ms
- Translation loading < 100ms
- Cultural adaptation < 300ms
- Hermetic content access < 150ms

### Error Scenarios to Handle

- Missing translations
- Cultural adaptation failures
- Language detection errors
- Translation service outages
- Encoding issues
- Regional content restrictions

## Quality Assurance Checklist

### Before Implementation

- [ ] Research cultural contexts for each language
- [ ] Study hermetic traditions in each culture
- [ ] Plan translation management strategy
- [ ] Understand RTL layout requirements

### During Implementation

- [ ] Write type-safe TypeScript code
- [ ] Follow established patterns and conventions
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Test each language thoroughly
- [ ] Validate cultural adaptations

### After Implementation

- [ ] Run `pnpm lint` and fix all issues
- [ ] Run `pnpm build` and fix all build errors
- [ ] Test all 7 languages manually
- [ ] Verify language switching functionality
- [ ] Check cultural appropriateness
- [ ] Validate hermetic accuracy
- [ ] Test RTL support preparation
- [ ] Review accessibility compliance

## Example Implementation Flow

### 1. Analysis Phase (20 minutes)

- Research cultural contexts for each language
- Study hermetic traditions across cultures
- Plan localization architecture
- Design cultural adaptation strategies

### 2. Setup Phase (15 minutes)

- Prepare translation files structure
- Set up cultural content organization
- Plan component localization
- Configure development environment

### 3. Core Development (150-180 minutes)

- Create comprehensive translation files
- Build hermetic content localization
- Implement localized AI responses
- Add language detection and switching
- Create language selector component
- Prepare RTL support

### 4. Integration Phase (30 minutes)

- Test all language implementations
- Verify cultural adaptations
- Check language switching
- Test hermetic content accuracy

### 5. Quality Assurance (20 minutes)

- Validate all translations
- Check cultural sensitivity
- Test user experience flows
- Final localization review

## Common Pitfalls to Avoid

### Technical Issues

- Incomplete translations
- Cultural insensitivity
- Poor language detection
- Inconsistent localization
- Missing RTL support preparation

### Integration Issues

- Breaking existing functionality
- Language switching conflicts
- Cultural content mismatches
- Performance degradation
- Accessibility issues

### Cultural Issues

- Inappropriate spiritual content
- Misunderstood cultural contexts
- Inaccurate hermetic translations
- Regional sensitivity violations
- Religious appropriation concerns

## Resources and References

### Documentation

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [React Intl Documentation](https://formatjs.io/docs/react-intl/)
- [Unicode CLDR](https://cldr.unicode.org/)
- [W3C Internationalization](https://www.w3.org/International/)

### Cultural Resources

- Hermetic traditions in different cultures
- Regional spiritual practices
- Cultural color and symbol meanings
- Religious sensitivity guidelines

### Project-Specific Context

- Database schema supports multilingual content
- Hermes persona must maintain authenticity across cultures
- Subscription system needs localized pricing
- Memory system should track language preferences
- Future phases will use this multilingual foundation

## Success Metrics

### Technical Metrics

- All linting passes without errors
- Build completes successfully
- No TypeScript errors or warnings
- All 7 languages functional
- Language switching works smoothly

### Functional Metrics

- Complete translations for all supported languages
- Culturally appropriate hermetic content
- Accurate philosophical translations
- Smooth language transitions
- Maintained spiritual authenticity
- Proper cultural sensitivity

## Final Notes

Remember that you are making the ancient wisdom of Hermes Trismegistus accessible to seekers across cultures and languages. Your implementation should:

1. **Honor All Traditions**: Respect the hermetic traditions in each culture
2. **Maintain Authenticity**: Keep spiritual teachings accurate across languages
3. **Embrace Diversity**: Celebrate the universal nature of hermetic wisdom
4. **Ensure Accessibility**: Make wisdom available to all language speakers
5. **Cultural Sensitivity**: Respect cultural contexts and spiritual practices

You are building bridges between ancient wisdom and modern global community, allowing Hermes Trismegistus to speak to seekers in their native tongues while preserving the sacred essence of the teachings.

May your code unite wisdom across all languages and cultures! 🔮✨
