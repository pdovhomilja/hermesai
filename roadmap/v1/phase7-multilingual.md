# Phase 7: Multilingual Implementation

## Overview

This phase implements comprehensive multilingual support for 7+ languages, including dynamic language switching, culturally adapted hermetic content, and localized AI responses while maintaining philosophical accuracy.

## Prerequisites

- Phases 1-6 completed
- next-intl configured ✅
- Translation resources prepared

## Phase Objectives

1. Expand language support to 7+ languages
2. Implement dynamic language detection and switching
3. Create localized hermetic content database
4. Adapt AI responses for cultural context
5. Build translation management system
6. Implement RTL support for applicable languages
7. Create language-specific UI adaptations

## Supported Languages

- English (en) - Default
- Czech (cs)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)

## Implementation Steps

### Step 1: Expand Message Files

Update all message files in `messages/` directory:

`messages/en.json`:

```json
{
  "common": {
    "appName": "IALchemist",
    "tagline": "Ancient Wisdom for Modern Seekers",
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Try again",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "search": "Search",
    "filter": "Filter",
    "export": "Export",
    "settings": "Settings"
  },

  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "signOut": "Sign Out",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "forgotPassword": "Forgot Password?",
    "resetPassword": "Reset Password",
    "verifyEmail": "Verify Email",
    "createAccount": "Create Account",
    "alreadyHaveAccount": "Already have an account?",
    "dontHaveAccount": "Don't have an account?",
    "orContinueWith": "Or continue with",
    "termsAgreement": "By signing up, you agree to our Terms and Privacy Policy"
  },

  "hermes": {
    "greeting": "Greetings, dear seeker",
    "title": "Hermes Trismegistus",
    "subtitle": "The Thrice-Great",
    "askQuestion": "Ask your question...",
    "principles": {
      "mentalism": {
        "name": "The Principle of Mentalism",
        "description": "The All is Mind; the Universe is Mental",
        "practice": "Morning Mind Alignment"
      },
      "correspondence": {
        "name": "The Principle of Correspondence",
        "description": "As above, so below; as below, so above",
        "practice": "Pattern Recognition Meditation"
      },
      "vibration": {
        "name": "The Principle of Vibration",
        "description": "Nothing rests; everything moves; everything vibrates",
        "practice": "Vibrational Attunement"
      },
      "polarity": {
        "name": "The Principle of Polarity",
        "description": "Everything is dual; opposites are identical in nature",
        "practice": "Polarity Transmutation"
      },
      "rhythm": {
        "name": "The Principle of Rhythm",
        "description": "Everything flows, out and in",
        "practice": "Rhythm Awareness"
      },
      "causeEffect": {
        "name": "The Principle of Cause and Effect",
        "description": "Every cause has its effect; every effect has its cause",
        "practice": "Conscious Creation"
      },
      "gender": {
        "name": "The Principle of Gender",
        "description": "Gender is in everything",
        "practice": "Gender Balance Meditation"
      }
    }
  },

  "chat": {
    "newConversation": "New Conversation",
    "conversations": "Conversations",
    "messages": "Messages",
    "noConversations": "No conversations yet",
    "startConversation": "Start your spiritual journey",
    "deleteConversation": "Delete conversation",
    "exportConversation": "Export conversation",
    "searchConversations": "Search conversations",
    "todayAt": "Today at {time}",
    "yesterdayAt": "Yesterday at {time}",
    "typing": "Hermes is contemplating..."
  },

  "subscription": {
    "plans": {
      "seeker": {
        "name": "Seeker",
        "description": "For curious spiritual beginners"
      },
      "adept": {
        "name": "Adept",
        "description": "For committed practitioners"
      },
      "master": {
        "name": "Master",
        "description": "For serious hermetic students"
      }
    },
    "features": {
      "conversations": "{count} conversations per month",
      "unlimitedConversations": "Unlimited conversations",
      "historyDays": "{days}-day conversation history",
      "unlimitedHistory": "Unlimited conversation history",
      "exportEnabled": "Export conversations",
      "advancedFeatures": "Advanced features",
      "prioritySupport": "Priority support"
    },
    "billing": {
      "monthly": "Monthly",
      "annual": "Annual",
      "savePercent": "Save {percent}%",
      "startTrial": "Start Free Trial",
      "currentPlan": "Current Plan",
      "upgradePlan": "Upgrade Plan",
      "manageBilling": "Manage Billing",
      "cancelSubscription": "Cancel Subscription"
    }
  },

  "journey": {
    "title": "Your Spiritual Journey",
    "timeline": "Timeline",
    "insights": "Insights",
    "statistics": "Statistics",
    "milestones": "Milestones",
    "totalConversations": "Total Conversations",
    "totalMessages": "Total Messages",
    "principlesStudied": "Principles Studied",
    "currentLevel": "Current Level",
    "transformationScore": "Transformation Score",
    "streakDays": "{days} day streak"
  },

  "errors": {
    "generic": "Something went wrong",
    "networkError": "Network connection error",
    "unauthorized": "Please sign in to continue",
    "forbidden": "You don't have permission",
    "notFound": "Page not found",
    "rateLimit": "Too many requests, please slow down",
    "usageLimit": "Usage limit reached",
    "paymentRequired": "Subscription required",
    "invalidInput": "Invalid input provided"
  }
}
```

`messages/cs.json`:

```json
{
  "common": {
    "appName": "IALchemist",
    "tagline": "Starověká moudrost pro moderní hledače",
    "loading": "Načítání...",
    "error": "Došlo k chybě",
    "retry": "Zkusit znovu"
  },

  "hermes": {
    "greeting": "Zdravím tě, drahý hledači",
    "title": "Hermes Trismegistos",
    "subtitle": "Třikrát Veliký",
    "askQuestion": "Polož svou otázku...",
    "principles": {
      "mentalism": {
        "name": "Princip Mentalismu",
        "description": "Vše je Mysl; Vesmír je Mentální"
      }
    }
  }
}
```

### Step 2: Hermetic Content Localization Service

Create `lib/i18n/hermetic-content.ts`:

```typescript
import { HERMETIC_PRINCIPLES } from "@/lib/ai/knowledge/hermetic-principles";

export interface LocalizedHermeticContent {
  principles: Record<string, LocalizedPrinciple>;
  practices: Record<string, LocalizedPractice>;
  mantras: Record<string, string>;
  emeraldTablet: LocalizedEmeraldTablet;
}

export interface LocalizedPrinciple {
  name: string;
  core: string;
  explanations: {
    simple: string;
    intermediate: string;
    advanced: string;
  };
}

export interface LocalizedPractice {
  name: string;
  description: string;
  instructions: string[];
  benefits: string[];
}

export interface LocalizedEmeraldTablet {
  title: string;
  verses: string[];
  interpretation: string;
}

export const HERMETIC_TRANSLATIONS: Record<string, LocalizedHermeticContent> = {
  en: {
    principles: {
      mentalism: {
        name: "The Principle of Mentalism",
        core: "The All is Mind; the Universe is Mental",
        explanations: {
          simple:
            "Everything begins with thought. Your mind shapes your reality.",
          intermediate:
            "Consciousness is the fundamental substance of the universe.",
          advanced:
            "The Universal Mind manifests through individual consciousness.",
        },
      },
      // ... other principles
    },
    practices: {
      // Localized practices
    },
    mantras: {
      mentalism: "My thoughts create my world. I choose wisely.",
      correspondence:
        "I see the universe in myself, and myself in the universe.",
    },
    emeraldTablet: {
      title: "The Emerald Tablet of Hermes Trismegistus",
      verses: [
        "'Tis true without error, certain and most true.",
        "That which is below is like that which is above",
      ],
      interpretation: "The process of spiritual transformation through stages",
    },
  },

  cs: {
    principles: {
      mentalism: {
        name: "Princip Mentalismu",
        core: "Vše je Mysl; Vesmír je Mentální",
        explanations: {
          simple: "Vše začíná myšlenkou. Vaše mysl utváří vaši realitu.",
          intermediate: "Vědomí je základní podstatou vesmíru.",
          advanced: "Univerzální Mysl se projevuje skrze individuální vědomí.",
        },
      },
    },
    practices: {
      // Czech localized practices
    },
    mantras: {
      mentalism: "Mé myšlenky tvoří můj svět. Volím moudře.",
      correspondence: "Vidím vesmír v sobě a sebe ve vesmíru.",
    },
    emeraldTablet: {
      title: "Smaragdová deska Herma Trismegista",
      verses: [
        "Je to pravda bez omylu, jistá a nejpravdivější.",
        "Co je dole, je jako to, co je nahoře",
      ],
      interpretation: "Proces duchovní transformace skrze stupně",
    },
  },

  es: {
    principles: {
      mentalism: {
        name: "El Principio del Mentalismo",
        core: "El Todo es Mente; el Universo es Mental",
        explanations: {
          simple:
            "Todo comienza con el pensamiento. Tu mente da forma a tu realidad.",
          intermediate:
            "La conciencia es la sustancia fundamental del universo.",
          advanced:
            "La Mente Universal se manifiesta a través de la conciencia individual.",
        },
      },
    },
    practices: {},
    mantras: {
      mentalism: "Mis pensamientos crean mi mundo. Elijo sabiamente.",
    },
    emeraldTablet: {
      title: "La Tabla Esmeralda de Hermes Trismegisto",
      verses: [],
      interpretation: "",
    },
  },

  fr: {
    principles: {
      mentalism: {
        name: "Le Principe du Mentalisme",
        core: "Le Tout est Esprit; l'Univers est Mental",
        explanations: {
          simple:
            "Tout commence par la pensée. Votre esprit façonne votre réalité.",
          intermediate:
            "La conscience est la substance fondamentale de l'univers.",
          advanced:
            "L'Esprit Universel se manifeste à travers la conscience individuelle.",
        },
      },
    },
    practices: {},
    mantras: {
      mentalism: "Mes pensées créent mon monde. Je choisis sagement.",
    },
    emeraldTablet: {
      title: "La Table d'Émeraude d'Hermès Trismégiste",
      verses: [],
      interpretation: "",
    },
  },

  de: {
    principles: {
      mentalism: {
        name: "Das Prinzip des Mentalismus",
        core: "Das All ist Geist; das Universum ist Mental",
        explanations: {
          simple:
            "Alles beginnt mit dem Gedanken. Dein Geist formt deine Realität.",
          intermediate:
            "Bewusstsein ist die grundlegende Substanz des Universums.",
          advanced:
            "Der Universelle Geist manifestiert sich durch individuelles Bewusstsein.",
        },
      },
    },
    practices: {},
    mantras: {
      mentalism: "Meine Gedanken erschaffen meine Welt. Ich wähle weise.",
    },
    emeraldTablet: {
      title: "Die Smaragdtafel des Hermes Trismegistos",
      verses: [],
      interpretation: "",
    },
  },

  it: {
    principles: {
      mentalism: {
        name: "Il Principio del Mentalismo",
        core: "Il Tutto è Mente; l'Universo è Mentale",
        explanations: {
          simple:
            "Tutto inizia con il pensiero. La tua mente plasma la tua realtà.",
          intermediate:
            "La coscienza è la sostanza fondamentale dell'universo.",
          advanced:
            "La Mente Universale si manifesta attraverso la coscienza individuale.",
        },
      },
    },
    practices: {},
    mantras: {
      mentalism: "I miei pensieri creano il mio mondo. Scelgo saggiamente.",
    },
    emeraldTablet: {
      title: "La Tavola di Smeraldo di Ermete Trismegisto",
      verses: [],
      interpretation: "",
    },
  },

  pt: {
    principles: {
      mentalism: {
        name: "O Princípio do Mentalismo",
        core: "O Todo é Mente; o Universo é Mental",
        explanations: {
          simple:
            "Tudo começa com o pensamento. Sua mente molda sua realidade.",
          intermediate: "A consciência é a substância fundamental do universo.",
          advanced:
            "A Mente Universal se manifesta através da consciência individual.",
        },
      },
    },
    practices: {},
    mantras: {
      mentalism: "Meus pensamentos criam meu mundo. Eu escolho sabiamente.",
    },
    emeraldTablet: {
      title: "A Tábua de Esmeralda de Hermes Trismegisto",
      verses: [],
      interpretation: "",
    },
  },
};

export class HermeticContentLocalizer {
  static getContent(locale: string): LocalizedHermeticContent {
    return HERMETIC_TRANSLATIONS[locale] || HERMETIC_TRANSLATIONS.en;
  }

  static getPrinciple(
    locale: string,
    principleKey: string
  ): LocalizedPrinciple | null {
    const content = this.getContent(locale);
    return content.principles[principleKey] || null;
  }

  static getMantra(locale: string, principleKey: string): string {
    const content = this.getContent(locale);
    return content.mantras[principleKey] || "";
  }
}
```

### Step 3: Localized AI Response Builder

Create `lib/ai/i18n/localized-response.ts`:

```typescript
import {
  HermesResponseBuilder,
  UserContext,
} from "@/lib/ai/context/response-builder";
import { HermeticContentLocalizer } from "@/lib/i18n/hermetic-content";

export interface LocalizedUserContext extends UserContext {
  locale: string;
  culturalContext?: string;
}

export class LocalizedHermesResponseBuilder extends HermesResponseBuilder {
  private locale: string;
  private culturalAdaptations: Record<string, any>;

  constructor(context: LocalizedUserContext) {
    super(context);
    this.locale = context.locale || "en";
    this.culturalAdaptations = this.getCulturalAdaptations(this.locale);
  }

  buildSystemPrompt(): string {
    const basePrompt = super.buildSystemPrompt();
    const localizedContent = HermeticContentLocalizer.getContent(this.locale);

    const localizationInstructions = `
    LANGUAGE AND CULTURAL CONTEXT:
    - Respond in ${this.getLanguageName(this.locale)}
    - Adapt metaphors and examples to ${this.culturalAdaptations.culture}
    - Use culturally appropriate greetings and closings
    - Reference local wisdom traditions when relevant: ${
      this.culturalAdaptations.wisdomTraditions
    }
    - Maintain hermetic accuracy while being culturally sensitive
    
    LOCALIZED HERMETIC KNOWLEDGE:
    - Use these localized principle names: ${JSON.stringify(
      Object.values(localizedContent.principles).map((p) => p.name)
    )}
    - Apply culturally relevant examples from: ${
      this.culturalAdaptations.examples
    }
    - Adapt practices to local customs when appropriate
    
    COMMUNICATION STYLE FOR ${this.locale.toUpperCase()}:
    - Formality level: ${this.culturalAdaptations.formality}
    - Emotional expression: ${this.culturalAdaptations.emotionalExpression}
    - Metaphor preferences: ${this.culturalAdaptations.metaphorPreferences}
    `;

    return basePrompt + "\n\n" + localizationInstructions;
  }

  private getCulturalAdaptations(locale: string): any {
    const adaptations: Record<string, any> = {
      en: {
        culture: "Western/Anglo-American context",
        formality: "Balanced - friendly yet respectful",
        emotionalExpression:
          "Moderate - supportive without being overly emotional",
        metaphorPreferences: "Nature, journey, light/darkness",
        wisdomTraditions:
          "Greek philosophy, Egyptian mysteries, Renaissance alchemy",
        examples: "Modern life, technology, personal growth",
      },

      cs: {
        culture: "Czech/Central European context",
        formality:
          "More formal initially, can become informal with familiarity",
        emotionalExpression: "Reserved but warm",
        metaphorPreferences: "Nature, craftsmanship, historical references",
        wisdomTraditions: "Slavic mysticism, Medieval alchemy, Rudolf II era",
        examples: "Czech history, nature, philosophical traditions",
      },

      es: {
        culture: "Spanish/Latin context",
        formality: "Formal with use of usted initially",
        emotionalExpression: "Warm and expressive",
        metaphorPreferences: "Light, passion, journey, family",
        wisdomTraditions:
          "Medieval Spanish mysticism, Arab alchemical traditions",
        examples: "Community, passion, spiritual journey",
      },

      fr: {
        culture: "French context",
        formality: "Formal with vous, philosophical tone",
        emotionalExpression: "Intellectual with subtle emotion",
        metaphorPreferences: "Light, reason, beauty, transformation",
        wisdomTraditions: "French occultism, Enlightenment philosophy",
        examples: "Art, philosophy, intellectual pursuits",
      },

      de: {
        culture: "German context",
        formality: "Formal with Sie, precise language",
        emotionalExpression: "Reserved but sincere",
        metaphorPreferences: "Order, transformation, depth, forest",
        wisdomTraditions: "German mysticism, Rosicrucian traditions",
        examples: "Philosophy, science, systematic thinking",
      },

      it: {
        culture: "Italian context",
        formality: "Formal with Lei, can be poetic",
        emotionalExpression: "Expressive and warm",
        metaphorPreferences: "Art, beauty, Renaissance, transformation",
        wisdomTraditions: "Renaissance hermeticism, Ficino, Bruno",
        examples: "Art, beauty, spiritual renaissance",
      },

      pt: {
        culture: "Portuguese/Brazilian context",
        formality: "Formal with você/senhor(a)",
        emotionalExpression: "Warm and encouraging",
        metaphorPreferences: "Journey, ocean, discovery, light",
        wisdomTraditions: "Portuguese mysticism, Brazilian spirituality",
        examples: "Discovery, transformation, community",
      },
    };

    return adaptations[locale] || adaptations.en;
  }

  private getLanguageName(locale: string): string {
    const names: Record<string, string> = {
      en: "English",
      cs: "Czech",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
    };
    return names[locale] || "English";
  }

  getLocalizedGreeting(isFirstTime: boolean = true): string {
    const greetings: Record<string, { first: string; returning: string }> = {
      en: {
        first: "Greetings, dear seeker. I am Hermes Trismegistus...",
        returning: "Welcome back, beloved seeker...",
      },
      cs: {
        first: "Zdravím tě, drahý hledači. Jsem Hermes Trismegistos...",
        returning: "Vítej zpět, milovaný hledači...",
      },
      es: {
        first: "Saludos, querido buscador. Soy Hermes Trismegisto...",
        returning: "Bienvenido de vuelta, amado buscador...",
      },
      fr: {
        first: "Salutations, cher chercheur. Je suis Hermès Trismégiste...",
        returning: "Bon retour, cher chercheur...",
      },
      de: {
        first: "Grüße, lieber Suchender. Ich bin Hermes Trismegistos...",
        returning: "Willkommen zurück, geliebter Suchender...",
      },
      it: {
        first: "Saluti, caro cercatore. Sono Ermete Trismegisto...",
        returning: "Bentornato, amato cercatore...",
      },
      pt: {
        first: "Saudações, querido buscador. Eu sou Hermes Trismegisto...",
        returning: "Bem-vindo de volta, amado buscador...",
      },
    };

    const localeGreetings = greetings[this.locale] || greetings.en;
    return isFirstTime ? localeGreetings.first : localeGreetings.returning;
  }
}
```

### Step 4: Language Detection Service

Create `lib/i18n/detection.ts`:

```typescript
export class LanguageDetector {
  private static languagePatterns: Record<string, RegExp[]> = {
    cs: [
      /\b(jsem|jste|jsou|byl|byla|bylo)\b/i,
      /\b(že|ale|když|protože|nebo)\b/i,
      /[ěščřžýáíéůú]/i,
    ],
    es: [
      /\b(soy|eres|es|somos|son)\b/i,
      /\b(que|pero|cuando|porque|donde)\b/i,
      /[ñáéíóú]/i,
    ],
    fr: [
      /\b(je|tu|il|nous|vous|ils)\b/i,
      /\b(que|mais|quand|parce|où)\b/i,
      /[àâçèéêëîïôùûü]/i,
    ],
    de: [
      /\b(ich|du|er|wir|ihr|sie)\b/i,
      /\b(und|aber|wenn|weil|wo)\b/i,
      /[äöüß]/i,
    ],
    it: [
      /\b(sono|sei|è|siamo|siete)\b/i,
      /\b(che|ma|quando|perché|dove)\b/i,
      /[àèéìíòóù]/i,
    ],
    pt: [
      /\b(sou|és|é|somos|são)\b/i,
      /\b(que|mas|quando|porque|onde)\b/i,
      /[ãáàâçéêíõóôú]/i,
    ],
  };

  static detectLanguage(text: string): string {
    // Check for language-specific patterns
    for (const [lang, patterns] of Object.entries(this.languagePatterns)) {
      const matches = patterns.filter((pattern) => pattern.test(text)).length;
      if (matches >= 2) {
        return lang;
      }
    }

    // Default to English
    return "en";
  }

  static async detectFromUserHistory(userId: string): Promise<string> {
    // Check user's preferred language from profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredLanguage: true },
    });

    return user?.preferredLanguage || "en";
  }
}
```

### Step 5: Dynamic Language Switching

Create `lib/i18n/switcher.ts`:

```typescript
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/client";

export class LanguageSwitcher {
  static readonly COOKIE_NAME = "ialchemist-locale";
  static readonly SUPPORTED_LOCALES = [
    "en",
    "cs",
    "es",
    "fr",
    "de",
    "it",
    "pt",
  ];

  static async getLocale(userId?: string): Promise<string> {
    // Priority: User preference > Cookie > Browser > Default

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferredLanguage: true },
      });

      if (user?.preferredLanguage) {
        return user.preferredLanguage;
      }
    }

    // Check cookie
    const cookieStore = cookies();
    const localeCookie = cookieStore.get(this.COOKIE_NAME);

    if (localeCookie && this.SUPPORTED_LOCALES.includes(localeCookie.value)) {
      return localeCookie.value;
    }

    // Default
    return "en";
  }

  static async setLocale(locale: string, userId?: string): Promise<void> {
    if (!this.SUPPORTED_LOCALES.includes(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }

    // Update cookie
    const cookieStore = cookies();
    cookieStore.set(this.COOKIE_NAME, locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      sameSite: "lax",
    });

    // Update user preference if logged in
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { preferredLanguage: locale },
      });
    }
  }
}
```

### Step 6: Localized Chat API Enhancement

Update `app/api/chat/route.ts` to include localization:

```typescript
import { LocalizedHermesResponseBuilder } from '@/lib/ai/i18n/localized-response'
import { LanguageDetector } from '@/lib/i18n/detection'
import { LanguageSwitcher } from '@/lib/i18n/switcher'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { messages, conversationId, forceLocale } = body

    // Determine language
    let locale = forceLocale

    if (!locale) {
      // Try to detect from message
      const lastUserMessage = messages[messages.length - 1]?.content || ''
      const detectedLocale = LanguageDetector.detectLanguage(lastUserMessage)

      if (detectedLocale !== 'en') {
        locale = detectedLocale
      } else {
        // Use user's preferred language
        locale = await LanguageSwitcher.getLocale(session.user.id)
      }
    }

    // Update user's language preference if changed
    if (locale !== session.user.preferredLanguage) {
      await LanguageSwitcher.setLocale(locale, session.user.id)
    }

    // Get user's spiritual profile
    const userProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        spiritualProfile: true,
        preferences: true,
      }
    })

    // Build localized context
    const responseBuilder = new LocalizedHermesResponseBuilder({
      emotionalState: await detectEmotion(lastUserMessage),
      spiritualLevel: userProfile?.spiritualProfile?.currentLevel?.toLowerCase() || 'seeker',
      currentChallenges: detectChallenges(lastUserMessage),
      preferredLanguage: locale,
      conversationDepth: messages.length,
      locale,
      culturalContext: getCulturalContext(locale)
    })

    const systemPrompt = responseBuilder.buildSystemPrompt()

    // Continue with existing chat logic...
    // But now responses will be culturally adapted
  }
}

function getCulturalContext(locale: string): string {
  const contexts: Record<string, string> = {
    cs: 'Central European, Czech cultural background',
    es: 'Spanish/Latin cultural background',
    fr: 'French cultural background',
    de: 'German cultural background',
    it: 'Italian cultural background',
    pt: 'Portuguese/Brazilian cultural background',
    en: 'International/Western context'
  }

  return contexts[locale] || contexts.en
}
```

### Step 7: Language Selector Component

Create `components/i18n/language-selector.tsx`:

```typescript
"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "cs", name: "Čeština", flag: "🇨🇿" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
];

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      // Update the URL with new locale
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.push(newPathname);

      // Update user preference via API
      fetch("/api/user/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      });
    });
  };

  const currentLanguage = languages.find((l) => l.code === locale);

  return (
    <Select
      value={locale}
      onValueChange={handleLanguageChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[180px]">
        <Globe className="w-4 h-4 mr-2" />
        <SelectValue>
          {currentLanguage && (
            <span className="flex items-center gap-2">
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.name}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Step 8: RTL Support

Create `lib/i18n/rtl.ts`:

```typescript
export const RTL_LOCALES = ["ar", "he", "fa", "ur"];

export function isRTL(locale: string): boolean {
  return RTL_LOCALES.includes(locale);
}

export function getDirection(locale: string): "ltr" | "rtl" {
  return isRTL(locale) ? "rtl" : "ltr";
}

export function getRTLClassName(locale: string): string {
  return isRTL(locale) ? "rtl" : "";
}
```

Update layout to support RTL:

```typescript
import { getDirection } from "@/lib/i18n/rtl";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const direction = getDirection(locale);

  return (
    <html lang={locale} dir={direction}>
      <body className={cn(direction === "rtl" && "rtl")}>{children}</body>
    </html>
  );
}
```

### Step 9: Translation Management API

Create `app/api/translations/missing/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    // Compare with English (base) to find missing keys
    const enPath = path.join(process.cwd(), "messages", "en.json");
    const localePath = path.join(process.cwd(), "messages", `${locale}.json`);

    const enContent = JSON.parse(await fs.readFile(enPath, "utf-8"));
    const localeContent = JSON.parse(await fs.readFile(localePath, "utf-8"));

    const missingKeys = findMissingKeys(enContent, localeContent);

    return NextResponse.json({
      locale,
      missingKeys,
      coverage: calculateCoverage(enContent, localeContent),
    });
  } catch (error) {
    logger.error("Translation check error:", error);
    return NextResponse.json(
      { error: "Failed to check translations" },
      { status: 500 }
    );
  }
}

function findMissingKeys(base: any, target: any, prefix = ""): string[] {
  const missing: string[] = [];

  for (const key in base) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (!(key in target)) {
      missing.push(fullKey);
    } else if (typeof base[key] === "object" && !Array.isArray(base[key])) {
      missing.push(...findMissingKeys(base[key], target[key], fullKey));
    }
  }

  return missing;
}

function calculateCoverage(base: any, target: any): number {
  const baseKeys = countKeys(base);
  const targetKeys = countKeys(target);

  return Math.round((targetKeys / baseKeys) * 100);
}

function countKeys(obj: any): number {
  let count = 0;

  for (const key in obj) {
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      count += countKeys(obj[key]);
    } else {
      count++;
    }
  }

  return count;
}
```

## Verification Steps

1. Test language detection from user input
2. Verify dynamic language switching
3. Test localized hermetic content
4. Validate culturally adapted AI responses
5. Test all 7 language translations
6. Verify RTL support (if applicable)
7. Check translation coverage for each language

8. Run linting and build:

```bash
pnpm lint
pnpm build
```

## Success Criteria

- [ ] All 7 languages fully functional
- [ ] Language detection working accurately
- [ ] Dynamic switching updates UI immediately
- [ ] Hermetic content properly localized
- [ ] AI responses culturally adapted
- [ ] User preferences saved and persisted
- [ ] Translation coverage > 90% for all languages
- [ ] No linting errors
- [ ] Build completes successfully

## Next Phase

Phase 8 will implement advanced AI features including tool calling, ritual creation, and deep philosophical analysis.
