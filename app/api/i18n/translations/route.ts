import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { LanguageSwitcher } from "@/lib/i18n/switcher";
import { HermeticContentLocalizer } from "@/lib/i18n/hermetic-content";
import { getTranslations } from "next-intl/server";

// Schema for translation requests
const translationRequestSchema = z.object({
  locale: z.string().min(2).max(5),
  keys: z.array(z.string()).optional(),
  namespace: z.string().optional(),
  includeHermetic: z.boolean().default(false),
  includeMetadata: z.boolean().default(false),
});

// Translation update schema for future admin functionality
// const translationUpdateSchema = z.object({
//   locale: z.string().min(2).max(5),
//   translations: z.record(z.string(), z.unknown()),
//   namespace: z.string().optional(),
//   hermetic: z.record(z.string(), z.unknown()).optional(),
// });

/**
 * GET /api/i18n/translations
 * Retrieve translations for a specific locale
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";
    const keys = searchParams.get("keys")?.split(",");
    const namespace = searchParams.get("namespace");
    const includeHermetic = searchParams.get("includeHermetic") === "true";
    const includeMetadata = searchParams.get("includeMetadata") === "true";

    const validation = translationRequestSchema.safeParse({
      locale,
      keys,
      namespace,
      includeHermetic,
      includeMetadata,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if locale is supported
    if (!LanguageSwitcher.isSupported(locale)) {
      return NextResponse.json(
        { error: `Unsupported locale: ${locale}` },
        { status: 400 }
      );
    }

    interface TranslationResponse {
      locale: string;
      timestamp: string;
      translations?: Record<string, unknown>;
      hermetic?: unknown;
      metadata?: {
        supportedLocales: string[];
        languageInfo: {
          name: string;
          nativeName: string;
          flag: string;
          rtl: boolean;
        };
        isRTL: boolean;
        culturalContext: string;
        translationCoverage: {
          standard: number;
          hermetic: number;
          total: number;
        };
      };
    }

    const response: TranslationResponse = {
      locale,
      timestamp: new Date().toISOString(),
    };

    // Get standard translations
    try {
      const t = await getTranslations({ locale, namespace: namespace || undefined });
      
      if (keys && keys.length > 0) {
        // Get specific keys
        const translations: Record<string, unknown> = {};
        for (const key of keys) {
          try {
            translations[key] = t(key as never);
          } catch (_error) {
            translations[key] = null; // Key not found
          }
        }
        response.translations = translations;
      } else {
        // Get all translations for the namespace
        response.translations = await getAllTranslationsForLocale();
      }
    } catch (_error) {
      console.error("Error loading standard translations:", _error);
      response.translations = {};
    }

    // Get hermetic content if requested
    if (includeHermetic) {
      try {
        const hermeticContent = HermeticContentLocalizer.getContent(locale);
        response.hermetic = hermeticContent;
      } catch (error) {
        console.error("Error loading hermetic content:", error);
        response.hermetic = null;
      }
    }

    // Include metadata if requested
    if (includeMetadata) {
      response.metadata = {
        supportedLocales: LanguageSwitcher.getSupportedLocales(),
        languageInfo: LanguageSwitcher.getLanguageDisplayInfo(locale),
        isRTL: false, // All current languages are LTR
        culturalContext: getCulturalContext(locale),
        translationCoverage: await getTranslationCoverage(locale),
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/i18n/translations
 * Update translations (admin only - for future use)
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check when implemented
    // For now, this endpoint is disabled for security
    return NextResponse.json(
      { error: "Translation updates not available in this version" },
      { status: 403 }
    );

    /*
    // Future implementation for admin users:
    const body = await req.json();
    const validation = translationUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { locale, translations, namespace, hermetic } = validation.data;

    // Update translations logic would go here
    // This would require a database table for custom translations
    // and careful validation to prevent injection attacks

    return NextResponse.json({
      success: true,
      locale,
      updated: Object.keys(translations).length,
      timestamp: new Date().toISOString(),
    });
    */
  } catch (error) {
    console.error("Translation update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/i18n/translations
 * Clear translation cache (admin only - for future use)
 */
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check and cache clearing logic
    return NextResponse.json(
      { error: "Cache clearing not available in this version" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Translation cache clear error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions

async function getAllTranslationsForLocale(): Promise<Record<string, unknown>> {
  try {
    // This would need to be implemented based on how next-intl
    // stores and retrieves all translations
    // For now, return basic structure
    return {
      common: {
        welcome: "Welcome",
        loading: "Loading...",
        error: "Error",
        success: "Success",
      },
      // Add more namespaces as needed
    };
  } catch (error) {
    console.error("Error getting all translations:", error);
    return {};
  }
}

function getCulturalContext(locale: string): string {
  const contexts: Record<string, string> = {
    en: "International/Western context with Anglo-American perspectives",
    cs: "Czech/Central European context with philosophical contemplation",
    es: "Spanish/Latin cultural context with emphasis on passion and community",
    fr: "French cultural context emphasizing intellectual rigor and artistic beauty",
    de: "German cultural context valuing systematic thinking and inner depth",
    it: "Italian cultural context emphasizing beauty, art, and passionate wisdom",
    pt: "Portuguese/Brazilian context emphasizing discovery and spiritual warmth",
  };

  return contexts[locale] || contexts.en;
}

async function getTranslationCoverage(locale: string): Promise<{
  standard: number;
  hermetic: number;
  total: number;
}> {
  try {
    // Calculate translation coverage
    const hermeticContent = HermeticContentLocalizer.getContent(locale);
    const hermeticItems = Object.keys(hermeticContent.principles).length +
                         Object.keys(hermeticContent.practices).length +
                         Object.keys(hermeticContent.mantras).length +
                         hermeticContent.wisdomQuotes.length;
    
    // Estimate standard translations (this would be more accurate with actual data)
    const estimatedStandardTranslations = 150; // Placeholder

    return {
      standard: estimatedStandardTranslations,
      hermetic: hermeticItems,
      total: estimatedStandardTranslations + hermeticItems,
    };
  } catch (error) {
    console.error("Error calculating translation coverage:", error);
    return { standard: 0, hermetic: 0, total: 0 };
  }
}