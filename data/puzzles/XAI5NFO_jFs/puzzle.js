// Title: Congruity
// Author: Andrewsarchus
// Video: https://www.youtube.com/watch?v=XAI5NFO_jFs
// Source: https://sudokupad.app/0olvm9qcyz

// The main grid is the central 9x9 Latin square. Full Ranks 1-36 are stored as
// decimal tens/ones pairs in VT/VO because one ISS cell cannot hold 36 values.
const graph = cellGraph('9x9');
const gridCells = graph.cells();
const rankTensVar = new Var('VT', 'Full Rank tens digits', 36);
const rankOnesVar = new Var('VO', 'Full Rank ones digits', 36);
const rankTens = Array.from({length: 36}, (_, i) => rankTensVar.cell(i + 1));
const rankOnes = Array.from({length: 36}, (_, i) => rankOnesVar.cell(i + 1));
const indices = Array.from({length: 9}, (_, i) => i + 1);

// Directed rows/columns in the same clockwise order as the outside blue line:
// top (columns down), right (rows left), bottom (columns up), left (rows right).
const directedNumbers = [
  ...indices.map(c => indices.map(r => makeCellId(r, c))),
  ...indices.map(r => indices.map(c => makeCellId(r, 10 - c))),
  ...indices.map(c => indices.map(r => makeCellId(10 - r, 10 - c))),
  ...indices.map(r => indices.map(c => makeCellId(10 - r, c))),
];

// Compare two directed nine-digit numbers lexicographically, then require their
// rank cells to have the same ordering. Digits are interleaved a1,b1,...,a9,b9,
// followed by tensA,onesA,tensB,onesB. One automaton is reused for all 630 pairs.
const rankOrderSpec = NFA.encodeSpec({
  startState: {phase: 'a', pair: 0, cmp: 0, digitA: 0, rankA: 0},
  transition: (state, value) => {
    if (state.phase === 'a') {
      return {...state, phase: 'b', digitA: value};
    }
    if (state.phase === 'b') {
      const cmp = state.cmp || Math.sign(state.digitA - value);
      const pair = state.pair + 1;
      return {phase: pair === 9 ? 'tensA' : 'a', pair, cmp, digitA: 0, rankA: 0};
    }
    if (state.phase === 'tensA') {
      return {...state, phase: 'onesA', rankA: 10 * value};
    }
    if (state.phase === 'onesA') {
      return {...state, phase: 'tensB', rankA: state.rankA + value};
    }
    if (state.phase === 'tensB') {
      return {...state, phase: 'onesB', digitA: 10 * value};
    }
    const rankB = state.digitA + value;
    const agrees = (state.cmp < 0 && state.rankA < rankB) ||
      (state.cmp > 0 && state.rankA > rankB);
    return agrees ? {phase: 'done', pair: 9, cmp: 0, digitA: 0, rankA: 0} : undefined;
  },
  accept: state => state.phase === 'done',
  maxDepth: 22,
}, 10, {valueOffset: -1});

const fullRankOrdering = Array.from({length: 36}, (_, a) =>
  Array.from({length: 35 - a}, (_, offset) => {
    const b = a + offset + 1;
    const digits = directedNumbers[a].flatMap((cell, i) => [cell, directedNumbers[b][i]]);
    return new NFA(rankOrderSpec, 'Full Rank ordering', ...digits,
      rankTens[a], rankOnes[a], rankTens[b], rankOnes[b]);
  })
).flat();

// Each two-cell rank must encode 1-36.
const validRankKey = Pair.fnToKey(
  (tens, ones) => 10 * tens + ones >= 1 && 10 * tens + ones <= 36,
  10, -1);
const rankDomains = rankTens.map((tens, i) =>
  new Pair(validRankKey, 'rank 1-36', tens, rankOnes[i]));

// The outside Index Line is a permutation which is its own inverse. For each
// pair i,j, rank i equals j exactly when rank j equals i.
const decimalDigits = n => [Math.floor(n / 10), n % 10];
const allDigits = Array.from({length: 10}, (_, n) => n);
const rankEquals = (index, value) => {
  const [tens, ones] = decimalDigits(value);
  return new And([
    new Given(rankTens[index], tens),
    new Given(rankOnes[index], ones),
  ]);
};
const rankNotEquals = (index, value) => {
  const [tens, ones] = decimalDigits(value);
  return new Or([
    new Given(rankTens[index], ...allDigits.filter(digit => digit !== tens)),
    new Given(rankOnes[index], ...allDigits.filter(digit => digit !== ones)),
  ]);
};
const outerIndexLine = Array.from({length: 36}, (_, offset) => {
    const i = offset + 1;
    return Array.from({length: 36 - i}, (_, pairOffset) => {
      const j = i + pairOffset + 1;
      return new Or([
        new And([rankEquals(i - 1, j), rankEquals(j - 1, i)]),
        new And([rankNotEquals(i - 1, j), rankNotEquals(j - 1, i)]),
      ]);
    });
}).flat();

// The inner Index Line uses ordinary 1-9 values.
function innerIndexConstraints(cells) {
  const inversePairs = Array.from({length: 9}, (_, offset) => {
    const i = offset + 1;
    return Array.from({length: 9 - i}, (_, pairOffset) => {
      const j = i + pairOffset + 1;
      const key = Pair.fnToKey((a, b) => (a === j) === (b === i), 10, -1);
      return new Pair(key, 'Index Line', cells[i - 1], cells[j - 1]);
    });
  }).flat();
  return [new AllDifferent(...cells), ...inversePairs];
}

const innerIndexLine = [
  'R4C3', 'R4C2', 'R5C3', 'R5C4', 'R5C5',
  'R4C5', 'R3C5', 'R4C4', 'R3C3',
];

const zippers = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R9C7', 'R9C8', 'R9C9'],
  ['R6C2', 'R7C2', 'R8C3', 'R9C3', 'R9C4', 'R9C5', 'R8C6', 'R8C7', 'R8C8'],
  ['R7C6', 'R7C5', 'R6C5'],
];

// Zippers involving an outside rank use 10*tens + ones in their sum equations.
const framedZippers = [
  new Sum(0, [rankTens[10], 10], rankOnes[10], 'R2C7', ['R4C9', -1]),
  new EqualSum(['R3C9', 'R3C8'], ['R4C9']),
  new Sum(0, 'R3C1', [rankTens[31], 10], rankOnes[31], ['R4C1', -1]),
  new Sum(0, 'R8C1', 'R8C2', [rankTens[28], -10], [rankOnes[28], -1]),
  new Sum(0, 'R7C1', 'R9C1', [rankTens[28], -10], [rankOnes[28], -1]),
];

return [
  new Shape('9x9', '0-9'),
  new NoBoxes(),
  rankTensVar,
  rankOnesVar,
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...rankDomains,
  ...fullRankOrdering,
  ...outerIndexLine,
  ...innerIndexConstraints(innerIndexLine),
  ...zippers.map(cells => new Zipper(...cells)),
  ...framedZippers,
];
