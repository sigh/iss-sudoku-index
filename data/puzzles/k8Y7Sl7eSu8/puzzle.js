// Title: Catch the Zippersnake
// Author: Marty Sears and Dorlir
// Video: https://www.youtube.com/watch?v=k8Y7Sl7eSu8
// Source: https://sudokupad.app/9onywsf67u

// Rules encoded below:
//   Normal sudoku. Draw a snake that starts and ends at a purple spot and has a
//   purple spot exactly at its centre. The snake moves orthogonally from cell to
//   cell and may not touch itself, not even diagonally. The snake is a zipper
//   line: any pair of digits an equal distance from the central spot sums to the
//   digit on that central spot. Any pair of cells joined by a clue (dot, diamond,
//   X or V) is either both on the snake or both off it. White dot: consecutive.
//   Black dot: 1:2 ratio. Green dot: difference of at least 5. Red diamond: same
//   parity. X: sum 10. V: sum 5.
// Nothing is omitted.
//
// Two cells 90 degrees apart at a turn of an orthogonal path are always
// diagonally adjacent, so "may not touch itself, not even diagonally" is read as:
// no 2x2 block holds one diagonal pair of snake cells and neither of the other
// two. The literal alternative -- no two snake cells diagonally adjacent at all --
// admits only a straight snake, and no two of the three purple spots share a row
// or column, so it is unsatisfiable.

const END = 1;        // snake membership: a cell where the snake starts or ends
const MID = 2;        // a snake cell that is not an end
const OFF = 3;        // not on the snake
const NO_LEVEL = 9;   // VH/VL value for a cell that is off the snake
const BASE = 6;       // level K = BASE * (VH - 1) + VL, so K runs 1..36
const MAX_LEVEL = BASE * BASE;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const snake = graph.makeOverlay('VS');
const levelHigh = graph.makeOverlay('VH');
const levelLow = graph.makeOverlay('VL');

// Drawn art: the three 0.5x0.5 purple underlay spots.
const SPOTS = ['R2C1', 'R1C4', 'R9C9'];

// Drawn art: the edge marks, each read from the fill colour of the mark on that
// edge. The four green dots and the two red diamonds are each drawn as a white
// base shape with the coloured shape over it, so the white circle sharing a green
// dot's edge is not a second, white-dot clue -- consecutive digits cannot also
// differ by at least 5.
const WHITE_DOTS = [['R8C6', 'R9C6'], ['R4C7', 'R4C8']];
const BLACK_DOTS = [['R5C8', 'R6C8'], ['R2C7', 'R3C7']];
const GREEN_DOTS = [
  ['R8C7', 'R8C8'], ['R8C3', 'R8C4'], ['R6C5', 'R7C5'], ['R7C2', 'R8C2'],
];
const RED_DIAMONDS = [['R5C9', 'R6C9'], ['R4C1', 'R5C1']];
const XS = [['R8C5', 'R8C6'], ['R4C5', 'R5C5']];
const VS_CLUES = [['R6C2', 'R6C3'], ['R3C4', 'R3C5']];
const ALL_CLUE_PAIRS = [
  ...WHITE_DOTS, ...BLACK_DOTS, ...GREEN_DOTS, ...RED_DIAMONDS, ...XS, ...VS_CLUES,
];

// --- Snake shape -----------------------------------------------------------

// Each cell is an end of the snake, a non-end snake cell, or off the snake. Only
// the purple spots may be ends, all three are on the snake, and exactly two of
// them are ends -- so the third is a snake cell that is not an end.
const spotSet = new Set(SPOTS);
// Cells sharing a value set become one Replicate of a single template Given.
const givenGroups = (overlay, valuesFor) => {
  const groups = new Map();
  for (const cell of gridCells) {
    const values = [...valuesFor(cell)].sort((a, b) => a - b);
    const key = values.join('_');
    if (!groups.has(key)) groups.set(key, { values, cells: [] });
    groups.get(key).cells.push(overlay.at(cell));
  }
  return [...groups.values()].map(({ values, cells }) => cells.length === 1
    ? new Given(cells[0], ...values)
    : overlay.makeReplicate(new Given(overlay.cells()[0], ...values), cells));
};
const membership = [
  ...givenGroups(snake, cell => spotSet.has(cell) ? [END, MID] : [MID, OFF]),
  new ContainExact(`${END}_${END}`, ...snake.at(SPOTS)),
];

// Degree: an end has one orthogonal neighbour on the snake, any other snake cell
// has two, and a cell off the snake is unconstrained. Reads the cell's own
// membership, then each neighbour's. Degree plus a single connected on-snake
// region is exactly one simple path between the two ends.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: (state, value) => {
    if (state.phase === 'self') {
      if (value === OFF) return { phase: 'skip' };
      return { phase: 'count', target: value === END ? 1 : 2, count: 0 };
    }
    if (state.phase === 'skip') return { phase: 'skip' };
    const count = state.count + (value === OFF ? 0 : 1);
    return count > state.target
      ? undefined
      : { phase: 'count', target: state.target, count };
  },
  accept: (state) => state.phase === 'skip' || state.count === state.target,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'snake degree',
  ...snake.at([cell, ...graph.neighbours(cell)])));

// A 2x2 block holding just one diagonal pair is a diagonal self-touch.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { cells: [] },
  transition: ({ cells }, value) => {
    if (cells === null) return { cells: null };   // block already checked
    const next = [...cells, value !== OFF];
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

// --- Levels ----------------------------------------------------------------

// VH/VL hold K = BASE * (VH - 1) + VL, a snake cell's distance in cells from the
// nearer end, counting itself, so both ends are level 1; cells off the snake hold
// VH = VL = NO_LEVEL. Three local facts pin K down: the ends are level 1,
// adjacent snake cells differ by one level, and no level is held by three cells
// (the level machines below). A +/-1 walk from 1 back to 1 that revisits no level
// three times is unimodal, so the two cells at level k are the k-th snake cells
// from the two ends: exactly the pairs an equal distance from the centre.
//
// K needs 36 values. No 2x2 block holds four snake cells, so the sixteen disjoint
// 2x2 blocks over rows 1-8 and columns 1-8 hold at most 48 of them, and with row
// 9 and column 9 the snake is at most 65 cells long; half of that, rounded up, is
// 33.
const manhattan = (a, b) => {
  const p = parseCellId(a);
  const q = parseCellId(b);
  return Math.abs(p.row - q.row) + Math.abs(p.col - q.col);
};
// A level-k cell is k-1 orthogonal steps from an end, and every end is a purple
// spot, so for at least one spot k-1 is at least, and has the same parity as, the
// Manhattan distance to that spot.
const levelsFor = cell => {
  const levels = new Set();
  for (const spot of SPOTS) {
    for (let k = manhattan(cell, spot) + 1; k <= MAX_LEVEL; k += 2) levels.add(k);
  }
  return [...levels];
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

const domains = [
  ...givenGroups(levelHigh,
    cell => [...levelDomains.get(cell).highs, NO_LEVEL]),
  ...givenGroups(levelLow,
    cell => [...levelDomains.get(cell).lows, NO_LEVEL]),
];

// An end holds level 1, a cell off the snake holds no level, and any other snake
// cell holds some level. Applied to each of the two level parts in turn.
const levelPartKey = part => Pair.fnToKey(
  (membershipValue, levelPart) => {
    if (membershipValue === END) return levelPart === part;
    if (membershipValue === OFF) return levelPart === NO_LEVEL;
    return levelPart !== NO_LEVEL;
  },
  geometry.numValues);
const highKey = levelPartKey(highOf(1));
const lowKey = levelPartKey(lowOf(1));
const levelPresence = gridCells.flatMap(cell => [
  new Pair(highKey, 'level 1 at an end, no level off the snake',
    snake.at(cell), levelHigh.at(cell)),
  new Pair(lowKey, 'level 1 at an end, no level off the snake',
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

// --- Zipper ----------------------------------------------------------------

// VC is the digit on the central spot, and VP/VQ are the two parts of the
// central spot's own level. Both are read off the board rather than written into
// it: the machines below force VC to be the digit of the cell that is alone at
// its level, and this machine forces VP/VQ onto whichever purple spot is not an
// end. Reads the spot's membership, its two level parts, then VP and VQ.
const centreMachine = NFA.encodeSpec({
  startState: { phase: 'code' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'code':
        // An end says nothing about the centre: absorb its four remaining cells.
        return value === MID ? { phase: 'high' } : { phase: 'skip', left: 4 };
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 }
          : { phase: 'done' };
      case 'high': return { phase: 'low', high: value };
      case 'low': return { phase: 'peakHigh', high: state.high, low: value };
      case 'peakHigh':
        return value === state.high ? { phase: 'peakLow', low: state.low } : undefined;
      case 'peakLow':
        return value === state.low ? { phase: 'done' } : undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const centreLevel = SPOTS.map(spot => new NFA(centreMachine, 'central spot level',
  snake.at(spot), levelHigh.at(spot), levelLow.at(spot), 'VP', 'VQ'));

// One machine per level, scanning VC, VP, VQ and then (VH, VL, digit) over every
// cell whose level domain still admits that level. It counts the cells holding
// the level and sums their digits: two such cells (a zipper pair) must sum to VC,
// a third is rejected, and the level VP/VQ names -- the centre's -- must be held
// by exactly one cell, whose digit is then VC itself. Rejecting a third cell at
// any level is what makes the level walk unimodal; requiring the centre's level
// to be held alone is what puts the centre halfway along the snake.
const levelMachine = (high, low) => NFA.encodeSpec({
  startState: { phase: 'target' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'target':     // VC
        return { phase: 'peakHigh', remaining: value };
      case 'peakHigh':   // VP
        return {
          phase: 'peakLow', remaining: state.remaining, isPeak: value === high,
        };
      case 'peakLow':    // VQ
        return {
          phase: 'cellHigh', remaining: state.remaining,
          isPeak: state.isPeak && value === low, count: 0, hit: false,
        };
      case 'cellHigh':
        return {
          phase: 'cellLow', remaining: state.remaining, isPeak: state.isPeak,
          count: state.count, hit: value === high,
        };
      case 'cellLow':
        return {
          phase: 'cellDigit', remaining: state.remaining, isPeak: state.isPeak,
          count: state.count, hit: state.hit && value === low,
        };
      case 'cellDigit': {
        if (!state.hit) {
          return {
            phase: 'cellHigh', remaining: state.remaining, isPeak: state.isPeak,
            count: state.count, hit: false,
          };
        }
        const remaining = state.remaining - value;
        const count = state.count + 1;
        if (remaining < 0 || count > 2) return undefined;
        return {
          phase: 'cellHigh', remaining, isPeak: state.isPeak, count, hit: false,
        };
      }
    }
  },
  accept: (state) => state.phase === 'cellHigh'
    && (state.isPeak ? state.count === 1 : state.count === 0 || state.count === 2)
    && (state.count === 0 || state.remaining === 0),
}, geometry.numValues);
const zipper = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1)
  .map(level => {
    const cells = gridCells.filter(cell => canHold(cell, level));
    return new NFA(
      levelMachine(highOf(level), lowOf(level)), `snake level ${level}`,
      'VC', 'VP', 'VQ',
      ...cells.flatMap(cell => [levelHigh.at(cell), levelLow.at(cell), cell]));
  });

// --- Edge clues ------------------------------------------------------------

const sameSideKey = Pair.fnToKey(
  (a, b) => (a === OFF) === (b === OFF), geometry.numValues);
const clueCellsTogether = ALL_CLUE_PAIRS.map(([a, b]) => new Pair(
  sameSideKey, 'clue pair both on or both off the snake',
  snake.at(a), snake.at(b)));

const sameParityKey = Pair.fnToKey(
  (a, b) => (a % 2) === (b % 2), geometry.numValues);

return [
  new Shape('9x9'),
  snake.toVar('snake membership'),
  levelHigh.toVar('snake level, high part'),
  levelLow.toVar('snake level, low part'),
  new Var('C', 'central spot digit', 1),
  new Var('P', 'central spot level, high part', 1),
  new Var('Q', 'central spot level, low part', 1),
  new Given('VP', ...Array.from({ length: BASE }, (_, i) => i + 1)),
  new Given('VQ', ...Array.from({ length: BASE }, (_, i) => i + 1)),
  ...membership,
  ...degrees,
  new ConnectedValues('VS', [END, MID]),
  noDiagonalTouches,
  ...domains,
  ...levelPresence,
  ...levelSteps,
  ...centreLevel,
  ...zipper,
  ...clueCellsTogether,
  ...WHITE_DOTS.map(pair => new WhiteDot(...pair)),
  ...BLACK_DOTS.map(pair => new BlackDot(...pair)),
  ...GREEN_DOTS.map(pair => new Whisper(5, ...pair)),
  ...RED_DIAMONDS.map(pair => new Pair(sameParityKey, 'same parity', ...pair)),
  ...XS.map(pair => new X(...pair)),
  ...VS_CLUES.map(pair => new V(...pair)),
];
