/**
 * RTL (Right-to-Left) Language Support Utilities
 * Prepared for future Arabic, Hebrew, and other RTL language support
 */

export interface RTLConfig {
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  textAlign: 'left' | 'right';
  marginStart: 'ml' | 'mr';
  marginEnd: 'mr' | 'ml';
  paddingStart: 'pl' | 'pr';
  paddingEnd: 'pr' | 'pl';
  borderStart: 'border-l' | 'border-r';
  borderEnd: 'border-r' | 'border-l';
  roundedStart: 'rounded-l' | 'rounded-r';
  roundedEnd: 'rounded-r' | 'rounded-l';
}

// RTL languages that might be supported in the future
const RTL_LANGUAGES = [
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian
  'ur', // Urdu
  'ps', // Pashto
  'sd', // Sindhi
  'ku', // Kurdish
  'dv', // Dhivehi
  'yi', // Yiddish
];

// Currently supported languages (all LTR)
const CURRENT_SUPPORTED_LANGUAGES = [
  'en', // English
  'cs', // Czech
  'es', // Spanish
  'fr', // French
  'de', // German
  'it', // Italian
  'pt', // Portuguese
];

export class RTLSupport {
  /**
   * Check if a language is RTL
   */
  static isRTLLanguage(languageCode: string): boolean {
    return RTL_LANGUAGES.includes(languageCode.toLowerCase());
  }

  /**
   * Get RTL configuration for a language
   */
  static getRTLConfig(languageCode: string): RTLConfig {
    const isRTL = this.isRTLLanguage(languageCode);
    
    return {
      isRTL,
      direction: isRTL ? 'rtl' : 'ltr',
      textAlign: isRTL ? 'right' : 'left',
      marginStart: isRTL ? 'mr' : 'ml',
      marginEnd: isRTL ? 'ml' : 'mr',
      paddingStart: isRTL ? 'pr' : 'pl',
      paddingEnd: isRTL ? 'pl' : 'pr',
      borderStart: isRTL ? 'border-r' : 'border-l',
      borderEnd: isRTL ? 'border-l' : 'border-r',
      roundedStart: isRTL ? 'rounded-r' : 'rounded-l',
      roundedEnd: isRTL ? 'rounded-l' : 'rounded-r',
    };
  }

  /**
   * Get Tailwind CSS classes for RTL support
   */
  static getTailwindRTLClasses(languageCode: string) {
    const config = this.getRTLConfig(languageCode);
    
    return {
      // Direction classes
      textDirection: config.direction === 'rtl' ? 'direction-rtl' : 'direction-ltr',
      textAlign: config.textAlign === 'right' ? 'text-right' : 'text-left',
      
      // Spacing utilities that work with both LTR and RTL
      marginStart: (size: string) => config.isRTL ? `mr-${size}` : `ml-${size}`,
      marginEnd: (size: string) => config.isRTL ? `ml-${size}` : `mr-${size}`,
      paddingStart: (size: string) => config.isRTL ? `pr-${size}` : `pl-${size}`,
      paddingEnd: (size: string) => config.isRTL ? `pl-${size}` : `pr-${size}`,
      
      // Border utilities
      borderStart: (weight?: string) => 
        config.isRTL ? `border-r${weight ? `-${weight}` : ''}` : `border-l${weight ? `-${weight}` : ''}`,
      borderEnd: (weight?: string) => 
        config.isRTL ? `border-l${weight ? `-${weight}` : ''}` : `border-r${weight ? `-${weight}` : ''}`,
      
      // Rounded corners
      roundedStart: (size?: string) => 
        config.isRTL ? `rounded-r${size ? `-${size}` : ''}` : `rounded-l${size ? `-${size}` : ''}`,
      roundedEnd: (size?: string) => 
        config.isRTL ? `rounded-l${size ? `-${size}` : ''}` : `rounded-r${size ? `-${size}` : ''}`,
    };
  }

  /**
   * Get CSS custom properties for RTL support
   */
  static getCSSCustomProperties(languageCode: string): Record<string, string> {
    const config = this.getRTLConfig(languageCode);
    
    return {
      '--text-direction': config.direction,
      '--text-align': config.textAlign,
      '--start-direction': config.isRTL ? 'right' : 'left',
      '--end-direction': config.isRTL ? 'left' : 'right',
    };
  }

  /**
   * Apply RTL-aware flex direction
   */
  static getFlexDirection(languageCode: string, baseDirection: 'row' | 'col' = 'row') {
    const isRTL = this.isRTLLanguage(languageCode);
    
    if (baseDirection === 'col') {
      return 'flex-col'; // Column direction is not affected by RTL
    }
    
    return isRTL ? 'flex-row-reverse' : 'flex-row';
  }

  /**
   * Get RTL-aware positioning classes
   */
  static getPositionClasses(languageCode: string) {
    const isRTL = this.isRTLLanguage(languageCode);
    
    return {
      start: isRTL ? 'right' : 'left',
      end: isRTL ? 'left' : 'right',
      textAlignStart: isRTL ? 'text-right' : 'text-left',
      textAlignEnd: isRTL ? 'text-left' : 'text-right',
    };
  }

  /**
   * Get icon rotation for RTL languages
   * Some icons need to be flipped horizontally in RTL layouts
   */
  static getIconTransform(languageCode: string, iconType: 'arrow' | 'chevron' | 'caret' | 'none' = 'none') {
    const isRTL = this.isRTLLanguage(languageCode);
    
    if (!isRTL || iconType === 'none') {
      return '';
    }
    
    // Icons that should be flipped in RTL
    const shouldFlip = ['arrow', 'chevron', 'caret'].includes(iconType);
    
    return shouldFlip ? 'transform scale-x-[-1]' : '';
  }

  /**
   * Get animation direction for RTL
   */
  static getAnimationDirection(languageCode: string, animation: 'slide' | 'fade' | 'none' = 'none') {
    const isRTL = this.isRTLLanguage(languageCode);
    
    if (animation === 'slide' && isRTL) {
      return {
        slideIn: 'slide-in-from-left',
        slideOut: 'slide-out-to-left',
      };
    }
    
    return {
      slideIn: 'slide-in-from-right',
      slideOut: 'slide-out-to-right',
    };
  }

  /**
   * Future expansion: Get hermetic content RTL adaptations
   */
  static getHermeticContentAdaptations(languageCode: string) {
    const isRTL = this.isRTLLanguage(languageCode);
    
    return {
      textFlow: isRTL ? 'rtl' : 'ltr',
      readingOrder: isRTL ? 'right-to-left' : 'left-to-right',
      
      // Hermetic symbols that might need adaptation
      symbolOrientation: isRTL ? 'mirrored' : 'standard',
      
      // Chat bubble positioning
      userMessageAlign: isRTL ? 'left' : 'right',
      assistantMessageAlign: isRTL ? 'right' : 'left',
      
      // Typography enhancements for RTL
      lineHeight: isRTL ? '1.8' : '1.6', // RTL languages often need more line height
      letterSpacing: isRTL ? '0.02em' : '0', // Some RTL languages benefit from letter spacing
    };
  }

  /**
   * Validate if RTL is properly supported for a language
   */
  static isRTLSupported(languageCode: string): boolean {
    // Currently, no RTL languages are fully implemented
    // This will return true when we add RTL language support
    return false;
  }

  /**
   * Get supported languages with RTL status
   */
  static getSupportedLanguagesWithRTL() {
    return CURRENT_SUPPORTED_LANGUAGES.map(lang => ({
      code: lang,
      isRTL: this.isRTLLanguage(lang),
      isSupported: true,
      direction: this.getRTLConfig(lang).direction,
    }));
  }

  /**
   * Prepare RTL CSS variables for injection
   */
  static generateRTLCSSVariables(languageCode: string): string {
    const properties = this.getCSSCustomProperties(languageCode);
    
    return Object.entries(properties)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n  ');
  }
}

/**
 * React hook for RTL support (future use)
 */
export function useRTL(languageCode: string) {
  const config = RTLSupport.getRTLConfig(languageCode);
  const tailwindClasses = RTLSupport.getTailwindRTLClasses(languageCode);
  const positionClasses = RTLSupport.getPositionClasses(languageCode);
  
  return {
    isRTL: config.isRTL,
    direction: config.direction,
    config,
    classes: tailwindClasses,
    positions: positionClasses,
    getIconTransform: (iconType?: 'arrow' | 'chevron' | 'caret') => 
      RTLSupport.getIconTransform(languageCode, iconType),
    getFlexDirection: (baseDirection?: 'row' | 'col') => 
      RTLSupport.getFlexDirection(languageCode, baseDirection),
    hermeticAdaptations: RTLSupport.getHermeticContentAdaptations(languageCode),
  };
}

export default RTLSupport;