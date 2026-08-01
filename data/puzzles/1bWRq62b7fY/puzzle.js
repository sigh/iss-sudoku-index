// Title: Numbers in Cages in Regions in a 6x6
// Author: PeterJoe
// Video: https://www.youtube.com/watch?v=1bWRq62b7fY
// Source: https://app.crackingthecryptic.com/GhG9BQQfG2

// Standard 6x6 Sudoku uses 1-6 in rows, columns, and 3x2 boxes. The region
// sizes 1 through N fill 36 cells, so N = 8. Regions are connected, cages stay
// within one region, their displayed totals give that region's size, and the two
// stated parity rules apply across region boundaries.
const grid = cellGraph('6x6');
const regions = grid.makeOverlay('VL');
const DIGITS = [1, 2, 3, 4, 5, 6];
const SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

// Dashed cages transcribed from the source artwork, in source array order.
const cages = [
  { cells: ['R4C3'], total: 1 },
  { cells: ['R5C2', 'R5C1', 'R6C1'] },
  { cells: ['R6C6'] },
  { cells: ['R5C4', 'R6C4'] },
  { cells: ['R3C5', 'R3C6', 'R4C6'] },
  { cells: ['R1C2', 'R1C3', 'R1C4'], total: 8 },
];

const oppositeSizeParity = Pair.fnToKey(
  (a, b) => a === b || (a % 2) !== (b % 2), 8);

// This NFA counts one particular region-size label across the full overlay.
const exactlySizeCells = size => NFA.encodeSpec({
  startState: 0,
  transition(count, value) {
    if (value !== size) return count;
    return count < size ? count + 1 : undefined;
  },
  accept: count => count === size,
}, 8);

// Each NFA reads [region A, digit A, region B, digit B]. It rejects only a
// region boundary whose two digits have the same parity.
const boundaryDigitParity = NFA.encodeSpec({
  startState: { step: 0 },
  transition(state, value) {
    if (state.step === 0) return { step: 1, regionA: value };
    if (state.step === 1) return { step: 2, regionA: state.regionA, digitA: value };
    if (state.step === 2) {
      return { step: 3, regionA: state.regionA, digitA: state.digitA, regionB: value };
    }
    if (state.step === 3) {
      if (state.regionA !== state.regionB && (state.digitA % 2) === (value % 2)) return undefined;
      return { step: 4 };
    }
    return undefined;
  },
  accept: state => state.step === 4,
}, 8);

// Each orthogonal grid edge is listed once, rightward or downward.
const edges = grid.cells().flatMap(cell =>
  [[0, 1], [1, 0]].map(([dr, dc]) => [cell, grid.step(cell, dr, dc)])
    .filter(([, neighbour]) => neighbour));

return [
  new Shape('6x6', 8),
  regions.toVar('deduced region size'),
  ...grid.cells().map(cell => new Given(cell, ...DIGITS)),

  // One connected region occurs at each size; its label is that size.
  ...SIZES.flatMap(size => [
    new NFA(exactlySizeCells(size), `size ${size}`, ...regions.cells()),
    new ConnectedValues('VL', size),
  ]),

  ...cages.filter(cage => cage.cells.length > 1).map(cage =>
    new SameValues(cage.cells.length, ...regions.at(cage.cells))),
  new Given(regions.at('R4C3'), 1),
  ...regions.at(['R1C2', 'R1C3', 'R1C4']).map(cell => new Given(cell, 8)),
  new Sum(1, 'R4C3'),
  new Sum(8, 'R1C2', 'R1C3', 'R1C4'),

  ...edges.flatMap(([a, b]) => [
    new Pair(oppositeSizeParity, 'region-size parity', regions.at(a), regions.at(b)),
    new NFA(boundaryDigitParity, 'boundary digit parity', regions.at(a), a, regions.at(b), b),
  ]),
];
