// Title: Nori Nori Christmas
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=VEW1itoU86Q
// Source: https://sudokupad.app/2v5h5o63ej

// Normal Sudoku; each drawn dashed cage has its stated total when present and
// has no repeated digit. Shade exactly two cells in each cage. A shaded cell
// has exactly one orthogonally adjacent shaded neighbour, so shaded components
// are dominoes and distinct dominoes cannot touch orthogonally. A shaded
// adjacency has digits in a 2:1 ratio; the drawn white dot is consecutive.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Dashed-cage cells and totals, transcribed from the source artwork; null means
// the cage is deliberately unlabelled and therefore supplies distinctness only.
const cages = [
  { cells: ['R1C2', 'R2C2', 'R2C3'], total: 23 },
  { cells: ['R1C1', 'R2C1', 'R3C1'], total: 13 },
  { cells: ['R1C5', 'R1C6', 'R2C6'], total: 12 },
  { cells: ['R1C8', 'R1C9', 'R2C8', 'R3C8'], total: 21 },
  { cells: ['R1C3', 'R1C4', 'R2C4', 'R3C3', 'R3C4'], total: 31 },
  { cells: ['R1C7', 'R2C5', 'R2C7', 'R3C5', 'R3C6', 'R3C7'], total: null },
  { cells: ['R2C9', 'R3C9', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'], total: null },
  { cells: ['R3C2', 'R4C2', 'R4C3', 'R4C4', 'R5C2'], total: 17 },
  { cells: ['R4C1', 'R5C1', 'R5C3', 'R6C1', 'R6C2', 'R6C3', 'R7C1', 'R7C2'], total: null },
  { cells: ['R7C3', 'R8C2', 'R8C3'], total: 7 },
  { cells: ['R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4'], total: 30 },
  { cells: ['R7C5', 'R8C4', 'R8C5', 'R8C6', 'R9C5', 'R9C6', 'R9C7'], total: null },
  { cells: ['R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R7C4'], total: null },
  { cells: ['R5C7', 'R5C8', 'R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7'], total: null },
  { cells: ['R5C9', 'R6C9', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C8', 'R9C9'], total: null },
];

// Reads one cage's shade flags and accepts exactly two shaded cells.
const twoShaded = NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => {
    const next = count + (value === SHADED ? 1 : 0);
    return next > 2 ? undefined : { count: next };
  },
  accept: ({ count }) => count === 2,
}, geometry.numValues);

// Reads a cell flag followed by its orthogonal-neighbour flags. When the first
// flag is shaded, exactly one neighbour must be shaded; otherwise the cell is free.
const dominoDegree = NFA.encodeSpec({
  startState: { phase: 'centre' },
  transition: ({ phase, count }, value) => {
    if (phase === 'centre') {
      return value === SHADED ? { phase: 'shaded', count: 0 } : { phase: 'unshaded' };
    }
    if (phase === 'unshaded') return { phase: 'unshaded' };
    const next = count + (value === SHADED ? 1 : 0);
    return next > 1 ? undefined : { phase: 'shaded', count: next };
  },
  accept: ({ phase, count }) => phase === 'unshaded' || count === 1,
}, geometry.numValues);

// Reads (shade, digit) for both ends of one orthogonal edge. It skips an edge
// unless both ends are shaded; then it requires the two digits to have ratio 2:1.
const shadedRatio = NFA.encodeSpec({
  startState: { phase: 'firstShade' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'firstShade':
        return value === SHADED ? { phase: 'firstDigit' } : { phase: 'skip', left: 3 };
      case 'firstDigit':
        return { phase: 'secondShade', first: value };
      case 'secondShade':
        return value === SHADED
          ? { phase: 'secondDigit', first: state.first }
          : { phase: 'skip', left: 1 };
      case 'secondDigit':
        return value === state.first * 2 || state.first === value * 2
          ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);

// Right/down neighbours enumerate every orthogonal grid edge exactly once.
const shadedRatios = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(shadedRatio, 'shaded-ratio',
    shade.at(cell), cell, shade.at(other), other)));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shade.makeReplicate(new Given(shade.cells()[0], SHADED, UNSHADED)),
  ...cages.map(({ cells, total }) => total === null
    ? new AllDifferent(...cells)
    : new Cage(total, ...cells)),
  ...cages.map(({ cells }) => new NFA(twoShaded, 'two-shaded', ...shade.at(cells))),
  ...gridCells.map(cell => new NFA(dominoDegree, 'domino-degree',
    ...shade.at([cell, ...graph.neighbours(cell)]))),
  ...shadedRatios,
  new WhiteDot('R4C6', 'R5C6'),
];
