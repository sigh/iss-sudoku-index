// Title: Snake Farm
// Author: Cris Moore
// Video: https://www.youtube.com/watch?v=j_eLeCIF6Bk
// Source: https://app.crackingthecryptic.com/ot5h01fnjr

// Rules encoded here:
//   - Standard sudoku: rows, columns and 3x3 boxes (the ISS baseline; the
//     payload gives no cell a custom region and no given digit).
//   - The grid is divided into 9 snakes. Each snake is a path of 9 cells that
//     starts at its tail and steps orthogonally north or east to its head.
//     Digits in a snake cannot repeat.
//   - Three heads (red diamonds) and two tails (green squares) are shown, each
//     with a short line pointing at the adjacent cell of the same snake.
//   - The snake containing the blue dot at R1C7 has digits increasing from its
//     tail to its head.
//   - A white dot means the two digits differ by 1; a black dot means one is
//     double the other. The rules give no exhaustiveness clause, so undotted
//     adjacent pairs are unconstrained and the strict classes do not apply.
// Nothing is omitted.

// Snake geometry. A north step (row - 1) and an east step (column + 1) each
// raise (column - row) by exactly 1, so a snake meets 9 consecutive
// diagonals of constant (column - row), one cell on each, and never puts
// two of its cells on one diagonal. ChaosConstruction supplies the other
// half of the rule directly: 9 orthogonally connected 9-cell regions whose
// digits do not repeat. Constraining the region labels on each diagonal
// to differ leaves every region with at most one cell per diagonal; a
// connected 9-cell region must then occupy 9 consecutive diagonals with
// one cell on each (a skipped diagonal would disconnect it, since every
// orthogonal step changes column - row by 1), and consecutive cells must be
// adjacent, which makes the region exactly a north/east path of 9 cells.

const grid = cellGraph('9x9');
const regions = grid.makeOverlay('CC');

const gridDiagonal = (cell) => {
  const { row, col } = parseCellId(cell);
  return col - row;
};

const byDiagonal = new Map();
for (const cell of grid.cells()) {
  const key = gridDiagonal(cell);
  if (!byDiagonal.has(key)) byDiagonal.set(key, []);
  byDiagonal.get(key).push(cell);
}

const oneCellPerDiagonal = [...byDiagonal.values()]
  .filter((cells) => cells.length > 1)
  .map((cells) => new AllDifferent(...regions.at(cells)));

// Drawn markers, with the cell each marker's line points at. The head lines run
// west or south, backwards along a snake; the tail lines run north, forwards
// along a snake. Either way the line names a cell of the marked cell's own
// snake, so the marked cell and the cell it points at share a region.
// A head has no onward step, so its north and east neighbours are in other
// snakes; a tail has nothing stepping into it, so its south and west
// neighbours are in other snakes.
const MARKERS = [
  { marker: 'head', cell: 'R4C5', points: 'R4C4' },
  { marker: 'head', cell: 'R2C4', points: 'R2C3' },
  { marker: 'head', cell: 'R3C9', points: 'R4C9' },
  { marker: 'tail', cell: 'R9C4', points: 'R8C4' },
  { marker: 'tail', cell: 'R6C6', points: 'R5C6' },
];

const AWAY_STEPS = {
  head: [[-1, 0], [0, 1]],   // north, east
  tail: [[1, 0], [0, -1]],   // south, west
};

const snakeMarkers = MARKERS.flatMap(({ marker, cell, points }) => [
  new SameValues(2, ...regions.at([cell, points])),
  ...AWAY_STEPS[marker]
    .map(([dRow, dCol]) => grid.step(cell, dRow, dCol))
    .filter((other) => other !== null)
    .map((other) => new AllDifferent(...regions.at([cell, other]))),
]);

// Thermosnake. Its 9 digits do not repeat and increase along the path, so they
// are 1..9 in path order and each cell's digit is its position in the snake.
// Position advances with the diagonal, so every cell of the blue dot's
// snake satisfies digit = digit(R1C7) + (its diagonal - the dot's).
const BLUE_DOT = 'R1C7';

// A snake's cells are totally ordered by its north/east travel, so a cell can
// share the dot's snake only if it is weakly southwest or weakly northeast of
// it, and within the snake's 9 diagonals.
const thermoCandidates = grid.cells().filter((cell) => {
  const { row, col } = parseCellId(cell);
  const dot = parseCellId(BLUE_DOT);
  const ordered = (row >= dot.row && col <= dot.col)
    || (row <= dot.row && col >= dot.col);
  return cell !== BLUE_DOT && ordered
    && Math.abs(gridDiagonal(cell) - gridDiagonal(BLUE_DOT)) <= 8;
});

// Cells are read as [region of R1C7, region of this cell, digit of R1C7,
// digit of this cell]. The first two decide membership: unequal labels move to
// the accepting 'free' state and leave the digits alone. Equal labels put the
// dot's digit plus this cell's diagonal offset into 'want', which the last
// symbol must match.
const thermoSpec = (offset) => ({
  startState: { phase: 'label' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'label':
        return { phase: 'member', label: value };
      case 'member':
        return value === state.label ? { phase: 'anchor' } : { phase: 'free' };
      case 'anchor': {
        const want = value + offset;
        return (want >= 1 && want <= 9) ? { phase: 'target', want } : undefined;
      }
      case 'target':
        return value === state.want ? { phase: 'free' } : undefined;
      default:
        return { phase: 'free' };
    }
  },
  accept: (state) => state.phase === 'free',
});

const thermoEncodings = new Map();
const thermoEncoding = (offset) => {
  if (!thermoEncodings.has(offset)) {
    thermoEncodings.set(offset, NFA.encodeSpec(thermoSpec(offset), 9));
  }
  return thermoEncodings.get(offset);
};

const thermosnake = thermoCandidates.map((cell) => new NFA(
  thermoEncoding(gridDiagonal(cell) - gridDiagonal(BLUE_DOT)),
  'Thermosnake',
  regions.at(BLUE_DOT), regions.at(cell), BLUE_DOT, cell));

// Drawn dots: f-puzzles 'difference' entries (no value, so difference 1) and
// 'ratio' entries (no value, so ratio 1:2).
const WHITE_DOTS = [
  ['R9C7', 'R9C6'],
  ['R5C2', 'R6C2'],
  ['R1C1', 'R2C1'],
  ['R4C2', 'R5C2'],
];
const BLACK_DOTS = [
  ['R3C9', 'R4C9'],
  ['R3C5', 'R3C6'],
];

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  ...oneCellPerDiagonal,
  ...snakeMarkers,
  ...thermosnake,
  ...WHITE_DOTS.map((cells) => new WhiteDot(...cells)),
  ...BLACK_DOTS.map((cells) => new BlackDot(...cells)),
];
