import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LanguageDetector from "./detection";

export interface LanguageSwitchResult {
  success: boolean;
  newLanguage: string;
  previousLanguage?: string;
  requiresRedirect?: boolean;
  culturalAdaptation?: string;
  error?: string;
}

export interface SwitchOptions {
  updateUserPreference?: boolean;
  forceSwitch?: boolean;
  detectIfAmbiguous?: boolean;
  culturalContext?: string;
}

export class LanguageSwitcher {
  static readonly COOKIE_NAME = "ialchemist-locale";
  static readonly SUPPORTED_LOCALES = [
    "en", "cs", "es", "fr", "de", "it", "pt"
  ];
  static readonly COOKIE_OPTIONS = {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production"
  };

  /**
   * Get the current locale with priority handling
   */
  static async getLocale(userId?: string, prisma?: any): Promise<string> {
    // Priority: User preference > Cookie > Browser > Default

    try {
      if (userId && prisma) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { preferredLanguage: true }
        });

        if (user?.preferredLanguage && this.isSupported(user.preferredLanguage)) {
          return user.preferredLanguage;
        }
      }

      // Check cookie
      const cookieStore = await cookies();
      const localeCookie = cookieStore.get(this.COOKIE_NAME);

      if (localeCookie && this.isSupported(localeCookie.value)) {
        return localeCookie.value;
      }

      // Default fallback
      return "en";
    } catch (error) {
      console.error("Error getting locale:", error);
      return "en";
    }
  }

  /**
   * Set locale with comprehensive update strategy
   */
  static async setLocale(
    locale: string, 
    userId?: string, 
    prisma?: any,
    options: SwitchOptions = {}
  ): Promise<LanguageSwitchResult> {
    if (!this.isSupported(locale)) {
      return {
        success: false,
        newLanguage: locale,
        error: `Unsupported locale: ${locale}`
      };
    }

    const previousLanguage = await this.getLocale(userId, prisma);
    
    try {
      // Update cookie
      const cookieStore = await cookies();
      cookieStore.set(this.COOKIE_NAME, locale, this.COOKIE_OPTIONS);

      // Update user preference if logged in and requested
      if (userId && prisma && options.updateUserPreference !== false) {
        await prisma.user.update({
          where: { id: userId },
          data: { preferredLanguage: locale }
        });
      }

      return {
        success: true,
        newLanguage: locale,
        previousLanguage,
        requiresRedirect: previousLanguage !== locale,
        culturalAdaptation: options.culturalContext
      };

    } catch (error) {
      console.error("Error setting locale:", error);
      return {
        success: false,
        newLanguage: locale,
        previousLanguage,
        error: `Failed to set locale: ${error}`
      };
    }
  }

  /**
   * Smart locale detection and switching based on user input
   */
  static async smartSwitch(
    userInput: string,
    currentLocale: string,
    userId?: string,
    prisma?: any,
    options: SwitchOptions = {}
  ): Promise<LanguageSwitchResult> {
    try {
      // Use AI-based detection to determine if user switched languages
      const detection = await LanguageDetector.routeBasedDetection(userInput, {
        previousLanguage: currentLocale,
        acceptLanguage: currentLocale
      });

      // Only switch if detection is confident and different from current
      const shouldSwitch = (
        detection.confidence > 0.7 && 
        detection.detectedLanguage !== currentLocale
      ) || options.forceSwitch;

      if (!shouldSwitch) {
        return {
          success: false,
          newLanguage: currentLocale,
          previousLanguage: currentLocale,
          error: `No language switch needed (confidence: ${detection.confidence})`
        };
      }

      // Perform the switch
      return this.setLocale(
        detection.detectedLanguage, 
        userId, 
        prisma, 
        {
          ...options,
          culturalContext: detection.culturalContext
        }
      );

    } catch (error) {
      console.error("Smart switch failed:", error);
      return {
        success: false,
        newLanguage: currentLocale,
        error: `Smart switch failed: ${error}`
      };
    }
  }

  /**
   * Handle browser-based locale preferences
   */
  static getBrowserLocale(acceptLanguage?: string): string {
    if (!acceptLanguage) return "en";

    // Parse Accept-Language header
    const languages = acceptLanguage
      .split(",")
      .map(lang => {
        const [code, qValue] = lang.trim().split(";q=");
        return {
          code: code.split("-")[0].toLowerCase(), // Remove region codes
          quality: qValue ? parseFloat(qValue) : 1.0
        };
      })
      .filter(lang => this.isSupported(lang.code))
      .sort((a, b) => b.quality - a.quality);

    return languages.length > 0 ? languages[0].code : "en";
  }

  /**
   * Advanced switching with conversation context
   */
  static async contextualSwitch(
    conversationHistory: string[],
    currentMessage: string,
    currentLocale: string,
    userId?: string,
    prisma?: any
  ): Promise<LanguageSwitchResult> {
    try {
      // Analyze conversation patterns
      const recentMessages = conversationHistory.slice(-5).join(" ");
      const fullContext = recentMessages + " " + currentMessage;

      // Use hermetic context detection for more accurate language switching
      const detection = await LanguageDetector.detectWithHermeticContext(
        fullContext,
        { contextualBoost: true, model: 'accurate' }
      );

      // More conservative switching for conversations
      const shouldSwitch = (
        detection.confidence > 0.8 && 
        detection.detectedLanguage !== currentLocale &&
        conversationHistory.length < 3 // Only switch early in conversation
      );

      if (!shouldSwitch) {
        return {
          success: false,
          newLanguage: currentLocale,
          previousLanguage: currentLocale
        };
      }

      return this.setLocale(detection.detectedLanguage, userId, prisma, {
        updateUserPreference: true,
        culturalContext: detection.culturalContext
      });

    } catch (error) {
      console.error("Contextual switch failed:", error);
      return {
        success: false,
        newLanguage: currentLocale,
        error: `Contextual switch failed: ${error}`
      };
    }
  }

  /**
   * Batch update user preferences
   */
  static async updateUserLanguagePreferences(
    updates: Array<{ userId: string; language: string }>,
    prisma: any
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const { userId, language } of updates) {
      if (!this.isSupported(language)) {
        failed++;
        errors.push(`Invalid language for user ${userId}: ${language}`);
        continue;
      }

      try {
        await prisma.user.update({
          where: { id: userId },
          data: { preferredLanguage: language }
        });
        success++;
      } catch (error) {
        failed++;
        errors.push(`Failed to update user ${userId}: ${error}`);
      }
    }

    return { success, failed, errors };
  }

  /**
   * Generate locale-aware URLs
   */
  static generateLocalizedUrl(
    pathname: string, 
    newLocale: string, 
    currentLocale?: string
  ): string {
    // Remove current locale prefix if exists
    let cleanPath = pathname;
    if (currentLocale && pathname.startsWith(`/${currentLocale}`)) {
      cleanPath = pathname.slice(`/${currentLocale}`.length) || "/";
    }

    // Add new locale prefix
    return `/${newLocale}${cleanPath}`;
  }

  /**
   * Middleware helper for locale detection
   */
  static async middlewareLocaleDetection(
    request: Request,
    currentPath: string
  ): Promise<{
    locale: string;
    shouldRedirect: boolean;
    redirectUrl?: string;
  }> {
    try {
      // Extract locale from path
      const pathSegments = currentPath.split("/").filter(Boolean);
      const pathLocale = pathSegments[0];

      // Check if path already has a supported locale
      if (this.isSupported(pathLocale)) {
        return {
          locale: pathLocale,
          shouldRedirect: false
        };
      }

      // Detect from browser preferences
      const acceptLanguage = request.headers.get("accept-language") || undefined;
      const browserLocale = this.getBrowserLocale(acceptLanguage);

      // Check cookies
      const cookieHeader = request.headers.get("cookie") || "";
      const cookies = this.parseCookies(cookieHeader);
      const cookieLocale = cookies[this.COOKIE_NAME];

      // Determine final locale
      const finalLocale = (cookieLocale && this.isSupported(cookieLocale)) 
        ? cookieLocale 
        : browserLocale;

      return {
        locale: finalLocale,
        shouldRedirect: true,
        redirectUrl: this.generateLocalizedUrl(currentPath, finalLocale)
      };

    } catch (error) {
      console.error("Middleware locale detection failed:", error);
      return {
        locale: "en",
        shouldRedirect: false
      };
    }
  }

  /**
   * Language switching with redirect handling
   */
  static async switchAndRedirect(
    newLocale: string,
    currentPath: string,
    userId?: string,
    prisma?: any
  ): Promise<never> {
    const result = await this.setLocale(newLocale, userId, prisma);
    
    if (result.success) {
      const newUrl = this.generateLocalizedUrl(
        currentPath, 
        newLocale, 
        result.previousLanguage
      );
      redirect(newUrl);
    } else {
      // Fallback redirect to current locale
      redirect(currentPath);
    }
  }

  // Utility methods
  static isSupported(locale: string): boolean {
    return this.SUPPORTED_LOCALES.includes(locale?.toLowerCase());
  }

  static getSupportedLocales(): string[] {
    return [...this.SUPPORTED_LOCALES];
  }

  static getLanguageName(locale: string): string {
    const names: Record<string, string> = {
      en: "English",
      cs: "Čeština",
      es: "Español", 
      fr: "Français",
      de: "Deutsch",
      it: "Italiano",
      pt: "Português"
    };
    return names[locale] || "English";
  }

  static getLanguageDisplayInfo(locale: string) {
    const info: Record<string, { name: string; nativeName: string; flag: string; rtl: boolean }> = {
      en: { name: "English", nativeName: "English", flag: "🇬🇧", rtl: false },
      cs: { name: "Czech", nativeName: "Čeština", flag: "🇨🇿", rtl: false },
      es: { name: "Spanish", nativeName: "Español", flag: "🇪🇸", rtl: false },
      fr: { name: "French", nativeName: "Français", flag: "🇫🇷", rtl: false },
      de: { name: "German", nativeName: "Deutsch", flag: "🇩🇪", rtl: false },
      it: { name: "Italian", nativeName: "Italiano", flag: "🇮🇹", rtl: false },
      pt: { name: "Portuguese", nativeName: "Português", flag: "🇵🇹", rtl: false }
    };
    return info[locale] || info.en;
  }

  /**
   * Validate locale switching permissions
   */
  static async canSwitchLocale(
    userId: string,
    targetLocale: string,
    prisma: any
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (!this.isSupported(targetLocale)) {
      return { allowed: false, reason: "Unsupported locale" };
    }

    // Add any business logic here (subscription checks, user permissions, etc.)
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, subscription: { select: { plan: true } } }
      });

      if (!user) {
        return { allowed: false, reason: "User not found" };
      }

      // All supported languages are available for all users
      return { allowed: true };

    } catch (error) {
      console.error("Permission check failed:", error);
      return { allowed: false, reason: "Permission check failed" };
    }
  }

  // Private helper methods
  private static parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    cookieHeader.split(";").forEach(cookie => {
      const [name, value] = cookie.trim().split("=");
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    
    return cookies;
  }
}

// Export convenience functions
export const getLocale = LanguageSwitcher.getLocale;
export const setLocale = LanguageSwitcher.setLocale;
export const smartSwitch = LanguageSwitcher.smartSwitch;
export const isSupported = LanguageSwitcher.isSupported;

export default LanguageSwitcher;