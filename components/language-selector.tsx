"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, ChevronDown, Check, Loader2 } from "lucide-react";
import { LanguageSwitcher } from "@/lib/i18n/switcher";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  currentLocale: string;
  variant?: "default" | "compact" | "inline";
  showFlags?: boolean;
  showNativeNames?: boolean;
  className?: string;
  onLanguageChange?: (newLocale: string) => void;
}

export function LanguageSelector({
  currentLocale,
  variant = "default",
  showFlags = true,
  showNativeNames = true,
  className,
  onLanguageChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLocale, setLoadingLocale] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const supportedLanguages = LanguageSwitcher.getSupportedLocales();
  
  const handleLanguageChange = async (newLocale: string) => {
    if (newLocale === currentLocale || isLoading) return;
    
    setIsLoading(true);
    setLoadingLocale(newLocale);
    
    try {
      // Call the language switcher
      const result = await LanguageSwitcher.setLocale(newLocale);
      
      if (result.success) {
        // Close dropdown
        setIsOpen(false);
        
        // Call optional callback
        onLanguageChange?.(newLocale);
        
        // Navigate to localized URL if needed
        if (result.requiresRedirect) {
          const newPath = LanguageSwitcher.generateLocalizedUrl(
            pathname,
            newLocale,
            currentLocale
          );
          router.push(newPath);
        }
      } else {
        console.error("Language switch failed:", result.error);
      }
    } catch (error) {
      console.error("Error switching language:", error);
    } finally {
      setIsLoading(false);
      setLoadingLocale(null);
    }
  };

  const getLanguageInfo = (locale: string) => {
    return LanguageSwitcher.getLanguageDisplayInfo(locale);
  };

  const currentLanguageInfo = getLanguageInfo(currentLocale);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-language-selector]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  if (variant === "compact") {
    return (
      <div className={cn("relative", className)} data-language-selector>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="h-8 px-2 gap-1"
        >
          {showFlags && <span className="text-sm">{currentLanguageInfo.flag}</span>}
          <span className="text-xs font-medium">{currentLocale.toUpperCase()}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
        
        {isOpen && (
          <Card className="absolute top-full left-0 mt-1 z-50 min-w-[160px] shadow-lg">
            <CardContent className="p-1">
              {supportedLanguages.map((locale) => {
                const langInfo = getLanguageInfo(locale);
                const isCurrentLoading = loadingLocale === locale;
                
                return (
                  <Button
                    key={locale}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLanguageChange(locale)}
                    disabled={isLoading}
                    className={cn(
                      "w-full justify-start gap-2 h-8 px-2 text-xs",
                      locale === currentLocale && "bg-accent"
                    )}
                  >
                    {isCurrentLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        {showFlags && <span>{langInfo.flag}</span>}
                        <span>{locale.toUpperCase()}</span>
                        {locale === currentLocale && <Check className="h-3 w-3 ml-auto" />}
                      </>
                    )}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {supportedLanguages.map((locale) => {
          const langInfo = getLanguageInfo(locale);
          const isCurrentLoading = loadingLocale === locale;
          
          return (
            <Button
              key={locale}
              variant={locale === currentLocale ? "default" : "ghost"}
              size="sm"
              onClick={() => handleLanguageChange(locale)}
              disabled={isLoading}
              className="h-7 px-2 text-xs"
            >
              {isCurrentLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  {showFlags && <span className="mr-1">{langInfo.flag}</span>}
                  {showNativeNames ? langInfo.nativeName : locale.toUpperCase()}
                </>
              )}
            </Button>
          );
        })}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("relative", className)} data-language-selector>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="gap-2 min-w-[180px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {showFlags && <span>{currentLanguageInfo.flag}</span>}
          <span>
            {showNativeNames 
              ? currentLanguageInfo.nativeName 
              : currentLanguageInfo.name
            }
          </span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 z-50 w-full min-w-[220px] shadow-lg">
          <CardContent className="p-2">
            <div className="grid gap-1">
              {supportedLanguages.map((locale) => {
                const langInfo = getLanguageInfo(locale);
                const isCurrentLoading = loadingLocale === locale;
                
                return (
                  <Button
                    key={locale}
                    variant="ghost"
                    onClick={() => handleLanguageChange(locale)}
                    disabled={isLoading}
                    className={cn(
                      "justify-start gap-3 h-10 px-3",
                      locale === currentLocale && "bg-accent"
                    )}
                  >
                    {isCurrentLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          {showFlags && (
                            <span className="text-lg">{langInfo.flag}</span>
                          )}
                          <div className="flex flex-col items-start">
                            <span className="font-medium">
                              {showNativeNames ? langInfo.nativeName : langInfo.name}
                            </span>
                            {showNativeNames && langInfo.name !== langInfo.nativeName && (
                              <span className="text-xs text-muted-foreground">
                                {langInfo.name}
                              </span>
                            )}
                          </div>
                        </div>
                        {locale === currentLocale && (
                          <Check className="h-4 w-4 ml-auto text-primary" />
                        )}
                      </>
                    )}
                  </Button>
                );
              })}
            </div>
            
            <div className="mt-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Hermetic Wisdom</span>
                <Badge variant="secondary" className="text-xs">
                  AI-Powered
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Hook for using language selector in client components
export function useLanguageSelector(initialLocale: string = "en") {
  const [currentLocale, setCurrentLocale] = useState(initialLocale);
  const [isLoading, setIsLoading] = useState(false);
  
  const switchLanguage = async (newLocale: string) => {
    if (newLocale === currentLocale) return;
    
    setIsLoading(true);
    try {
      const result = await LanguageSwitcher.setLocale(newLocale);
      if (result.success) {
        setCurrentLocale(newLocale);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    currentLocale,
    switchLanguage,
    isLoading,
    supportedLanguages: LanguageSwitcher.getSupportedLocales(),
    getLanguageInfo: LanguageSwitcher.getLanguageDisplayInfo,
  };
}