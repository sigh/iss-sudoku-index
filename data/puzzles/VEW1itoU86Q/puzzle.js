// Title: Nori Nori Christmas
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=VEW1itoU86Q
// Source: https://sudokupad.app/2v5h5o63ej

// Rules encoded below:
//   - Normal Sudoku.
//   - No digit repeats within a dashed cage, and a cage with a printed corner
//     total sums to it.
//   - Exactly two cells of every cage are shaded; each orthogonally connected
//     group of shaded cells is a two-cell domino, and the two digits of such a
//     domino are in a 2:1 ratio.
//   - The digits either side of the white dot are consecutive.
// Two clauses are permissions rather than restrictions and add no constraint:
// an undotted pair may still be consecutive ("Not all possible dots are
// given"), and an unshaded orthogonal pair may still be in a 2:1 ratio. Fog
// hides clues from the solver while filling the grid and does not restrict the
// final grid.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');

// The 15 dashed cages, transcribed from the drawn cage outlines; `total` is the
// number printed in the cage's top-left corner, null where none is printed.
const cages = [
  { cells: ['R1C1', 'R2C1', 'R3C1'], total: 13 },
  { cells: ['R1C2', 'R2C2', 'R2C3'], total: 23 },
  { cells: ['R1C3', 'R1C4', 'R2C4', 'R3C3', 'R3C4'], total: 31 },
  { cells: ['R1C5', 'R1C6', 'R2C6'], total: 12 },
  { cells: ['R1C7', 'R2C5', 'R2C7', 'R3C5', 'R3C6', 'R3C7'], total: null },
  { cells: ['R1C8', 'R1C9', 'R2C8', 'R3C8'], total: 21 },
  { cells: ['R2C9', 'R3C9', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'], total: null },
  { cells: ['R3C2', 'R4C2', 'R4C3', 'R4C4', 'R5C2'], total: 17 },
  { cells: ['R4C1', 'R5C1', 'R5C3', 'R6C1', 'R6C2', 'R6C3', 'R7C1', 'R7C2'], total: null },
  { cells: ['R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R7C4'], total: null },
  { cells: ['R5C7', 'R5C8', 'R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7'], total: null },
  { cells: ['R5C9', 'R6C9', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C8', 'R9C9'], total: null },
  { cells: ['R7C3', 'R8C2', 'R8C3'], total: 7 },
  { cells: ['R7C5', 'R8C4', 'R8C5', 'R8C6', 'R9C5', 'R9C6', 'R9C7'], total: null },
  { cells: ['R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4'], total: 30 },
];

// "Each shaded area forms a domino ... may touch diagonally, but not
// orthogonally" is one local condition: every shaded cell has exactly one
// orthogonally adjacent shaded cell. In a connected shaded group where each
// cell has exactly one shaded neighbour the group is a single pair, and two
// pairs touching orthogonally would leave some cell with two.
// The machine reads the cell's own flag and then its neighbours' flags: an
// unshaded centre leaves the neighbours free, a shaded centre counts them and
// must end on exactly one.
const dominoDegree = NFA.encodeSpec({
  startState: { phase: 'centre' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'centre':
        return value === SHADED
          ? { phase: 'countNeighbours', shaded: 0 }
          : { phase: 'unshadedCentre' };
      case 'unshadedCentre':
        return { phase: 'unshadedCentre' };
      case 'countNeighbours': {
        const shaded = state.shaded + (value === SHADED ? 1 : 0);
        return shaded > 1 ? undefined : { phase: 'countNeighbours', shaded };
      }
    }
  },
  accept: (state) =>
    state.phase === 'unshadedCentre' || state.shaded === 1,
}, geometry.numValues);

// Reads one orthogonal edge as (shade, digit, shade, digit). The edge is a
// shaded domino only when both flags are shaded, and then the two digits must
// be in a 2:1 ratio; otherwise the machine consumes the rest of the edge in the
// 'skip' state without constraining it.
const shadedDominoRatio = NFA.encodeSpec({
  startState: { phase: 'firstShade' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'firstShade':
        return value === SHADED
          ? { phase: 'firstDigit' }
          : { phase: 'skip', remaining: 3 };
      case 'firstDigit':
        return { phase: 'secondShade', first: value };
      case 'secondShade':
        return value === SHADED
          ? { phase: 'secondDigit', first: state.first }
          : { phase: 'skip', remaining: 1 };
      case 'secondDigit':
        return value === state.first * 2 || state.first === value * 2
          ? { phase: 'done' }
          : undefined;
      case 'skip':
        return state.remaining > 1
          ? { phase: 'skip', remaining: state.remaining - 1 }
          : { phase: 'done' };
    }
  },
  accept: (state) => state.phase === 'done',
}, geometry.numValues);

// Taking each cell with its right and lower neighbour visits every orthogonal
// edge of the grid exactly once.
const edges = graph.cells().flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => [cell, other]));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shade.makeReplicate(new Given(shade.cells()[0], SHADED, UNSHADED)),
  ...cages.map(({ cells, total }) => total === null
    ? new AllDifferent(...cells)
    : new Cage(total, ...cells)),
  // Two SHADED flags in each cage's shade cells, the rest unrestricted.
  ...cages.map(({ cells }) => new ContainExact(
    `${SHADED}_${SHADED}`, ...shade.at(cells))),
  ...graph.cells().map(cell => new NFA(dominoDegree, 'domino-degree',
    shade.at(cell), ...shade.at(graph.neighbours(cell)))),
  ...edges.map(([a, b]) => new NFA(shadedDominoRatio, 'shaded-domino-ratio',
    shade.at(a), a, shade.at(b), b)),
  new WhiteDot('R4C6', 'R5C6'),
];
