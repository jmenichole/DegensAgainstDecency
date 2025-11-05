/**
 * Basic validation tests for game logic
 * Run with: node test-validation.js
 */

const PokerGame = require('./src/games/PokerGame');
const DegensAgainstDecencyGame = require('./src/games/DegensAgainstDecencyGame');
const TwoTruthsAndALieGame = require('./src/games/TwoTruthsAndALieGame');
const BaseGame = require('./src/games/BaseGame');

// Test counter
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

console.log('\n🧪 Running Game Logic Validation Tests\n');

// ===== POKER HAND EVALUATION TESTS =====
console.log('━━━ Poker Hand Evaluation Tests ━━━');

const creator = { id: 'test-1', username: 'TestPlayer' };
const pokerGame = new PokerGame('test-game', creator, false, 4);

// Test High Card
const highCardHand = [
  { suit: 'hearts', rank: 'A', value: 14 },
  { suit: 'diamonds', rank: 'K', value: 13 },
  { suit: 'clubs', rank: 'Q', value: 12 },
  { suit: 'spades', rank: 'J', value: 11 },
  { suit: 'hearts', rank: '9', value: 9 }
];
const highCardResult = pokerGame.evaluateHand(highCardHand);
assert(highCardResult.type === 'high-card', 'Poker: High card detection');

// Test Pair
const pairHand = [
  { suit: 'hearts', rank: 'A', value: 14 },
  { suit: 'diamonds', rank: 'A', value: 14 },
  { suit: 'clubs', rank: 'K', value: 13 },
  { suit: 'spades', rank: 'Q', value: 12 },
  { suit: 'hearts', rank: 'J', value: 11 }
];
const pairResult = pokerGame.evaluateHand(pairHand);
assert(pairResult.type === 'pair', 'Poker: Pair detection');

// Test Two Pair
const twoPairHand = [
  { suit: 'hearts', rank: 'A', value: 14 },
  { suit: 'diamonds', rank: 'A', value: 14 },
  { suit: 'clubs', rank: 'K', value: 13 },
  { suit: 'spades', rank: 'K', value: 13 },
  { suit: 'hearts', rank: 'Q', value: 12 }
];
const twoPairResult = pokerGame.evaluateHand(twoPairHand);
assert(twoPairResult.type === 'two-pair', 'Poker: Two pair detection');

// Test Three of a Kind
const threeKindHand = [
  { suit: 'hearts', rank: 'A', value: 14 },
  { suit: 'diamonds', rank: 'A', value: 14 },
  { suit: 'clubs', rank: 'A', value: 14 },
  { suit: 'spades', rank: 'K', value: 13 },
  { suit: 'hearts', rank: 'Q', value: 12 }
];
const threeKindResult = pokerGame.evaluateHand(threeKindHand);
assert(threeKindResult.type === 'three-of-a-kind', 'Poker: Three of a kind detection');

// Test Straight
const straightHand = [
  { suit: 'hearts', rank: '10', value: 10 },
  { suit: 'diamonds', rank: '9', value: 9 },
  { suit: 'clubs', rank: '8', value: 8 },
  { suit: 'spades', rank: '7', value: 7 },
  { suit: 'hearts', rank: '6', value: 6 }
];
const straightResult = pokerGame.evaluateHand(straightHand);
assert(straightResult.type === 'straight', 'Poker: Straight detection');

// Test Flush
const flushHand = [
  { suit: 'hearts', rank: 'A', value: 14 },
  { suit: 'hearts', rank: 'K', value: 13 },
  { suit: 'hearts', rank: 'Q', value: 12 },
  { suit: 'hearts', rank: 'J', value: 11 },
  { suit: 'hearts', rank: '9', value: 9 }
];
const flushResult = pokerGame.evaluateHand(flushHand);
assert(flushResult.type === 'flush', 'Poker: Flush detection');

// Test Full House
const fullHouseHand = [
  { suit: 'hearts', rank: 'A', value: 14 },
  { suit: 'diamonds', rank: 'A', value: 14 },
  { suit: 'clubs', rank: 'A', value: 14 },
  { suit: 'spades', rank: 'K', value: 13 },
  { suit: 'hearts', rank: 'K', value: 13 }
];
const fullHouseResult = pokerGame.evaluateHand(fullHouseHand);
assert(fullHouseResult.type === 'full-house', 'Poker: Full house detection');

// Test Four of a Kind
const fourKindHand = [
  { suit: 'hearts', rank: 'A', value: 14 },
  { suit: 'diamonds', rank: 'A', value: 14 },
  { suit: 'clubs', rank: 'A', value: 14 },
  { suit: 'spades', rank: 'A', value: 14 },
  { suit: 'hearts', rank: 'K', value: 13 }
];
const fourKindResult = pokerGame.evaluateHand(fourKindHand);
assert(fourKindResult.type === 'four-of-a-kind', 'Poker: Four of a kind detection');

// Test Straight Flush
const straightFlushHand = [
  { suit: 'hearts', rank: '10', value: 10 },
  { suit: 'hearts', rank: '9', value: 9 },
  { suit: 'hearts', rank: '8', value: 8 },
  { suit: 'hearts', rank: '7', value: 7 },
  { suit: 'hearts', rank: '6', value: 6 }
];
const straightFlushResult = pokerGame.evaluateHand(straightFlushHand);
assert(straightFlushResult.type === 'straight-flush', 'Poker: Straight flush detection');

// Test Wheel Straight (A-2-3-4-5)
const wheelHand = [
  { suit: 'hearts', rank: 'A', value: 14 },
  { suit: 'diamonds', rank: '5', value: 5 },
  { suit: 'clubs', rank: '4', value: 4 },
  { suit: 'spades', rank: '3', value: 3 },
  { suit: 'hearts', rank: '2', value: 2 }
];
const wheelResult = pokerGame.evaluateHand(wheelHand);
assert(wheelResult.type === 'straight', 'Poker: Wheel straight (A-2-3-4-5) detection');

// Test Hand Comparison
const weakPair = [
  { suit: 'hearts', rank: '3', value: 3 },
  { suit: 'diamonds', rank: '3', value: 3 },
  { suit: 'clubs', rank: 'K', value: 13 },
  { suit: 'spades', rank: 'Q', value: 12 },
  { suit: 'hearts', rank: 'J', value: 11 }
];
const weakPairResult = pokerGame.evaluateHand(weakPair);
assert(pairResult.value > weakPairResult.value, 'Poker: Hand comparison (pair of Aces > pair of 3s)');
assert(straightResult.value > pairResult.value, 'Poker: Hand comparison (straight > pair)');

// ===== BASE GAME TESTS =====
console.log('\n━━━ Base Game Tests ━━━');

const baseGame = new BaseGame('test-base', creator, false, 7);

// Test player addition
const player2 = { id: 'test-2', username: 'Player2' };
const addResult = baseGame.addPlayer(player2, null);
assert(addResult.success === true, 'BaseGame: Add player success');
assert(baseGame.players.length === 2, 'BaseGame: Player count correct');

// Test duplicate player
const dupResult = baseGame.addPlayer(player2, null);
assert(dupResult.success === false, 'BaseGame: Reject duplicate player');

// Test max players
for (let i = 3; i <= 7; i++) {
  baseGame.addPlayer({ id: `test-${i}`, username: `Player${i}` }, null);
}
const overflowResult = baseGame.addPlayer({ id: 'test-8', username: 'Player8' }, null);
assert(overflowResult.success === false, 'BaseGame: Reject when game is full');
assert(baseGame.players.length === 7, 'BaseGame: Max 7 players enforced');

// ===== DEGENS AGAINST DECENCY TESTS =====
console.log('\n━━━ Degens Against Decency Tests ━━━');

const degensGame = new DegensAgainstDecencyGame('test-degens', creator, false, 5);
assert(degensGame.type === 'degens-against-decency', 'Degens: Game type correct');
assert(degensGame.cardsPerHand === 7, 'Degens: Cards per hand is 7');
assert(degensGame.maxRounds === 10, 'Degens: Max rounds is 10');

const degensPlayer2 = { id: 'degens-2', username: 'DegensPlayer2' };
degensGame.addPlayer(degensPlayer2, null);
assert(degensGame.players.length === 2, 'Degens: Players added correctly');

// Test game state
const degensState = degensGame.getGameState();
assert(degensState.id === 'test-degens', 'Degens: Game state ID correct');
assert(degensState.type === 'degens-against-decency', 'Degens: Game state type correct');
assert(degensState.players.length === 2, 'Degens: Game state players correct');

// ===== TWO TRUTHS AND A LIE TESTS =====
console.log('\n━━━ Two Truths and a Lie Tests ━━━');

const twoTruthsGame = new TwoTruthsAndALieGame('test-2truths', creator, false, 5);
assert(twoTruthsGame.type === '2-truths-and-a-lie', '2Truths: Game type correct');
assert(twoTruthsGame.maxRounds === 5, '2Truths: Max rounds is 5');
assert(twoTruthsGame.pointsForCorrectGuess === 10, '2Truths: Points for correct guess is 10');
assert(twoTruthsGame.pointsForFoolingOthers === 5, '2Truths: Points for fooling is 5');

const truthsPlayer2 = { id: '2truths-2', username: '2TruthsPlayer2' };
twoTruthsGame.addPlayer(truthsPlayer2, null);

// Test statement submission
const statements = ['I love coding', 'I hate pizza', 'I own a cat'];
const submitResult = twoTruthsGame.submitStatements(statements);
assert(submitResult.success === true, '2Truths: Submit statements success');
assert(twoTruthsGame.statements.length === 3, '2Truths: Statements stored correctly');

// Test invalid statements
const invalidResult = twoTruthsGame.submitStatements(['Only', 'Two']);
assert(invalidResult.success === false, '2Truths: Reject invalid statement count');

// Test game state
const truthsState = twoTruthsGame.getGameState();
assert(truthsState.type === '2-truths-and-a-lie', '2Truths: Game state type correct');
assert(truthsState.statements.length === 3, '2Truths: Game state statements correct');

// ===== POKER GAME CREATION TESTS =====
console.log('\n━━━ Poker Game Creation Tests ━━━');

const pokerGameFull = new PokerGame('test-poker-full', creator, false, 6);
assert(pokerGameFull.type === 'poker', 'Poker: Game type correct');
assert(pokerGameFull.variant === '5-card-stud', 'Poker: Variant is 5-card-stud');
assert(pokerGameFull.smallBlind === 5, 'Poker: Small blind is 5');
assert(pokerGameFull.bigBlind === 10, 'Poker: Big blind is 10');

// Test deck creation
pokerGameFull.createDeck();
assert(pokerGameFull.deck.length === 52, 'Poker: Deck has 52 cards');

// Verify all unique cards
const cardIds = new Set(pokerGameFull.deck.map(c => c.id));
assert(cardIds.size === 52, 'Poker: All cards are unique');

// Verify suits
const hearts = pokerGameFull.deck.filter(c => c.suit === 'hearts');
const diamonds = pokerGameFull.deck.filter(c => c.suit === 'diamonds');
const clubs = pokerGameFull.deck.filter(c => c.suit === 'clubs');
const spades = pokerGameFull.deck.filter(c => c.suit === 'spades');
assert(hearts.length === 13, 'Poker: 13 hearts in deck');
assert(diamonds.length === 13, 'Poker: 13 diamonds in deck');
assert(clubs.length === 13, 'Poker: 13 clubs in deck');
assert(spades.length === 13, 'Poker: 13 spades in deck');

// ===== RESULTS =====
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`\n📊 Test Results:`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📈 Total:  ${passed + failed}`);

if (failed === 0) {
  console.log(`\n🎉 All tests passed!\n`);
  process.exit(0);
} else {
  console.log(`\n⚠️  Some tests failed. Please review.\n`);
  process.exit(1);
}
