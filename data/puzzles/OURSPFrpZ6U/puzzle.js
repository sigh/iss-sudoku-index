// Title: Counting Castles
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=OURSPFrpZ6U
// Source: https://sudokupad.app/5060viuw2v

// Divide the grid into nine orthogonally connected 9-cell kingdoms, with
// 1-9 once in each row, column, and kingdom. The usual 3x3 boxes do not apply.
// A castle holding digit N means exactly N castles hold N. A kingdom score is
// its castle count plus its number of distinct orthogonal neighbour kingdoms;
// the nine scores are different, and blue cells show their kingdom's score.
// Each drawn bridge joins cells in different kingdoms whose digits sum to 5,
// sum to 10, or are in a 1:2 ratio.

const cc = cellGraph('9x9').makeOverlay('CC');
const graph = cellGraph('9x9');

// Grey tower geometry from the source vector overlays.
const CASTLES = [
  'R1C6', 'R3C4', 'R4C1', 'R4C3', 'R4C5', 'R4C6', 'R5C3',
  'R6C2', 'R6C5', 'R7C3', 'R7C6', 'R8C1', 'R8C3',
];

// Blue closed squares from the source line geometry.
const BLUE_CELLS = [
  'R1C1', 'R2C2', 'R4C2', 'R4C4', 'R4C9', 'R5C8', 'R6C5',
  'R6C7', 'R8C5',
];

const ORTHOGONAL_EDGES = graph.cells().flatMap(cell => {
  const { row, col } = parseCellId(cell);
  return [
    col < 9 ? [cell, makeCellId(row, col + 1)] : null,
    row < 9 ? [cell, makeCellId(row + 1, col)] : null,
  ].filter(Boolean);
});

// Brown bridge geometry from the source vector overlays.
const BRIDGES = [
  ['R1C5', 'R1C6'], ['R1C7', 'R2C7'], ['R2C7', 'R3C7'],
  ['R3C5', 'R4C5'], ['R4C4', 'R4C5'], ['R4C6', 'R4C7'],
  ['R5C2', 'R6C2'], ['R5C3', 'R5C4'], ['R5C4', 'R6C4'],
  ['R6C2', 'R6C3'], ['R6C2', 'R7C2'], ['R7C3', 'R7C4'],
  ['R7C9', 'R8C9'], ['R8C4', 'R8C5'], ['R8C9', 'R9C9'],
  ['R9C1', 'R9C2'],
];

const bridgeDigitKey = Pair.fnToKey((a, b) =>
  a + b === 5 || a + b === 10 || a === 2 * b || b === 2 * a, 9);

const bridges = BRIDGES.map(([a, b]) => new And([
  new Pair(bridgeDigitKey, 'bridge', a, b),
  new AllDifferent(cc.at(a), cc.at(b)),
]));

// For each digit N, the castle rule is count(N) = 0 or N. The zero case has
// no castle bearing N and therefore no displayed assertion to violate.
const castleDigitCounts = Array.from({ length: 9 }, (_, index) => {
  const digit = index + 1;
  const spec = NFA.encodeSpec({
    startState: { count: 0 },
    transition: ({ count }, value) => {
      const next = count + (value === digit ? 1 : 0);
      return next <= digit ? { count: next } : undefined;
    },
    accept: ({ count }) => count === 0 || count === digit,
    maxDepth: CASTLES.length,
  }, 9);
  return new NFA(spec, `castle digit ${digit}`, ...CASTLES);
});

// CC labels are the nine solver-discovered kingdoms. KC stores each kingdom's
// castle count plus one, so the 0-castle case remains in the 1-9 Var domain.
const kingdomCastleCounts = new Var('K', 'kingdom castle count plus one', 9);
const kingdomScores = new Var('S', 'kingdom scores', 9);
const neighbourFlags = graph.makeOverlay('VN');
const neighbourFlag = (label, other) => neighbourFlags.at(graph.row(label)[other - 1]);

const castleCountNFA = label => NFA.encodeSpec({
  startState: { shifted: null, count: 0 },
  transition: ({ shifted, count }, value) => {
    if (shifted === null) return { shifted: value, count: 0 };
    const next = count + (value === label ? 1 : 0);
    return next <= 9 ? { shifted, count: next } : undefined;
  },
  accept: ({ shifted, count }) => shifted === count + 1,
  maxDepth: CASTLES.length + 1,
}, 9);

const kingdomCastleConstraints = Array.from({ length: 9 }, (_, index) =>
  new NFA(castleCountNFA(index + 1), `kingdom ${index + 1} castle count`,
    kingdomCastleCounts.cell(index + 1), ...cc.at(CASTLES)));

// One 1/2 flag says whether a fixed foreign label occurs across any boundary
// edge of a fixed kingdom label. Splitting the nine possible foreign labels
// keeps each NFA small instead of retaining a 9-bit neighbour set in one state.
const neighbourNFA = (label, other) => NFA.encodeSpec({
  startState: { flag: null, first: null, seen: false },
  transition: ({ flag, first, seen }, value) => {
    if (flag === null) return { flag: value, first: null, seen: false };
    if (first === null) return { flag, first: value, seen };
    const touches = label !== other &&
      ((first === label && value === other) || (first === other && value === label));
    return { flag, first: null, seen: seen || touches };
  },
  accept: ({ flag, first, seen }) => first === null && flag === (seen ? 2 : 1),
  maxDepth: 1 + 2 * ORTHOGONAL_EDGES.length,
}, 9);

const neighbourConstraints = Array.from({ length: 9 }, (_, labelIndex) =>
  Array.from({ length: 9 }, (_, otherIndex) => {
    const label = labelIndex + 1;
    const other = otherIndex + 1;
    return new NFA(neighbourNFA(label, other), `kingdom ${label} neighbour ${other}`,
      neighbourFlag(label, other), ...cc.at(ORTHOGONAL_EDGES.flat()));
  }));

// score = castleCount + distinctNeighbourCount. KC is castleCount+1 and each
// neighbour flag is 1 or 2, hence score - KC - sum(flags) = -10.
const scoreSums = Array.from({ length: 9 }, (_, index) => new Sum(
  -10,
  kingdomScores.cell(index + 1),
  [kingdomCastleCounts.cell(index + 1), -1],
  ...Array.from({ length: 9 }, (_, other) => [neighbourFlag(index + 1, other + 1), -1]),
));

// A blue cell's CC label selects its kingdom score from VS1..VS9.
const blueScoreLookupNFA = NFA.encodeSpec({
  startState: { label: null, digit: null, index: 0 },
  transition: ({ label, digit, index }, value) => {
    if (label === null) return { label: value, digit: null, index: 0 };
    if (digit === null) return { label, digit: value, index: 0 };
    if (index >= 9 || (index + 1 === label && value !== digit)) return undefined;
    return { label, digit, index: index + 1 };
  },
  accept: ({ label, digit, index }) => label !== null && digit !== null && index === 9,
  maxDepth: 11,
}, 9);

const blueScoreLookups = BLUE_CELLS.map(cell => new NFA(
  blueScoreLookupNFA, 'blue kingdom score', cc.at(cell), cell,
  ...Array.from({ length: 9 }, (_, index) => kingdomScores.cell(index + 1))));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  kingdomCastleCounts,
  kingdomScores,
  neighbourFlags.toVar('kingdom neighbour flags'),
  neighbourFlags.makeReplicate(new Given(neighbourFlags.cells()[0], 1, 2)),
  ...castleDigitCounts,
  ...kingdomCastleConstraints,
  ...neighbourConstraints.flat(),
  ...scoreSums,
  new AllDifferent(...Array.from({ length: 9 }, (_, index) => kingdomScores.cell(index + 1))),
  ...blueScoreLookups,
  ...bridges,
];
