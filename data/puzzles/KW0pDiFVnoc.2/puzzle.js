// Title: Poker Sudoku
// Author: Mitchell Lee
// Video: https://www.youtube.com/watch?v=KW0pDiFVnoc
// Source: https://cracking-the-cryptic.web.app/sudoku/J9rbjm4QnD

// Rules encoded below, all of them:
//   Normal sudoku rules apply, and 1 is treated as a poker ace.
//   Each of the 13 five-cell cages is a poker hand.  Every cage cell carries
//   a drawn suit glyph, so a cell's card is its digit in that fixed suit.
//   Digits may repeat in a cage but cards may not; cards may repeat
//   elsewhere in the grid.
//   A greater-than symbol joining two cages says which of the two holds the
//   higher-ranking hand, with the cards and values treated exactly as in a
//   game of poker -- category first, then the standard within-category
//   tie-break.  The ace ranks above 9 everywhere except as the bottom card
//   of the lowest straight 1-2-3-4-5; 6-7-8-9-A is not a straight.

// Drawn data, transcribed from the cage geometry and from the suit glyph
// drawn in each cage cell.  SUITS[i][k] is the suit of CAGES[i][k]
// (H heart, D diamond, C club, S spade).
const CAGES = [
  ['R1C1', 'R2C1', 'R3C1', 'R2C2', 'R1C2'],
  ['R4C2', 'R3C2', 'R3C3', 'R1C3', 'R2C3'],
  ['R1C5', 'R2C5', 'R2C4', 'R2C6', 'R3C6'],
  ['R1C6', 'R1C7', 'R2C7', 'R2C8', 'R1C8'],
  ['R4C9', 'R3C9', 'R2C9', 'R1C9', 'R3C8'],
  ['R4C6', 'R4C7', 'R5C7', 'R5C8', 'R5C9'],
  ['R5C3', 'R4C3', 'R4C4', 'R3C4', 'R3C5'],
  ['R5C2', 'R6C2', 'R6C1', 'R7C1', 'R8C1'],
  ['R6C3', 'R7C3', 'R7C2', 'R8C3', 'R9C3'],
  ['R6C4', 'R7C4', 'R7C5', 'R8C5', 'R8C6'],
  ['R4C5', 'R5C5', 'R6C5', 'R6C6', 'R5C6'],
  ['R7C6', 'R7C7', 'R6C7', 'R8C7', 'R8C8'],
  ['R6C8', 'R7C8', 'R7C9', 'R8C9', 'R9C9'],
];
const SUITS = [
  'HHHHH', 'SSSSS', 'CHHHH', 'DDCCD', 'DSSSS', 'CHHHH', 'HHCDD',
  'DDDDD', 'CCCCC', 'CHHHH', 'HSSSS', 'DCCCH', 'SDDDD',
];

// Drawn data: the 12 chevrons, as [higher-ranking cage, lower-ranking cage].
// Each chevron straddles a cage border, its open end over a cell of the
// first cage and its apex over the neighbouring cell of the second.
const CHEVRONS = [
  [0, 1], [1, 6], [6, 7], [7, 8], [8, 9], [9, 10],
  [10, 11], [11, 12], [12, 5], [5, 4], [4, 3], [3, 2],
];

// Drawn data: the 9 given digits.
const GIVENS = {
  R1C4: 2, R2C5: 3, R2C7: 6, R4C6: 7, R4C9: 4,
  R6C4: 9, R7C1: 1, R8C7: 5, R9C1: 8,
};

// Card ranks run 2 < 3 < ... < 9 < ace, and the digit 1 is the ace.
const cardRank = (digit) => (digit === 1 ? 9 : digit - 1);

// The strength of one hand as a tuple compared left to right: category
// first, then the standard tie-break ranks padded with 0.  Categories are
// numbered 1 high card, 2 one pair, 3 two pair, 4 three of a kind,
// 5 straight, 6 flush, 7 full house, 8 four of a kind, 9 straight flush.
// `isFlush` is fixed per cage by the drawn suits, not solved for.
// Returns null for a combination that cannot be dealt into a single cage.
const handStrength = (digits, isFlush) => {
  const ranks = digits.map(cardRank).sort((a, b) => a - b);
  const count = new Map();
  for (const r of ranks) count.set(r, (count.get(r) || 0) + 1);

  // Straights: 2-3-4-5-6 up to 5-6-7-8-9 are five consecutive ranks; the ace
  // joins only at the bottom, as 1-2-3-4-5 (ranks 1,2,3,4 plus the ace's 9),
  // counted as five-high.  Ranks 5..9 would be 6-7-8-9-A, which the rules
  // exclude.
  let straightHigh = 0;
  if (count.size === 5) {
    if (ranks.join() === '1,2,3,4,9') straightHigh = 4;
    else if (ranks[4] - ranks[0] === 4 && ranks[4] <= 8) straightHigh = ranks[4];
  }

  // Rank groups, largest group first and higher rank first within a size.
  const groups = [...count.entries()].sort((a, b) => (b[1] - a[1]) || (b[0] - a[0]));
  const pad = (tuple) => { while (tuple.length < 6) tuple.push(0); return tuple; };

  if (isFlush) {
    if (count.size !== 5) return null;
    return straightHigh
      ? pad([9, straightHigh])
      : pad([6, ...ranks.slice().reverse()]);
  }
  const largest = groups[0][1];
  // Five cells of one rank would need five different suits, and there are
  // only four, so no cage can hold them.
  if (largest === 5) return null;
  if (largest === 4) return pad([8, groups[0][0], groups[1][0]]);
  if (largest === 3) {
    return count.size === 2
      ? pad([7, groups[0][0], groups[1][0]])
      : pad([4, groups[0][0], groups[1][0], groups[2][0]]);
  }
  if (largest === 2) {
    const pairs = groups.filter(([, n]) => n === 2).map(([r]) => r);
    const singles = groups.filter(([, n]) => n === 1).map(([r]) => r);
    return pairs.length === 2
      ? pad([3, pairs[0], pairs[1], singles[0]])
      : pad([2, pairs[0], ...singles]);
  }
  return straightHigh ? pad([5, straightHigh]) : pad([1, ...ranks.slice().reverse()]);
};

// Two hands in different categories cannot be compared by any single one of
// the tuple's entries, so score every hand by its place in one global list:
// take every multiset of five digits, strength it both as a flush (only when
// the five digits differ) and as a mixed-suit hand, sort the distinct
// results weakest first, and number them from 0.  Hand A beats hand B
// exactly when A's number is the larger.
const HAND_ORDINAL = (() => {
  const multisets = [];
  (function choose(from, sofar) {
    if (sofar.length === 5) { multisets.push(sofar.slice()); return; }
    for (let d = from; d <= 9; d++) { sofar.push(d); choose(d, sofar); sofar.pop(); }
  })(1, []);
  const dealt = [];
  for (const digits of multisets) {
    for (const isFlush of [false, true]) {
      const strength = handStrength(digits, isFlush);
      if (strength) dealt.push([digits.join() + (isFlush ? 'F' : 'M'), strength]);
    }
  }
  const distinct = new Map(dealt.map(([, s]) => [s.join(), s]));
  const order = new Map(
    [...distinct.values()]
      .sort((a, b) => { for (let i = 0; i < 6; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; })
      .map((s, i) => [s.join(), i]));
  return new Map(dealt.map(([key, s]) => [key, order.get(s.join())]));
})();

// Four base-9 digits hold every ordinal (9^4 = 6561, and there are 1404
// distinct strengths).  Digit d is written as the cell value d + 1.
const SCORE_BASE = 9;
const SCORE_LENGTH = 4;
// One row of score cells per cage.
const scores = new Var('S', 'hand scores', `${CAGES.length}x${SCORE_LENGTH}`);
// Score cells of a cage, most significant first.
const scoreCells = (cage) => Array.from(
  { length: SCORE_LENGTH },
  (_, k) => scores.cell(cage + 1, k + 1));

// One machine per cage.  It reads the cage's five digits -- in any order,
// since only the multiset decides the hand -- then reads the cage's four
// score cells and checks they spell the hand's ordinal in base 9.
// The score cells are read least significant first so the machine can divide
// the ordinal down as it goes; carrying the whole ordinal to the end instead
// would nearly double the compiled state count.
// State is {seen} while reading the cage: the digits so far, kept sorted so
// that orderings of the same partial hand share a state.  Then {rem, e}:
// the part of the ordinal still to be spelled, and how many score cells have
// been read.
const scoreSpec = (isFlush) => NFA.encodeSpec({
  startState: { seen: [] },
  transition: (state, value) => {
    if (state.seen !== undefined) {
      // Five cards of one suit are five different cards, so a single-suit
      // cage cannot repeat a digit -- the same thing its no-repeated-card
      // AllDifferent below says.
      if (isFlush && state.seen.includes(value)) return undefined;
      const seen = state.seen.concat([value]).sort((a, b) => a - b);
      if (seen.length < 5) return { seen };
      const ordinal = HAND_ORDINAL.get(seen.join() + (isFlush ? 'F' : 'M'));
      if (ordinal === undefined) return undefined;
      return { rem: ordinal, e: 0 };
    }
    if (state.e === SCORE_LENGTH) return undefined;
    if (value - 1 !== state.rem % SCORE_BASE) return undefined;
    return { rem: (state.rem - (value - 1)) / SCORE_BASE, e: state.e + 1 };
  },
  accept: (state) => state.seen === undefined && state.e === SCORE_LENGTH && state.rem === 0,
}, 9);

const flushSpec = scoreSpec(true);
const mixedSpec = scoreSpec(false);
const isSingleSuit = (cage) => new Set(SUITS[cage]).size === 1;

const handScores = CAGES.map((cells, i) => new NFA(
  isSingleSuit(i) ? flushSpec : mixedSpec,
  `hand${i}`,
  ...cells, ...scoreCells(i).slice().reverse()));

// "Cards may not repeat in a cage": within one cage, cells drawn in the same
// suit hold different digits, and cells in different suits are free to
// match.  Derived from the drawn suits rather than listed by hand.
const noRepeatedCard = CAGES.flatMap((cells, i) => {
  const bySuit = new Map();
  cells.forEach((cell, k) => {
    const suit = SUITS[i][k];
    if (!bySuit.has(suit)) bySuit.set(suit, []);
    bySuit.get(suit).push(cell);
  });
  return [...bySuit.values()]
    .filter((group) => group.length > 1)
    .map((group) => new AllDifferent(...group));
});

// One machine per chevron, over the two cages' score cells interleaved and
// read most significant first: A's digit, B's digit, A's, B's, ...  The
// first pair that differs settles the comparison, so this is a strict
// lexicographic "A's ordinal is greater than B's".
// State {a} holds A's digit while B's matching digit is still unread (0 when
// nothing is pending), and {gt} records that A has already won, after which
// the remaining digits are unconstrained.
const gtSpec = NFA.encodeSpec({
  startState: { a: 0, gt: false },
  transition: (state, value) => {
    if (state.gt) return { a: 0, gt: true };
    if (state.a === 0) return { a: value, gt: false };
    if (value < state.a) return { a: 0, gt: true };
    if (value > state.a) return undefined;
    return { a: 0, gt: false };
  },
  accept: (state) => state.gt && state.a === 0,
}, 9);

const rankings = CHEVRONS.map(([higher, lower]) => {
  const hi = scoreCells(higher);
  const lo = scoreCells(lower);
  return new NFA(
    gtSpec, `chevron${higher}over${lower}`,
    ...hi.flatMap((cell, k) => [cell, lo[k]]));
});

return [
  new Shape('9x9'),
  ...Object.entries(GIVENS).map(([cell, digit]) => new Given(cell, digit)),
  scores,
  ...noRepeatedCard,
  ...handScores,
  ...rankings,
];
