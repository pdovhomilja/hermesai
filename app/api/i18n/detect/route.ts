import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import LanguageDetector from "@/lib/i18n/detection";
import { LanguageSwitcher } from "@/lib/i18n/switcher";

// Schema for language detection requests
const detectRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  options: z.object({
    minConfidence: z.number().min(0).max(1).optional(),
    includeScores: z.boolean().optional(),
    contextualBoost: z.boolean().optional(),
    userHistory: z.array(z.string()).optional(),
    model: z.enum(['fast', 'accurate']).optional(),
  }).optional(),
  hermetic: z.boolean().default(false),
  returnSuggestions: z.boolean().default(true),
});

const batchDetectSchema = z.object({
  texts: z.array(z.string().min(1).max(2000)).max(10), // Limit batch size
  options: z.object({
    minConfidence: z.number().min(0).max(1).optional(),
    includeScores: z.boolean().optional(),
    model: z.enum(['fast', 'accurate']).optional(),
  }).optional(),
});

/**
 * POST /api/i18n/detect
 * Detect language from text input
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = detectRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { text, options = {}, hermetic, returnSuggestions } = validation.data;

    let detectionResult;

    if (hermetic) {
      // Use hermetic-aware detection for spiritual/mystical content
      detectionResult = await LanguageDetector.detectWithHermeticContext(text, options);
    } else {
      // Use standard language detection
      detectionResult = await LanguageDetector.detectLanguage(text, options);
    }

    const response: {
      detected: {
        language: string;
        confidence: number;
        reasoning?: string;
        culturalContext?: string;
      };
      timestamp: string;
      processingTime: number;
      scores?: Record<string, number>;
      suggestions?: {
        shouldSwitch: boolean;
        recommended: string;
        reason: string;
        alternatives: Array<{ language: string; confidence: number; reason: string }>;
      };
      fallback?: {
        reason: string;
        confidence: number;
      };
      metadata: {
        supportedLanguages: string[];
        confidenceLevel: string;
        modelUsed: string;
        hermeticContext: boolean;
      };
    } = {
      detected: {
        language: detectionResult.detectedLanguage,
        confidence: detectionResult.confidence,
        reasoning: detectionResult.reasoning,
        culturalContext: detectionResult.culturalContext,
      },
      timestamp: new Date().toISOString(),
      processingTime: Date.now(), // Would be calculated properly in real implementation
      metadata: {
        supportedLanguages: LanguageDetector.getSupportedLanguages(),
        confidenceLevel: LanguageDetector.getConfidenceDescription(detectionResult.confidence),
        modelUsed: options.model || 'fast',
        hermeticContext: hermetic,
      },
    };

    // Include alternative scores if requested
    if (options.includeScores && detectionResult.scores) {
      response.scores = detectionResult.scores;
    }

    // Include suggestions if requested
    if (returnSuggestions) {
      response.suggestions = generateLanguageSuggestions(detectionResult);
    }

    // Include fallback information if detection failed
    if (detectionResult.fallbackReason) {
      response.fallback = {
        reason: detectionResult.fallbackReason,
        confidence: detectionResult.confidence,
      };
    }


    return NextResponse.json(response);
  } catch (error) {
    console.error("Language detection API error:", error);
    return NextResponse.json(
      { error: "Detection failed", message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/i18n/detect
 * Batch language detection
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = batchDetectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { texts, options = {} } = validation.data;

    // Perform batch detection
    const results = await LanguageDetector.batchDetect(texts, options);

    const response = {
      results: results.map((result, index) => ({
        index,
        text: texts[index].substring(0, 100) + (texts[index].length > 100 ? '...' : ''),
        detected: {
          language: result.detectedLanguage,
          confidence: result.confidence,
          reasoning: result.reasoning,
        },
        scores: options.includeScores ? result.scores : undefined,
        fallback: result.fallbackReason ? {
          reason: result.fallbackReason,
          confidence: result.confidence,
        } : undefined,
      })),
      summary: {
        total: texts.length,
        successful: results.filter(r => r.confidence > 0.3).length,
        avgConfidence: results.reduce((acc, r) => acc + r.confidence, 0) / results.length,
        detectedLanguages: [...new Set(results.map(r => r.detectedLanguage))],
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Batch language detection API error:", error);
    return NextResponse.json(
      { error: "Batch detection failed", message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/i18n/detect/user-history
 * Detect language from user's conversation history
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This would need access to the prisma client
    // For now, return a placeholder response
    const detectedLanguage = await LanguageDetector.detectFromUserHistory(
      session.user.id,
      null // prisma would be passed here
    );

    return NextResponse.json({
      detectedLanguage,
      source: 'user-history',
      confidence: 0.8, // Placeholder
      timestamp: new Date().toISOString(),
      metadata: {
        userId: session.user.id,
        method: 'conversation-analysis',
      },
    });
  } catch (error) {
    console.error("User history detection API error:", error);
    return NextResponse.json(
      { error: "User history detection failed" },
      { status: 500 }
    );
  }
}

// Helper functions

function generateLanguageSuggestions(
  detection: {
    detectedLanguage: string;
    confidence: number;
    scores?: Record<string, number>;
  }
): {
  shouldSwitch: boolean;
  recommended: string;
  reason: string;
  alternatives: Array<{ language: string; confidence: number; reason: string }>;
} {
  const { detectedLanguage, confidence } = detection;
  
  // Generate switching suggestions
  const shouldSwitch = confidence > 0.7 && LanguageSwitcher.isSupported(detectedLanguage);
  
  const alternatives: Array<{ language: string; confidence: number; reason: string }> = [];
  if (detection.scores) {
    Object.entries(detection.scores)
      .filter(([lang, score]) => lang !== detectedLanguage && (score as number) > 0.4)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .forEach(([lang, score]) => {
        alternatives.push({
          language: lang,
          confidence: score as number,
          reason: `${Math.round((score as number) * 100)}% confidence in ${LanguageSwitcher.getLanguageName(lang)}`,
        });
      });
  }

  return {
    shouldSwitch,
    recommended: shouldSwitch ? detectedLanguage : 'en',
    reason: shouldSwitch 
      ? `High confidence (${Math.round(confidence * 100)}%) detection of ${LanguageSwitcher.getLanguageName(detectedLanguage)}`
      : 'Continue with current language',
    alternatives,
  };
}