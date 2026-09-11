// Title: Coordi-Loop
// Author: Celery
// Video: https://www.youtube.com/watch?v=-EE86bUPSn8
// Source: https://app.crackingthecryptic.com/sudoku/TqHHLMgRNh

// Rules encoded here:
//   Normal sudoku rules apply.
//   Draw a loop that travels around the grid orthogonally through the centre of
//   cells. This loop must pass through each 3x3 box at least once. No 2x2 area
//   can fully contain loop cells and adjacent digits upon the loop must differ
//   by at least 5.
//   In a cage digits must sum to the total (z) in the top left corner of the
//   cage if given. Additionally, each cage will reveal a coordinate
//   (Row X Column Y, with X being the uppermost/leftmost digit and Y being the
//   lowermost/rightmost digit) whereby Z must be placed. Each cage's coordinate
//   cell must be part of the loop, and cages are allowed to reference the same
//   cell multiple times throughout the puzzle. The given '6' cage is unique; no
//   other cage can sum to 6!
//
// Two clauses are left out, both named below where they arise:
//   - that the drawn loop is a SINGLE loop (see the ConnectedValues note);
//   - under one of the two live readings of "adjacent digits upon the loop",
//     the difference clause on loop cells that are orthogonally adjacent
//     without the loop stepping between them (see the whisper note).
//
// Three readings the encoding commits to:
//   - The loop may run alongside itself: no sentence forbids two loop cells
//     being orthogonally adjacent without the loop stepping between them, and a
//     no-touch reading would leave "No 2x2 area can fully contain loop cells"
//     with nothing to say. Under no-touch every cell of a fully-loop 2x2 already
//     has both of its loop neighbours inside that 2x2, so the block would be a
//     closed four-cell loop, which cannot also visit all nine boxes. So loop
//     membership is carried as a per-cell shape (which of its four edges the
//     loop uses) rather than an on/off flag with a neighbour-count degree rule.
//   - "adjacent digits upon the loop" has two readings that this puzzle can tell
//     apart, because the loop may touch itself: the digits of two cells the loop
//     steps between (neighbours in its cyclic order), or any two orthogonally
//     adjacent cells that both lie on the loop. The second only adds clauses to
//     the first, so the first is what is encoded and it holds under either.
//   - Z is the cage's own digit sum for every cage, since "each cage will reveal
//     a coordinate ... whereby Z must be placed" is unqualified; a printed total
//     additionally fixes that sum for the one cage carrying one.

// Loop shape codes, stored in the VL cells: which of a cell's four edges the
// loop uses.
const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const LOOP_SHAPES = [HORIZ, VERT, UL, UR, DL, DR];
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shape = graph.makeOverlay('VL');
const gridCells = graph.cells();

// The eleven drawn two-cell cages, in payload order; `total` is the number
// printed in the cage's top-left corner, which only one cage carries.
const CAGES = [
  { cells: ['R7C6', 'R7C7'], total: null },
  { cells: ['R7C1', 'R7C2'], total: 6 },
  { cells: ['R3C1', 'R3C2'], total: null },
  { cells: ['R9C7', 'R9C8'], total: null },
  { cells: ['R1C9', 'R2C9'], total: null },
  { cells: ['R7C5', 'R8C5'], total: null },
  { cells: ['R4C5', 'R4C6'], total: null },
  { cells: ['R1C4', 'R1C5'], total: null },
  { cells: ['R6C5', 'R6C6'], total: null },
  { cells: ['R4C3', 'R5C3'], total: null },
  { cells: ['R2C3', 'R3C3'], total: null },
];

// Every cage is a domino, so "uppermost/leftmost" then "lowermost/rightmost" is
// just its two cells ordered by row and then column.
const orderedCage = (cells) => [...cells].sort((a, b) => {
  const p = parseCellId(a), q = parseCellId(b);
  return (p.row - q.row) || (p.col - q.col);
});

// --- Loop shape domains: the VL cells hold only the seven shape codes, and a
// cell may use an edge only when there is a neighbour behind it, so border cells
// cannot take shapes pointing off the grid.
const shapeDomain = shape.makeReplicate(
  new Given(shape.cells()[0], ...ALL_SHAPES));
const borderShapeDomains = gridCells.flatMap(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = ALL_SHAPES.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
  return allowed.length === ALL_SHAPES.length
    ? [] : [new Given(shape.at(cell), ...allowed)];
});

// --- Edge agreement: two neighbours must agree about their shared edge, which
// is what makes the per-cell shapes join up into loops. Stamped over every cell
// that has a right (resp. lower) neighbour.
const edgeAgreeH = Pair.fnToKey((a, b) => usesRight(a) === usesLeft(b), 9);
const edgeAgreeV = Pair.fnToKey((a, b) => usesDown(a) === usesUp(b), 9);
const edgeRules = [
  shape.makeReplicate(
    new Pair(edgeAgreeH, 'edge-h', ...shape.at(['R1C1', 'R1C2'])),
    shape.at(gridCells.filter(c => parseCellId(c).col < geometry.numCols))),
  shape.makeReplicate(
    new Pair(edgeAgreeV, 'edge-v', ...shape.at(['R1C1', 'R2C1'])),
    shape.at(gridCells.filter(c => parseCellId(c).row < geometry.numRows))),
];

// --- Loop whisper: the two cells of a used loop edge differ by at least 5.
// Under the competing reading of "adjacent digits upon the loop" two loop cells
// that are orthogonally adjacent without the loop running between them would
// also have to differ by 5; that clause is not encoded.
// Reads [shapeA, digitA, digitB]; `toB` says whether the loop steps from A to B
// (edge agreement guarantees B agrees), so the digits are compared only when the
// loop actually runs between them.
const diffEdge = (toB) => NFA.encodeSpec({
  startState: { phase: 'shape' },
  transition: (state, value) => {
    if (state.phase === 'shape') return { phase: 'digitA', joined: toB(value) };
    if (state.phase === 'digitA') {
      return { phase: 'digitB', joined: state.joined, digitA: value };
    }
    if (!state.joined) return { done: true };
    return Math.abs(state.digitA - value) >= 5 ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const diffRight = diffEdge(usesRight);
const diffDown = diffEdge(usesDown);
// Right and down steps cover every orthogonal pair exactly once; the step falls
// off the grid at the last column/row.
const whispers = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [
    ...(right ? [new NFA(diffRight, 'diff-h', shape.at(cell), cell, right)] : []),
    ...(down ? [new NFA(diffDown, 'diff-v', shape.at(cell), cell, down)] : []),
  ];
});

// --- "No 2x2 area can fully contain loop cells": some cell of every 2x2 block
// is off the loop. Reads the block's four shapes, left to right, top to bottom.
const someOff = NFA.encodeSpec({
  startState: { seen: false },
  transition: ({ seen }, value) => ({ seen: seen || value === OFF }),
  accept: ({ seen }) => seen,
}, geometry.numValues);
const no2x2 = shape.makeReplicate(
  new NFA(someOff, 'no-2x2', ...shape.at(graph.block('R1C1', 2, 2))),
  shape.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// --- "This loop must pass through each 3x3 box at least once": some cell of
// every box is on the loop.
const someOn = NFA.encodeSpec({
  startState: { seen: false },
  transition: ({ seen }, value) => ({ seen: seen || value !== OFF }),
  accept: ({ seen }) => seen,
}, geometry.numValues);
const boxVisits = graph.boxes().map(
  box => new NFA(someOn, 'box-visit', ...shape.at(box)));

// --- Cage totals, and "no other cage can sum to 6" for the ten cages that show
// no total.
const notSixKey = Pair.fnToKey((a, b) => a + b !== 6, 9);
const cageSums = CAGES.map(({ cells, total }) => total !== null
  ? new Cage(total, ...cells)
  : new Pair(notSixKey, 'not-6', ...cells));

// --- The coordinate rule, one disjunction per cage: for some pair of digits
// (X, Y) the cage's uppermost/leftmost cell holds X, its lowermost/rightmost
// cell holds Y, and cell R{X}C{Y} holds X + Y and lies on the loop. Only
// X + Y <= 9 is enumerated, because X + Y has to be placed as a single digit. A
// branch whose target is one of the cage's own two cells is dropped: it would
// need that cell to hold both X (or Y) and X + Y, and X, Y >= 1 makes those
// different, so the branch is unsatisfiable rather than merely unused.
const coordinates = CAGES.map(({ cells }) => {
  const [first, second] = orderedCage(cells);
  const branches = [];
  for (let x = 1; x <= geometry.numValues; x++) {
    for (let y = 1; x + y <= geometry.numValues; y++) {
      const target = makeCellId(x, y);
      if (target === first || target === second) continue;
      branches.push(new And([
        new Given(first, x),
        new Given(second, y),
        new Given(target, x + y),
        new Given(shape.at(target), ...LOOP_SHAPES),
      ]));
    }
  }
  return new Or(branches);
});

return [
  new Shape('9x9'),
  shape.toVar('loop'),
  shapeDomain,
  ...borderShapeDomains,
  ...edgeRules,
  ...whispers,
  no2x2,
  ...boxVisits,
  // The loop's cells form one orthogonally-connected region. This rules out a
  // second loop drawn clear of the first, but it does not close "a loop":
  // connectivity is tested over cell adjacency, not over the edges the loop
  // uses, so two separate loops that touch at a corner still pass everything
  // here. That the loop is a single loop is therefore not encoded.
  new ConnectedValues('VL', LOOP_SHAPES),
  ...cageSums,
  ...coordinates,
];
