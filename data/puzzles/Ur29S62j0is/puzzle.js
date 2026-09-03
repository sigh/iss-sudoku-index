// Title: Dutch Baby
// Author: Philipp Blume, aka glum_hippo
// Video: https://www.youtube.com/watch?v=Ur29S62j0is
// Source: https://app.crackingthecryptic.com/hm580ts3a9

// Rules encoded here, in full:
//   * Normal sudoku rules apply.
//   * An orange snake steps from cell centre to cell centre, horizontally or
//     vertically. It never crosses itself and never touches itself orthogonally
//     (diagonal contact is allowed).
//   * The snake divides the non-snake cells into 8 regions, one of each size
//     from 1 to 8 cells, each orthogonally contiguous.
//   * Each region acts as a killer cage: it encloses exactly one printed sum
//     clue, the digits in it add to that clue, and they do not repeat.
//   * The snake is a Dutch Whisper line: neighbouring digits along it differ by
//     at least 4.
//   * The white dot marks R1C2 and R2C2 as consecutive.
// Nothing is omitted.
//
// How the unknown geometry is carried. One label per cell on the VS overlay:
// 1-8 name the eight cages, in the CLUES order below, and 9 means "on the
// snake". Because the snake never touches itself, two orthogonally adjacent
// snake cells are always consecutive along it, so the whisper rule is a rule
// about adjacent cell pairs; and because the regions are what the snake divides
// the rest into, two adjacent non-snake cells are always in the same region.
// The VA..VH overlays are masked digit copies, one per cage: a cell's digit
// where that cell is in the cage, 0 where it is not. That turns the cage total
// into a plain Sum, and "no repeats" into a distinct-value count, since the
// masked cells hold the cage's digits plus 0. VN holds the eight cage sizes and
// VK their distinct-value counts. The Shape is widened to 0-9 to give the masks
// their 0; the playable grid cells are restricted back to 1-9.

const SNAKE = 9;          // VS label for a snake cell; 1..8 label the cages
const EMPTY = 0;          // mask value for "this cell is not in that cage"
const MAX_CAGE = 8;       // the largest region the rules allow
const MIN_DIFF = 4;       // Dutch Whisper: neighbouring snake digits differ by >= 4

// The eight sum clues, transcribed from the single-cell clue boxes drawn in the
// grid. Cage k (1-based) is the region enclosing CLUES[k - 1].
const CLUES = [
  { cell: 'R2C3', total: 10 },
  { cell: 'R3C5', total: 24 },
  { cell: 'R4C1', total: 15 },
  { cell: 'R4C4', total: 36 },
  { cell: 'R4C7', total: 20 },
  { cell: 'R5C6', total: 6 },
  { cell: 'R6C5', total: 33 },
  { cell: 'R7C7', total: 37 },
];

// Given digits, drawn in the grid.
const GIVENS = { R4C4: 5, R6C7: 8, R8C2: 9 };

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

// A cage of `size` cells holds `size` different digits, so its total lies
// between the size smallest and the size largest digits. Only sizes passing
// that test are available to a clue.
const sizesFor = total => {
  const sizes = [];
  for (let size = 1; size <= MAX_CAGE; size++) {
    const least = size * (size + 1) / 2;             // 1 + 2 + ... + size
    const most = size * (19 - size) / 2;             // (10 - size) + ... + 9
    if (least <= total && total <= most) sizes.push(size);
  }
  return sizes;
};

const anchors = new Set(CLUES.map(clue => clue.cell));
const position = cell => graph.gridGeometry().parseCellId(cell);
const distance = (a, b) =>
  Math.abs(position(a).row - position(b).row) +
  Math.abs(position(a).col - position(b).col);

// A cage is connected and contains its own clue, so every cell of it is within
// (largest allowed size - 1) steps of that clue; and it holds no other clue.
const cages = CLUES.map(({ cell, total }, index) => {
  const sizes = sizesFor(total);
  const reach = Math.max(...sizes) - 1;
  const candidates = gridCells.filter(other =>
    distance(cell, other) <= reach && (other === cell || !anchors.has(other)));
  return { label: index + 1, clue: cell, total, sizes, candidates };
});

// The region labels, the masked digit copy of each cage, and the per-cage size
// and distinct-value counters.
const regions = graph.makeOverlay('VS');
const cageSizes = new Var('N', 'cage sizes', CLUES.length);
const cageDistinct = new Var('K', 'cage distinct values', CLUES.length);
const MASK_PREFIXES = ['VA', 'VB', 'VC', 'VD', 'VE', 'VF', 'VG', 'VH'];
const masks = cages.map((cage, index) =>
  graph.makeOverlay(MASK_PREFIXES[index], cage.candidates));

// The eight regions use up 1 + 2 + ... + 8 cells; the snake is the rest.
const SNAKE_LENGTH = gridCells.length - MAX_CAGE * (MAX_CAGE + 1) / 2;

// --- Labels ------------------------------------------------------------------
// Each cell is on the snake or in one of the cages that can reach it. A clue
// cell sits inside its own cage, so it is not free to be anything else.
const labelDomains = gridCells.map(cell => {
  const reachable = cages.filter(cage => cage.candidates.includes(cell));
  const values = reachable.map(cage => cage.label);
  return new Given(regions.at(cell), ...(anchors.has(cell) ? values : [...values, SNAKE]));
});

// Each cage is one orthogonally contiguous region, and the snake is one
// orthogonally connected run of SNAKE_LENGTH cells.
const connectivity = [
  new ConnectedValues('VS', SNAKE, SNAKE_LENGTH),
  ...cages.map(cage => new ConnectedValues('VS', cage.label)),
];

// Two adjacent non-snake cells are in the same region: nothing separates them.
// One stamped copy per adjacent pair, right steps then down steps, so that every
// orthogonal pair is covered exactly once.
const STEPS = [[0, 1], [1, 0]];
const sameRegion = Pair.fnToKey(
  (a, b) => a === SNAKE || b === SNAKE || a === b, shape);
const adjacentPairs = gridCells.flatMap(cell => STEPS
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => [cell, other]));
const regionBorders = STEPS.map(([dRow, dCol]) => {
  const origin = regions.cells()[0];
  const targets = regions.cells().filter(cell => regions.step(cell, dRow, dCol));
  return regions.makeReplicate(
    new Pair(sameRegion, 'same region', origin, regions.step(origin, dRow, dCol)),
    targets);
});

// --- The snake is a path -----------------------------------------------------
// Reads the cell's own label, then each orthogonal neighbour's. A snake cell has
// at most two snake neighbours; off-snake cells are unconstrained. Together with
// the single connected run above this makes the snake a simple path: a connected
// set of maximum degree 2 is a path or a cycle, and a cycle in a grid graph has
// an even number of cells, which SNAKE_LENGTH (45) is not. Degree 2 is also what
// forbids the snake to touch itself: a cell beside a non-consecutive stretch of
// the snake would see three snake neighbours.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, snakeNeighbours }, label) => {
    if (phase === 'start') {
      return label === SNAKE ? { phase: 'on', snakeNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    // 3 is a sink: "already too many", which keeps the counter finite.
    const count = Math.min(snakeNeighbours + (label === SNAKE ? 1 : 0), 3);
    return { phase: 'on', snakeNeighbours: count };
  },
  accept: ({ phase, snakeNeighbours }) => phase === 'off' || snakeNeighbours <= 2,
}, shape);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'snake degree',
  ...regions.at([cell, ...graph.neighbours(cell)])));

// --- Dutch Whisper along the snake -------------------------------------------
// Reads label and digit for each cell of an adjacent pair; the difference rule
// applies only when both cells are on the snake, and the skip countdown absorbs
// the values still to come when one of them is not.
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'firstLabel' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'firstLabel':
        return value === SNAKE ? { phase: 'firstDigit' } : { phase: 'skip', left: 3 };
      case 'firstDigit':
        return { phase: 'secondLabel', firstDigit: value };
      case 'secondLabel':
        return value === SNAKE
          ? { phase: 'secondDigit', firstDigit: state.firstDigit }
          : { phase: 'skip', left: 1 };
      case 'secondDigit':
        return Math.abs(state.firstDigit - value) >= MIN_DIFF
          ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);
const whispers = adjacentPairs.map(([a, b]) => new NFA(whisperMachine, 'dutch whisper',
  regions.at(a), a, regions.at(b), b));

// --- The cages ---------------------------------------------------------------
// A mask cell carries its grid cell's digit or 0 ...
const maskIsDigitOrEmpty = Pair.fnToKey(
  (digit, mask) => mask === EMPTY || mask === digit, shape);
// ... and it is the digit exactly on the cells this cage owns.
const maskSelectsLabel = label => Pair.fnToKey(
  (cellLabel, mask) => (cellLabel === label) === (mask !== EMPTY), shape);

// Counts the mask's non-empty cells, against the cage size read first.
const sizeMachine = NFA.encodeSpec({
  startState: { size: null, count: 0 },
  transition: ({ size, count }, mask) => {
    if (size === null) return { size: mask, count: 0 };
    const next = count + (mask === EMPTY ? 0 : 1);
    return next > size ? undefined : { size, count: next };
  },
  accept: ({ size, count }) => size !== null && count === size,
}, shape);

// The mask holds the cage's digits and at least one 0 (every cage has fewer
// cells than its mask), so it shows one more distinct value than the cage has
// cells exactly when the cage's digits are all different.
const oneMoreThanSize = Pair.fnToKey(
  (size, distinct) => distinct === size + 1, shape);

const cageConstraints = cages.flatMap((cage, index) => {
  const mask = masks[index];
  const size = cageSizes.cell(index + 1);
  const distinct = cageDistinct.cell(index + 1);
  return [
    ...cage.candidates.flatMap(cell => [
      new Pair(maskIsDigitOrEmpty, 'masked digit', cell, mask.at(cell)),
      new Pair(maskSelectsLabel(cage.label), 'cage membership',
        regions.at(cell), mask.at(cell)),
    ]),
    new Sum(cage.total, ...mask.cells()),
    new Given(size, ...cage.sizes),
    new NFA(sizeMachine, 'cage size', size, ...mask.cells()),
    new CountDistinct(distinct, ...mask.cells()),
    new Pair(oneMoreThanSize, 'no repeats in cage', size, distinct),
  ];
});

// One region of each size from 1 to 8.
const distinctSizes = new AllDifferent(...cageSizes.cells());

return [
  shape,
  regions.toVar('region labels'),
  ...masks.map((mask, index) => mask.toVar(`cage ${index + 1} digits`)),
  cageSizes,
  cageDistinct,
  // The widened alphabet is for the masks; grid digits stay 1-9.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...Object.entries(GIVENS).map(([cell, digit]) => new Given(cell, digit)),
  new WhiteDot('R1C2', 'R2C2'),
  ...labelDomains,
  ...connectivity,
  ...regionBorders,
  ...degrees,
  ...whispers,
  ...cageConstraints,
  distinctSizes,
];
