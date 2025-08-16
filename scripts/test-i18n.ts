/**
 * Test script for internationalization implementation
 * Run with: npx tsx scripts/test-i18n.ts
 */

import LanguageDetector from '../lib/i18n/detection';
import { LanguageSwitcher } from '../lib/i18n/switcher';
import { HermeticContentLocalizer } from '../lib/i18n/hermetic-content';
import { LocalizedHermesResponseBuilder } from '../lib/ai/i18n/localized-response';
import RTLSupport from '../lib/i18n/rtl-support';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message?: string;
  error?: Error;
  duration?: number;
}

class I18nTester {
  private results: TestResult[] = [];

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message?: string, error?: Error, duration?: number) {
    this.results.push({ test, status, message, error, duration });
  }

  private async runTest(testName: string, testFn: () => Promise<void> | void) {
    const startTime = Date.now();
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.addResult(testName, 'PASS', undefined, undefined, duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addResult(testName, 'FAIL', error instanceof Error ? error.message : String(error), error instanceof Error ? error : undefined, duration);
    }
  }

  async testLanguageDetection() {
    console.log('\n🔍 Testing Language Detection...');

    await this.runTest('Language Detection - English', async () => {
      const result = await LanguageDetector.detectLanguage("Hello, I need guidance with understanding the hermetic principles.", {
        model: 'fast'
      });
      
      if (result.detectedLanguage !== 'en') {
        throw new Error(`Expected 'en', got '${result.detectedLanguage}'`);
      }
      
      if (result.confidence < 0.5) {
        throw new Error(`Low confidence: ${result.confidence}`);
      }
    });

    await this.runTest('Language Detection - Czech', async () => {
      const result = await LanguageDetector.detectLanguage("Dobrý den, potřebuji pomoc s pochopením hermetických principů.", {
        model: 'fast'
      });
      
      if (result.detectedLanguage !== 'cs') {
        throw new Error(`Expected 'cs', got '${result.detectedLanguage}'`);
      }
    });

    await this.runTest('Language Detection - Spanish', async () => {
      const result = await LanguageDetector.detectLanguage("Hola, necesito ayuda para entender los principios herméticos.", {
        model: 'fast'
      });
      
      if (result.detectedLanguage !== 'es') {
        throw new Error(`Expected 'es', got '${result.detectedLanguage}'`);
      }
    });

    await this.runTest('Hermetic Context Detection', async () => {
      const result = await LanguageDetector.detectWithHermeticContext(
        "The principle of correspondence teaches us that as above, so below.",
        { model: 'fast' }
      );
      
      if (!result.culturalContext) {
        throw new Error('No cultural context detected');
      }
      
      if (result.confidence < 0.3) {
        throw new Error(`Very low confidence: ${result.confidence}`);
      }
    });

    await this.runTest('Batch Detection', async () => {
      const texts = [
        "Hello world",
        "Bonjour le monde", 
        "Hola mundo",
        "Ciao mondo"
      ];
      
      const results = await LanguageDetector.batchDetect(texts, { model: 'fast' });
      
      if (results.length !== texts.length) {
        throw new Error(`Expected ${texts.length} results, got ${results.length}`);
      }
      
      const languages = results.map(r => r.detectedLanguage);
      const expectedLanguages = ['en', 'fr', 'es', 'it'];
      
      for (let i = 0; i < expectedLanguages.length; i++) {
        if (languages[i] !== expectedLanguages[i]) {
          throw new Error(`Expected ${expectedLanguages[i]}, got ${languages[i]} for text "${texts[i]}"`);
        }
      }
    });
  }

  async testLanguageSwitcher() {
    console.log('\n🔄 Testing Language Switcher...');

    await this.runTest('Supported Languages Check', () => {
      const supported = LanguageSwitcher.getSupportedLocales();
      const expected = ['en', 'cs', 'es', 'fr', 'de', 'it', 'pt'];
      
      for (const lang of expected) {
        if (!supported.includes(lang)) {
          throw new Error(`Missing supported language: ${lang}`);
        }
      }
      
      if (supported.length !== expected.length) {
        throw new Error(`Expected ${expected.length} languages, got ${supported.length}`);
      }
    });

    await this.runTest('Language Info Retrieval', () => {
      const languages = ['en', 'cs', 'es', 'fr', 'de', 'it', 'pt'];
      
      for (const lang of languages) {
        const info = LanguageSwitcher.getLanguageDisplayInfo(lang);
        
        if (!info.name) {
          throw new Error(`Missing name for language: ${lang}`);
        }
        
        if (!info.nativeName) {
          throw new Error(`Missing native name for language: ${lang}`);
        }
        
        if (!info.flag) {
          throw new Error(`Missing flag for language: ${lang}`);
        }
        
        if (typeof info.rtl !== 'boolean') {
          throw new Error(`Invalid RTL property for language: ${lang}`);
        }
      }
    });

    await this.runTest('URL Generation', () => {
      const testCases = [
        { path: '/en/chat', newLocale: 'es', currentLocale: 'en', expected: '/es/chat' },
        { path: '/fr/dashboard', newLocale: 'de', currentLocale: 'fr', expected: '/de/dashboard' },
        { path: '/', newLocale: 'cs', expected: '/cs' },
      ];
      
      for (const testCase of testCases) {
        const result = LanguageSwitcher.generateLocalizedUrl(
          testCase.path, 
          testCase.newLocale, 
          testCase.currentLocale
        );
        
        if (result !== testCase.expected) {
          throw new Error(`URL generation failed: expected "${testCase.expected}", got "${result}"`);
        }
      }
    });

    await this.runTest('Browser Locale Detection', () => {
      const testCases = [
        { acceptLanguage: 'en-US,en;q=0.9', expected: 'en' },
        { acceptLanguage: 'es-ES,es;q=0.9,en;q=0.8', expected: 'es' },
        { acceptLanguage: 'fr-FR,fr;q=0.9', expected: 'fr' },
        { acceptLanguage: 'zh-CN,zh;q=0.9', expected: 'en' }, // Fallback for unsupported
      ];
      
      for (const testCase of testCases) {
        const result = LanguageSwitcher.getBrowserLocale(testCase.acceptLanguage);
        
        if (result !== testCase.expected) {
          throw new Error(`Browser locale detection failed: expected "${testCase.expected}", got "${result}"`);
        }
      }
    });
  }

  async testHermeticContent() {
    console.log('\n📚 Testing Hermetic Content...');

    await this.runTest('Content Availability', () => {
      const supportedLocales = HermeticContentLocalizer.getSupportedLocales();
      const expectedLocales = ['en', 'cs', 'es', 'fr', 'de', 'it', 'pt'];
      
      for (const locale of expectedLocales) {
        if (!supportedLocales.includes(locale)) {
          throw new Error(`Missing hermetic content for locale: ${locale}`);
        }
        
        const content = HermeticContentLocalizer.getContent(locale);
        
        if (!content.principles) {
          throw new Error(`Missing principles for locale: ${locale}`);
        }
        
        if (!content.mantras) {
          throw new Error(`Missing mantras for locale: ${locale}`);
        }
        
        if (!content.culturalGreetings) {
          throw new Error(`Missing cultural greetings for locale: ${locale}`);
        }
      }
    });

    await this.runTest('Principle Retrieval', () => {
      const principles = ['mentalism', 'correspondence', 'vibration', 'polarity', 'rhythm', 'causeEffect', 'gender'];
      const locales = ['en', 'cs', 'es'];
      
      for (const locale of locales) {
        for (const principleKey of principles) {
          const principle = HermeticContentLocalizer.getPrinciple(locale, principleKey);
          
          if (!principle) {
            throw new Error(`Missing principle '${principleKey}' for locale: ${locale}`);
          }
          
          if (!principle.name) {
            throw new Error(`Missing name for principle '${principleKey}' in locale: ${locale}`);
          }
          
          if (!principle.core) {
            throw new Error(`Missing core for principle '${principleKey}' in locale: ${locale}`);
          }
          
          if (!principle.explanations.simple) {
            throw new Error(`Missing simple explanation for principle '${principleKey}' in locale: ${locale}`);
          }
        }
      }
    });

    await this.runTest('Mantra Retrieval', () => {
      const mantras = ['mentalism', 'correspondence', 'vibration'];
      const locales = ['en', 'es', 'fr'];
      
      for (const locale of locales) {
        for (const mantraKey of mantras) {
          const mantra = HermeticContentLocalizer.getMantra(locale, mantraKey);
          
          if (!mantra || mantra.length < 10) {
            throw new Error(`Invalid mantra '${mantraKey}' for locale: ${locale}`);
          }
        }
      }
    });

    await this.runTest('Wisdom Quotes', () => {
      const locales = ['en', 'cs', 'de', 'it'];
      
      for (const locale of locales) {
        const quote = HermeticContentLocalizer.getRandomWisdomQuote(locale);
        
        if (!quote || quote.length < 20) {
          throw new Error(`Invalid wisdom quote for locale: ${locale}`);
        }
        
        // Test multiple calls to ensure randomization works
        const quotes = new Set();
        for (let i = 0; i < 10; i++) {
          quotes.add(HermeticContentLocalizer.getRandomWisdomQuote(locale));
        }
        
        if (quotes.size === 1) {
          console.warn(`Warning: Only one unique quote found for ${locale} (might indicate limited quote pool)`);
        }
      }
    });

    await this.runTest('Emerald Tablet', () => {
      const locales = ['en', 'cs', 'es', 'pt'];
      
      for (const locale of locales) {
        const tablet = HermeticContentLocalizer.getEmeraldTablet(locale);
        
        if (!tablet.title) {
          throw new Error(`Missing Emerald Tablet title for locale: ${locale}`);
        }
        
        if (!tablet.verses || tablet.verses.length === 0) {
          throw new Error(`Missing Emerald Tablet verses for locale: ${locale}`);
        }
        
        if (!tablet.interpretation) {
          throw new Error(`Missing Emerald Tablet interpretation for locale: ${locale}`);
        }
      }
    });
  }

  async testLocalizedResponseBuilder() {
    console.log('\n🤖 Testing Localized Response Builder...');

    await this.runTest('System Prompt Generation', () => {
      const locales = ['en', 'cs', 'es', 'fr'];
      
      for (const locale of locales) {
        const builder = new LocalizedHermesResponseBuilder({
          locale,
          culturalContext: `${locale.toUpperCase()} cultural context`,
          spiritualLevel: 'seeker',
          conversationDepth: 1,
          isFirstTime: true,
        });
        
        const systemPrompt = builder.buildSystemPrompt();
        
        if (!systemPrompt.includes(locale.toUpperCase())) {
          throw new Error(`System prompt doesn't include locale context for: ${locale}`);
        }
        
        if (!systemPrompt.includes('HERMETIC PRINCIPLES')) {
          throw new Error(`System prompt missing hermetic principles section for: ${locale}`);
        }
        
        if (systemPrompt.length < 1000) {
          throw new Error(`System prompt too short for locale: ${locale}`);
        }
      }
    });

    await this.runTest('Cultural Adaptation', () => {
      const testCases = [
        { locale: 'en', expectedFormality: 'Balanced' },
        { locale: 'fr', expectedFormality: 'Formal' },
        { locale: 'de', expectedFormality: 'Formal' },
        { locale: 'es', expectedFormality: 'Respectful' },
      ];
      
      for (const testCase of testCases) {
        const builder = new LocalizedHermesResponseBuilder({
          locale: testCase.locale,
          spiritualLevel: 'seeker',
        });
        
        const systemPrompt = builder.buildSystemPrompt();
        
        if (!systemPrompt.toLowerCase().includes(testCase.expectedFormality.toLowerCase())) {
          throw new Error(`Missing expected formality "${testCase.expectedFormality}" for locale: ${testCase.locale}`);
        }
      }
    });

    await this.runTest('Depth Instructions', () => {
      const depths = ['simple', 'intermediate', 'advanced'];
      
      for (const depth of depths) {
        const builder = new LocalizedHermesResponseBuilder({
          locale: 'en',
          spiritualLevel: 'seeker',
          userPreferences: { depth: depth as any }
        });
        
        const systemPrompt = builder.buildSystemPrompt();
        
        if (depth === 'simple' && !systemPrompt.includes('simple')) {
          throw new Error(`Missing simple instructions for depth: ${depth}`);
        }
        
        if (depth === 'advanced' && !systemPrompt.includes('complex')) {
          throw new Error(`Missing complex instructions for depth: ${depth}`);
        }
      }
    });
  }

  async testRTLSupport() {
    console.log('\n📐 Testing RTL Support...');

    await this.runTest('RTL Language Detection', () => {
      const rtlLanguages = ['ar', 'he', 'fa'];
      const ltrLanguages = ['en', 'cs', 'es', 'fr'];
      
      for (const lang of rtlLanguages) {
        if (!RTLSupport.isRTLLanguage(lang)) {
          throw new Error(`Failed to detect RTL language: ${lang}`);
        }
      }
      
      for (const lang of ltrLanguages) {
        if (RTLSupport.isRTLLanguage(lang)) {
          throw new Error(`Incorrectly detected LTR language as RTL: ${lang}`);
        }
      }
    });

    await this.runTest('RTL Configuration', () => {
      const rtlConfig = RTLSupport.getRTLConfig('ar');
      
      if (!rtlConfig.isRTL) {
        throw new Error('Arabic should be detected as RTL');
      }
      
      if (rtlConfig.direction !== 'rtl') {
        throw new Error('Arabic direction should be rtl');
      }
      
      if (rtlConfig.textAlign !== 'right') {
        throw new Error('Arabic text should align right');
      }
      
      const ltrConfig = RTLSupport.getRTLConfig('en');
      
      if (ltrConfig.isRTL) {
        throw new Error('English should not be detected as RTL');
      }
      
      if (ltrConfig.direction !== 'ltr') {
        throw new Error('English direction should be ltr');
      }
    });

    await this.runTest('Tailwind RTL Classes', () => {
      const rtlClasses = RTLSupport.getTailwindRTLClasses('ar');
      
      if (rtlClasses.marginStart('4') !== 'mr-4') {
        throw new Error('RTL margin start should be mr-4');
      }
      
      if (rtlClasses.marginEnd('4') !== 'ml-4') {
        throw new Error('RTL margin end should be ml-4');
      }
      
      const ltrClasses = RTLSupport.getTailwindRTLClasses('en');
      
      if (ltrClasses.marginStart('4') !== 'ml-4') {
        throw new Error('LTR margin start should be ml-4');
      }
      
      if (ltrClasses.marginEnd('4') !== 'mr-4') {
        throw new Error('LTR margin end should be mr-4');
      }
    });

    await this.runTest('CSS Custom Properties', () => {
      const rtlProps = RTLSupport.getCSSCustomProperties('ar');
      
      if (rtlProps['--text-direction'] !== 'rtl') {
        throw new Error('RTL text direction should be rtl');
      }
      
      if (rtlProps['--start-direction'] !== 'right') {
        throw new Error('RTL start direction should be right');
      }
      
      const ltrProps = RTLSupport.getCSSCustomProperties('en');
      
      if (ltrProps['--text-direction'] !== 'ltr') {
        throw new Error('LTR text direction should be ltr');
      }
      
      if (ltrProps['--start-direction'] !== 'left') {
        throw new Error('LTR start direction should be left');
      }
    });
  }

  async runAllTests() {
    console.log('🧪 Starting I18n Implementation Tests');
    console.log('=====================================');

    const startTime = Date.now();

    try {
      await this.testLanguageDetection();
      await this.testLanguageSwitcher();
      await this.testHermeticContent();
      await this.testLocalizedResponseBuilder();
      await this.testRTLSupport();
    } catch (error) {
      console.error('❌ Test suite error:', error);
    }

    const totalTime = Date.now() - startTime;
    this.printResults(totalTime);
  }

  private printResults(totalTime: number) {
    console.log('\n📊 Test Results Summary');
    console.log('=======================');

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`🕒 Total Time: ${totalTime}ms`);
    console.log(`📈 Success Rate: ${Math.round((passed / this.results.length) * 100)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      console.log('================');
      
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(result => {
          console.log(`\n🔴 ${result.test}`);
          console.log(`   Message: ${result.message}`);
          if (result.error && process.env.NODE_ENV === 'development') {
            console.log(`   Error: ${result.error.stack}`);
          }
        });
    }

    if (passed === this.results.length) {
      console.log('\n🎉 All tests passed! I18n implementation is ready.');
    } else {
      console.log(`\n⚠️  ${failed} test(s) failed. Please review and fix issues.`);
      process.exit(1);
    }
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const tester = new I18nTester();
  tester.runAllTests().catch(console.error);
}

export default I18nTester;