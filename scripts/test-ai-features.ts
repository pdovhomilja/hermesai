#!/usr/bin/env tsx

import { aiFeaturesTestRunner } from "@/lib/testing/ai-features-test-suite";
import logger from "@/lib/logger";

async function runTests() {
  console.log("🧪 Starting AI Features Test Suite...\n");
  
  try {
    const report = await aiFeaturesTestRunner.runAllTests();
    
    console.log("\n📊 Test Results Summary:");
    console.log("========================");
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`✅ Passed: ${report.passed}`);
    console.log(`❌ Failed: ${report.failed}`);
    console.log(`⏱️  Duration: ${report.duration}ms`);
    console.log(`📅 Timestamp: ${report.timestamp.toISOString()}\n`);
    
    console.log("🔍 System Health Check:");
    console.log("=======================");
    console.log(`Database: ${report.systemHealth.databaseConnectivity ? '✅ Connected' : '❌ Failed'}`);
    console.log(`Memory Usage: ${Math.round(report.systemHealth.memoryUsage)}MB`);
    console.log(`Error Rate: ${Math.round(report.systemHealth.errorRate * 100)}%\n`);
    
    if (report.failed > 0) {
      console.log("❌ Failed Tests:");
      console.log("===============");
      report.results
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`- ${result.testName}: ${result.error}`);
        });
      console.log();
    }
    
    console.log("🎯 Test Suite Categories:");
    console.log("=========================");
    const categories = new Map<string, { passed: number; total: number }>();
    
    report.results.forEach(result => {
      const category = result.feature.includes('_') 
        ? result.feature.split('_')[0] 
        : result.feature;
      
      if (!categories.has(category)) {
        categories.set(category, { passed: 0, total: 0 });
      }
      
      const stats = categories.get(category)!;
      stats.total++;
      if (result.passed) stats.passed++;
    });
    
    categories.forEach((stats, category) => {
      const percentage = Math.round((stats.passed / stats.total) * 100);
      const status = stats.passed === stats.total ? '✅' : '⚠️';
      console.log(`${status} ${category}: ${stats.passed}/${stats.total} (${percentage}%)`);
    });
    
    if (report.passed === report.totalTests) {
      console.log("\n🎉 All tests passed! Phase 8 Advanced AI Features are ready for production.");
    } else {
      console.log(`\n⚠️ ${report.failed} tests need attention before deployment.`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error("💥 Test suite execution failed:");
    console.error(error);
    process.exit(1);
  }
}

runTests();