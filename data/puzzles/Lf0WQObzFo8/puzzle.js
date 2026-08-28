// Title: SVS (297) - Palindrome Snake Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=Lf0WQObzFo8
// Source: https://app.crackingthecryptic.com/webapp/rJt3468PBN

// Rules encoded below:
//   Normal sudoku. A snake -- a one-cell-wide orthogonal path -- starts and
//   ends in the two circled cells and never touches itself, not even
//   diagonally. The digits along the snake read the same in both directions.
//   The digits in grey cells are off the snake and count the snake cells among
//   their up-to-eight neighbours, and every cell that could carry such a clue
//   is drawn grey.
// Nothing is omitted.
//
// Two cells 90 degrees apart at a turn of an orthogonal path are always
// diagonally adjacent, so "never touches itself diagonally" is read as: no 2x2
// block holds one diagonal pair of snake cells and neither of the other two.

const ON = 1;
const OFF = 2;
const NO_LEVEL = 9;   // VH/VL value for a cell that is off the snake
const BASE = 6;       // level K = BASE * (VH - 1) + VL, so K runs 1..36
const MAX_LEVEL = BASE * BASE;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const snake = graph.makeOverlay('VS');
const levelHigh = graph.makeOverlay('VH');
const levelLow = graph.makeOverlay('VL');

// Drawn art: the two 0.8x0.8 white circles, and the eleven full-cell grey
// underlays.
const ENDS = ['R5C1', 'R8C2'];
const GREY = [
  'R2C4', 'R3C9', 'R4C2', 'R6C6', 'R6C7', 'R7C2', 'R7C3', 'R7C8',
  'R9C1', 'R9C2', 'R9C4',
];
// Given digits, transcribed from the printed grid.
const GIVENS = [
  ['R1C1', 5], ['R1C4', 3], ['R3C1', 7], ['R4C6', 8], ['R5C3', 1],
  ['R5C7', 2], ['R6C4', 5], ['R7C9', 3], ['R9C6', 3], ['R9C9', 9],
];
const greySet = new Set(GREY);

// --- Snake shape -----------------------------------------------------------

// Membership is ON/OFF, so a cell with d orthogonal neighbours of which k are
// on the snake has neighbour Sum 2*d - k. The circles are the only degree-one
// cells; every other snake cell has degree two. Degree plus a single connected
// ON region is exactly one simple path between the circles.
const degreeRules = gridCells.map(cell => {
  const neighbours = snake.at(graph.neighbours(cell));
  const base = 2 * neighbours.length;
  if (ENDS.includes(cell)) {
    return new And([
      new Given(snake.at(cell), ON),
      new Sum(base - 1, ...neighbours),
    ]);
  }
  return new Or([
    new Given(snake.at(cell), OFF),
    new And([
      new Given(snake.at(cell), ON),
      new Sum(base - 2, ...neighbours),
    ]),
  ]);
});

// A 2x2 block holding just one diagonal pair is a diagonal self-touch.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { cells: [] },
  transition: ({ cells }, value) => {
    if (cells === null) return { cells: null };   // block already checked
    const next = [...cells, value === ON];
    if (next.length < 4) return { cells: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { cells: null };
  },
  accept: ({ cells }) => cells === null,
}, geometry.numValues);
const noDiagonalTouches = snake.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no diagonal self-touch',
    ...snake.at(graph.block('R1C1', 2, 2))),
  snake.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// --- Palindrome ------------------------------------------------------------

// VH/VL hold K = BASE * (VH - 1) + VL, the snake cell's distance in cells from
// the nearer end, counting itself (so both circles are level 1); off-snake
// cells hold VH = VL = NO_LEVEL. Three local facts pin K down: both circles are
// level 1, adjacent snake cells differ by one level, and no level is held by
// three cells. A +/-1 walk from 1 back to 1 that revisits no level three times
// is unimodal, so the two cells at level k are the k-th snake cells from the
// two ends -- and the palindrome is then "same level, same digit", which the
// same machine checks.
//
// K needs 36 values. No 2x2 block holds four snake cells, so the sixteen
// disjoint 2x2 blocks over rows 1-8 and columns 1-8 hold at most 48 of them,
// and with row 9 and column 9 the snake is at most 65 cells long; half of that,
// rounded up, is 33.
const manhattan = (a, b) => {
  const p = parseCellId(a);
  const q = parseCellId(b);
  return Math.abs(p.row - q.row) + Math.abs(p.col - q.col);
};
// A level-k cell is k-1 orthogonal steps from a circle, so k-1 is at least, and
// has the same parity as, the Manhattan distance to the nearer circle. Both
// circles sit on the same colour, so the parity is the same for either one.
const levelsFor = cell => {
  const first = Math.min(...ENDS.map(end => manhattan(cell, end))) + 1;
  return Array.from(
    { length: Math.floor((MAX_LEVEL - first) / 2) + 1 }, (_, i) => first + 2 * i);
};
const highOf = level => Math.ceil(level / BASE);
const lowOf = level => (level - 1) % BASE + 1;
const levelDomains = new Map(gridCells.map(cell => {
  const levels = levelsFor(cell);
  return [cell, {
    highs: new Set(levels.map(highOf)),
    lows: new Set(levels.map(lowOf)),
  }];
}));
const canHold = (cell, level) => {
  const domain = levelDomains.get(cell);
  return domain.highs.has(highOf(level)) && domain.lows.has(lowOf(level));
};

const domains = gridCells.flatMap(cell => {
  const domain = levelDomains.get(cell);
  return [
    new Given(levelHigh.at(cell), ...domain.highs, NO_LEVEL),
    new Given(levelLow.at(cell), ...domain.lows, NO_LEVEL),
  ];
});

// A cell carries a level exactly when it is on the snake.
const levelledKey = Pair.fnToKey(
  (membership, level) => (membership === OFF) === (level === NO_LEVEL),
  geometry.numValues);
const levelPresence = gridCells.flatMap(cell => [
  new Pair(levelledKey, 'level iff on the snake',
    snake.at(cell), levelHigh.at(cell)),
  new Pair(levelledKey, 'level iff on the snake',
    snake.at(cell), levelLow.at(cell)),
]);

// K(a) - K(b) = BASE * (VH(a) - VH(b)) + (VL(a) - VL(b)).
const levelDifference = (a, b) => new Sum(1,
  [levelHigh.at(a), BASE], [levelLow.at(a), 1],
  [levelHigh.at(b), -BASE], [levelLow.at(b), -1]);
const levelSteps = gridCells.flatMap(cell =>
  [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]
    .filter(next => next !== null)
    .map(next => new Or([
      new Given(snake.at(cell), OFF),
      new Given(snake.at(next), OFF),
      levelDifference(cell, next),
      levelDifference(next, cell),
    ])));

// One machine per level, scanning (VH, VL, digit) over every cell whose level
// domain still admits that level. It counts the cells holding the level,
// rejecting a third, and rejects a second cell whose digit differs from the
// first's.
const levelMachine = (high, low) => NFA.encodeSpec({
  startState: { phase: 0, hit: false, count: 0, digit: 0 },
  transition: ({ phase, hit, count, digit }, value) => {
    if (phase === 0) return { phase: 1, hit: value === high, count, digit };
    if (phase === 1) return { phase: 2, hit: hit && value === low, count, digit };
    if (!hit) return { phase: 0, hit: false, count, digit };
    if (count === 2) return undefined;                     // a third cell
    if (digit !== 0 && digit !== value) return undefined;  // unequal pair
    return { phase: 0, hit: false, count: count + 1, digit: value };
  },
  accept: () => true,
}, geometry.numValues);
const palindrome = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1)
  .map(level => {
    const cells = gridCells.filter(cell => canHold(cell, level));
    return new NFA(
      levelMachine(highOf(level), lowOf(level)), `snake level ${level}`,
      ...cells.flatMap(cell => [levelHigh.at(cell), levelLow.at(cell), cell]));
  });

// --- Grey cells ------------------------------------------------------------

// The digit of the first cell scanned is the number of ON values among the
// rest.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const greyClues = GREY.flatMap(cell => [
  new Given(snake.at(cell), OFF),
  new NFA(countMachine, 'grey neighbour count',
    cell, ...snake.at(graph.kingNeighbours(cell))),
]);

// All possible grey cells are given: an undrawn cell is on the snake, or its
// digit is not the number of snake cells around it.
// Phases: 0 reads the digit, 1 reads the cell's own membership, 2 counts the
// neighbours, 3 is the sink for a cell that is itself on the snake.
const notAClueMachine = NFA.encodeSpec({
  startState: { phase: 0, target: 0, count: 0 },
  transition: ({ phase, target, count }, value) => {
    if (phase === 0) return { phase: 1, target: value, count: 0 };
    if (phase === 1) {
      return value === ON
        ? { phase: 3, target: 0, count: 0 }
        : { phase: 2, target, count: 0 };
    }
    if (phase === 3) return { phase: 3, target: 0, count: 0 };
    // Clamped: past the digit the count can no longer equal it.
    return { phase: 2, target, count: Math.min(count + (value === ON ? 1 : 0), target + 1) };
  },
  accept: ({ phase, target, count }) => phase === 3 || (phase === 2 && count !== target),
}, geometry.numValues);
const negativeClues = gridCells
  .filter(cell => !greySet.has(cell))
  .map(cell => new NFA(notAClueMachine, 'not a grey clue',
    cell, snake.at(cell), ...snake.at(graph.kingNeighbours(cell))));

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  snake.toVar('snake membership'),
  levelHigh.toVar('snake level, high part'),
  levelLow.toVar('snake level, low part'),
  snake.makeReplicate(new Given(snake.cells()[0], ON, OFF)),
  ...domains,
  ...degreeRules,
  new ConnectedValues('VS', ON),
  noDiagonalTouches,
  ...levelPresence,
  ...ENDS.flatMap(end => [
    new Given(levelHigh.at(end), highOf(1)),
    new Given(levelLow.at(end), lowOf(1)),
  ]),
  ...levelSteps,
  ...palindrome,
  ...greyClues,
  ...negativeClues,
];
