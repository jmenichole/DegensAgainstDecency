/**
 * AI Gateway Tests
 * Run with: node test-ai-gateway.js
 */

require('dotenv').config();
const VercelAIGateway = require('./src/AIGateway');
const AICardGenerator = require('./src/AICardGenerator');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log('\n🧪 Running AI Gateway Tests\n');
console.log('━━━ AI Gateway Initialization Tests ━━━');

const aiGateway = new VercelAIGateway();
assert(aiGateway !== null, 'AI Gateway instantiation');
assert(typeof aiGateway.isEnabled === 'function', 'AI Gateway has isEnabled method');
assert(typeof aiGateway.generateText === 'function', 'AI Gateway has generateText method');
assert(typeof aiGateway.getStatistics === 'function', 'AI Gateway has getStatistics method');

console.log(`\n📊 AI Gateway Status: ${aiGateway.isEnabled() ? 'ENABLED' : 'DISABLED'}`);
console.log(`📊 Enabled Providers: ${aiGateway.enabledProviders.join(', ') || 'none'}`);

console.log('\n━━━ Configuration Tests ━━━');
assert(aiGateway.providers !== undefined, 'Providers configuration exists');
assert(aiGateway.statistics !== undefined, 'Statistics object exists');
assert(aiGateway.costLimits !== undefined, 'Cost limits configuration exists');
assert(aiGateway.costLimits.daily > 0, 'Daily cost limit is set');

console.log('\n━━━ Statistics Tests ━━━');
const initialStats = aiGateway.getStatistics();
assert(initialStats !== null, 'Get initial statistics');
assert(initialStats.totalRequests === 0, 'Initial total requests is 0');
assert(initialStats.totalCost === 0, 'Initial total cost is 0');

console.log('\n━━━ AI Card Generator Integration Tests ━━━');
const cardGenerator = new AICardGenerator();
assert(cardGenerator !== null, 'AI Card Generator instantiation');
assert(cardGenerator.aiGateway !== undefined, 'Card Generator has AI Gateway instance');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 TEST SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${passed + failed > 0 ? ((passed / (passed + failed)) * 100).toFixed(1) : 0}%`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (failed === 0) {
  console.log('🎉 All tests passed!\n');
} else {
  console.log('⚠️  Some tests failed.\n');
}
