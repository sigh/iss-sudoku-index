// Title: 500k Subs
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=1VVhnG_Hk8A
// Source: https://app.crackingthecryptic.com/sudoku/tnHfB78T98

// Normal sudoku. Three snakes are hidden in the grid. A snake is a chain of
// cells in which consecutive cells share an edge or a corner; a snake cannot
// branch, cannot touch itself orthogonally or diagonally, and cannot touch
// another snake orthogonally or diagonally. Each snake's digits multiply to
// exactly 500. Three grey two-cell segments show parts of "some or all" of the
// snakes. No snake starts or ends on the digit 1.
//
// Read together, the branching and touching clauses say: over the set S of all
// snake cells, the king-move graph induced on S is exactly three disjoint
// simple paths -- every snake cell is king-adjacent only to its own neighbours
// along its own snake. The rules' worked example is this reading: R2C4 cannot
// be a snake cell because the snake cell R3C3 touches it diagonally, which
// holds whether R2C4 would join R3C3's snake or a different one.
//
// 500 = 2^2 * 5^3 and cells hold digits 1-9, so a snake's digits come from
// {1, 2, 4, 5} with exactly three 5s and a total power of two of exactly 2
// (one 4, or two 2s), plus any number of 1s.
//
// Two overlays carry the discovered structure.
//   VS  per cell: OFF, or (which snake, end-or-interior).
//   VP  per cell: NO_RANK off-snake, else 1 + the distance along the snake to
//       its nearer end.
// Both are artifacts of this encoding, so both are pinned to a single
// representative: VS's snake numbers are forced into reading order, and VP is
// forced to that one distance function.

const OFF = 1;              // VS: cell is on no snake
const MID = [2, 4, 6];      // VS: interior cell of snake 1 / 2 / 3
const END = [3, 5, 7];      // VS: end cell of snake 1 / 2 / 3
const NO_RANK = 9;          // VP: cell is on no snake
const MAX_RANK = NO_RANK - 1;

const isOn = s => s >= MID[0] && s <= END[2];
const isEnd = s => s === END[0] || s === END[1] || s === END[2];
const snakeOf = s => s >> 1;   // 2,3 -> 1;  4,5 -> 2;  6,7 -> 3
const SNAKE_DIGITS = [1, 2, 4, 5];

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const numValues = graph.gridGeometry().numValues;
const snake = graph.makeOverlay('VS');
const rank = graph.makeOverlay('VP');

// Transcribed from the payload's 24 given digits.
const givenDigits = {
  R3C1: 3, R3C2: 4, R3C4: 6,
  R4C1: 6, R4C3: 4, R4C5: 7, R4C8: 3,
  R5C1: 5, R5C2: 8, R5C3: 7, R5C5: 6, R5C7: 9, R5C9: 1,
  R6C2: 9, R6C3: 3, R6C5: 2, R6C7: 7, R6C9: 4,
  R7C1: 4, R7C2: 7, R7C4: 3, R7C7: 1, R7C9: 8,
  R8C8: 9,
};

// The three drawn grey strokes, each joining two cell centres. Only their cells
// carry information: which snake each belongs to is not shown, and the drawn
// pair is automatically consecutive once both cells are on a snake, because
// king-adjacent snake cells are always snake-neighbours here.
const greySegmentCells = ['R3C3', 'R2C3', 'R1C6', 'R2C7', 'R8C2', 'R9C3'];

// --- Overlay domains, and the grey segments forced on-snake. VP needs no
// domain constraint: NO_RANK is the top of the grid's own value range.
const snakeDomain = snake.makeReplicate(
  new Given(snake.at('R1C1'), OFF, ...MID, ...END));
const greySegments = greySegmentCells.map(
  cell => new Given(snake.at(cell), ...MID, ...END));

// --- VS and VP agree per cell: off-snake together, ends rank 1, interiors 2+.
const stateRankKey = Pair.fnToKey((s, p) => {
  if (s === OFF) return p === NO_RANK;
  if (!isOn(s)) return false;
  if (isEnd(s)) return p === 1;
  return p >= 2 && p <= MAX_RANK;
}, numValues);

// --- Digits on a snake are the divisors of 500 among 1-9, and an end is not 1.
const digitStateKey = Pair.fnToKey((d, s) => {
  if (s === OFF) return true;
  if (!isOn(s)) return false;
  return SNAKE_DIGITS.includes(d) && !(isEnd(s) && d === 1);
}, numValues);

const perCellPairs = gridCells.flatMap(cell => [
  new Pair(stateRankKey, 'state-rank', snake.at(cell), rank.at(cell)),
  new Pair(digitStateKey, 'snake-digit', cell, snake.at(cell)),
]);

// --- Every king-adjacent pair of cells, as lines of consecutive cells: the two
// axes and the two diagonal directions. Pair binds consecutive list entries, so
// one call per line covers exactly that line's adjacent pairs.
const diagonalLines = (dCol) => [
  ...graph.row(1), ...graph.column(dCol > 0 ? 1 : 9).slice(1),
].map(cell => graph.ray(cell, 1, dCol)).filter(line => line.length >= 2);
const adjacencyLines = [
  ...graph.rows(), ...graph.columns(), ...diagonalLines(1), ...diagonalLines(-1),
];

// Snakes may not touch each other, so king-adjacent snake cells are on the same
// snake.
const sameSnakeKey = Pair.fnToKey(
  (a, b) => !isOn(a) || !isOn(b) || snakeOf(a) === snakeOf(b), numValues);

// Ranks of king-adjacent snake cells differ by at most 1. With the predecessor
// rule below this pins VP to exactly "1 + distance to the nearer end": the step
// bound gives rank <= 1 + distance to either end, the predecessor rule gives
// rank >= 1 + distance to the nearer end.
const rankStepKey = Pair.fnToKey(
  (a, b) => a === NO_RANK || b === NO_RANK || Math.abs(a - b) <= 1, numValues);

const adjacencyPairs = adjacencyLines.flatMap(line => [
  new Pair(sameSnakeKey, 'no-touch', ...snake.at(line)),
  new Pair(rankStepKey, 'rank-step', ...rank.at(line)),
]);

// --- Degree. Reads [own VS, VS of each king neighbour]: an end has exactly one
// snake neighbour, an interior cell exactly two, an off cell is unconstrained.
// This is the whole "no branching, no self-touching, no touching another snake"
// geometry: counting all king neighbours (not just consecutive ones) is what
// forbids a snake running alongside itself.
const degreeSpec = NFA.encodeSpec({
  startState: { need: null, count: 0 },
  transition: (state, value) => {
    if (state.need === null) {
      if (value === OFF) return { need: 0, count: 0 };
      if (!isOn(value)) return undefined;
      return { need: isEnd(value) ? 1 : 2, count: 0 };
    }
    if (state.need === 0) return state;
    const count = state.count + (isOn(value) ? 1 : 0);
    return count > state.need ? undefined : { need: state.need, count };
  },
  accept: state => state.need === 0 || state.count === state.need,
}, numValues);

// --- Predecessor. Reads [own VP, VP of each king neighbour]: a cell of rank r
// >= 2 has a neighbour of rank r - 1. Chaining down from any snake cell reaches
// a rank-1 cell, i.e. an end, so no component of the snake set can be a closed
// loop and every component holds at least one end.
const predecessorSpec = NFA.encodeSpec({
  startState: { self: null },
  transition: (state, value) => {
    if (state.self === null) {
      return (value === NO_RANK || value === 1) ? { self: 0 }
        : { self: value, found: false };
    }
    if (state.self === 0) return state;
    return { self: state.self, found: state.found || value === state.self - 1 };
  },
  accept: state => state.self === 0 || state.found === true,
}, numValues);

const perCellNfas = gridCells.flatMap(cell => {
  const neighbours = graph.kingNeighbours(cell);
  return [
    new NFA(degreeSpec, 'degree', ...snake.at([cell, ...neighbours])),
    new NFA(predecessorSpec, 'predecessor', ...rank.at([cell, ...neighbours])),
  ];
});

// --- Exactly two ends per snake. With max degree two and every component
// holding an end, each component is a simple path with exactly two ends, so six
// ends split into exactly three snakes, one per label.
const endCounts = new ContainExact(
  END.map(v => `${v}_${v}`).join('_'), ...snake.at(gridCells));

// --- Product 500 per snake, as counts over the whole grid: the cells labelled
// with a given snake hold exactly three 5s, and their powers of two total
// exactly 2 (a 4 contributes 2, a 2 contributes 1). Reads the grid interleaved
// with VS, so each digit is scored against its own cell's label.
const productSpec = (label) => NFA.encodeSpec({
  startState: { fives: 0, twos: 0, digit: null },
  transition: (state, value) => {
    if (state.digit === null) return { ...state, digit: value };
    const mine = isOn(value) && snakeOf(value) === label;
    let { fives, twos } = state;
    if (mine) {
      if (state.digit === 5) fives += 1;
      else if (state.digit === 2) twos += 1;
      else if (state.digit === 4) twos += 2;
    }
    if (fives > 3 || twos > 2) return undefined;
    return { fives, twos, digit: null };
  },
  accept: ({ fives, twos, digit }) =>
    digit === null && fives === 3 && twos === 2,
}, numValues);

const interleaved = gridCells.flatMap(cell => [cell, snake.at(cell)]);
const productRules = [1, 2, 3].map(
  label => new NFA(productSpec(label), 'product-500', ...interleaved));

// --- Snake numbering is this encoding's own artifact, so it is pinned to one
// representative: reading the grid in row-major order, snake 1's first cell
// comes before snake 2's, which comes before snake 3's.
const labelOrder = new NFA(NFA.encodeSpec({
  startState: { seen: 0 },
  transition: ({ seen }, value) => {
    if (!isOn(value)) return { seen };
    const label = snakeOf(value);
    if (label <= seen) return { seen };
    return label === seen + 1 ? { seen: label } : undefined;
  },
  accept: ({ seen }) => seen === 3,
}, numValues), 'snake-order', ...snake.at(gridCells));

return [
  new Shape('9x9'),
  snake.toVar('snake'),
  rank.toVar('rank'),
  ...Object.entries(givenDigits).map(([cell, digit]) => new Given(cell, digit)),
  snakeDomain,
  ...greySegments,
  ...perCellPairs,
  ...adjacencyPairs,
  ...perCellNfas,
  endCounts,
  ...productRules,
  labelOrder,
];
