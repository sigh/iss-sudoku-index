// Title: One Grandmaster's Tribute To Another
// Author: Prasanna Seshadri
// Video: https://www.youtube.com/watch?v=UTX8dF3n57M
// Source: https://cracking-the-cryptic.web.app/sudoku/29tgh3PGTm

// Rules encoded here, in full:
//  * Normal sudoku rules apply except the regions are irregular: rows and
//    columns hold 1-9 once each, and the nine drawn irregular regions
//    replace the default 3x3 boxes.
//  * A snake -- a path of orthogonally-connected cells that may not touch
//    itself orthogonally (but may touch itself diagonally) -- runs from one
//    grey-circle cell to the other. Its cells and length are not given.
//  * The cells the snake does not occupy split into exactly eight
//    orthogonally-connected areas, one of each size from 1 to 8 cells; which
//    cells form which area is not given.
//  * An area of size n contains each digit from 1 to n exactly once, and no
//    other digit.
//
// "Area" is read as a maximal orthogonally-connected component of non-snake
// cells -- the only reading under which "an area of size n" names a single
// well-defined region at all.
//
// Two Var overlays carry the solver-discovered structure:
//  * VL (path membership): ON if the cell is on the snake, OFF otherwise.
//  * VR (area label): 1-8 names which of the eight areas a non-snake cell
//    belongs to; SNAKE (9) marks a snake cell. A per-cell NFA ties the two
//    overlays together (VL is ON exactly where VR is SNAKE), so VR's
//    SNAKE-valued cells inherit VL's connectivity/degree model and need no
//    separate connectivity assertion of their own.
//
// Because the eight areas total 1+2+...+8 = 36 cells, the snake necessarily
// covers the other 81-36 = 45 cells; that arithmetic is a consequence of the
// rules below, not a fact encoded separately.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

// --- Irregular regions ---------------------------------------------------
// The nine drawn 9-cell irregular regions.
const REGIONS = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C3', 'R1C4', 'R1C5', 'R2C5', 'R3C5', 'R1C6'],
  ['R1C7', 'R1C8', 'R2C8', 'R2C7', 'R2C6', 'R3C6', 'R3C7', 'R4C6', 'R4C5'],
  ['R1C9', 'R2C9', 'R3C9', 'R3C8', 'R4C8', 'R4C9', 'R5C9', 'R5C8', 'R6C9'],
  ['R4C7', 'R5C7', 'R5C6', 'R5C5', 'R6C7', 'R7C7', 'R6C8', 'R7C8', 'R7C9'],
  ['R2C1', 'R2C2', 'R3C2', 'R3C3', 'R4C2', 'R5C2', 'R6C2', 'R6C3', 'R5C3'],
  ['R2C4', 'R3C4', 'R4C4', 'R4C3', 'R5C4', 'R6C4', 'R7C4', 'R7C5', 'R6C5'],
  ['R6C6', 'R7C6', 'R8C6', 'R8C5', 'R8C4', 'R9C2', 'R8C3', 'R9C3', 'R9C1'],
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R8C2', 'R7C2', 'R7C3'],
  ['R9C4', 'R9C5', 'R9C6', 'R8C7', 'R9C7', 'R8C8', 'R9C8', 'R9C9', 'R8C9'],
];
const jigsawPieces = REGIONS.map(
  cells => new Jigsaw(geometry.name, ...cells));

// --- Givens ----------------------------------------------------------------
const givens = [
  new Given('R2C2', 8),
  new Given('R5C5', 5),
  new Given('R6C4', 7),
  new Given('R7C3', 9),
];

// --- Snake path (VL) ---------------------------------------------------
// The two grey-circle cells: the snake's head and tail, unordered since the
// rules do not name which is which.
const HEAD_TAIL = ['R5C6', 'R8C3'];

const ON = 1;
const OFF = 2;

const path = graph.makeOverlay('VL');
const pathMembership = [
  path.makeReplicate(new Given(path.cells()[0], ON, OFF)),
  ...HEAD_TAIL.map(cell => new Given(path.at(cell), ON)),
];

// Degree over orthogonal neighbours: off cells are free, on cells must have
// exactly `targetDegree` on-path orthogonal neighbours -- 1 at the two
// head/tail cells (path endpoints), 2 everywhere else on the path. Reads
// [this cell's membership, then each orthogonal neighbour's membership].
const degreeMachine = (targetDegree) => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > targetDegree ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === targetDegree,
}, numValues);
const degreeEndpoint = degreeMachine(1);
const degreeSpine = degreeMachine(2);

const degrees = gridCells.map(cell => new NFA(
  HEAD_TAIL.includes(cell) ? degreeEndpoint : degreeSpine,
  'snake-degree', ...path.at([cell, ...graph.neighbours(cell)])));

// Single path: the on-path cells form one orthogonally-connected region.
// Combined with the degree-1 endpoints and degree-2 spine above, this rules
// out a second, disjoint on-path loop or path fragment elsewhere.
const pathConnected = new ConnectedValues('VL', ON);

// --- Area label (VR) -----------------------------------------------------
// One Var per cell: 1-8 names the area a non-snake cell belongs to; SNAKE
// (9) marks a snake cell. No domain restriction is added -- the default
// 1-9 range already matches SNAKE's value.
const SNAKE = 9;
const area = graph.makeOverlay('VR');

// VL/VR agreement: a cell is on the snake path exactly when its area label
// is SNAKE.
const pathAreaKey = Pair.fnToKey((vl, vr) => (vl === ON) === (vr === SNAKE), numValues);
const pathAreaAgree = gridCells.map(
  cell => new Pair(pathAreaKey, 'path-area-agree', path.at(cell), area.at(cell)));

// Each area value 1-8 is a single-value, disjoint, non-empty subset of one
// grid-sized layer (SNAKE gets no ConnectedValues of its own -- its
// connectivity already follows from the path model above).
const areaConnected = Array.from(
  { length: 8 }, (_, i) => new ConnectedValues('VR', i + 1));

// Area size + digit range + digit coverage, all at once. For area value k,
// scanning the whole grid as [VR, digit] pairs: a cell not labelled k is
// skipped; a cell labelled k must hold a digit <= k (an area of size n holds
// no digit above n) and must not repeat a digit already seen in area k (an
// area holds each digit at most once). Requiring by the end of the scan that
// every digit 1..k has been seen forces at least k cells into area k; no
// repeats caps it at k cells; together that pins the area at exactly k
// cells, each digit 1..k appearing exactly once -- "an area of size n
// contains each digit from 1 to n exactly once, and no other digit" in one
// constraint, with no separate cell-count check needed.
const coverageNFA = (k) => NFA.encodeSpec({
  startState: { phase: 'r', seen: 0 },
  transition: (state, value) => {
    if (state.phase === 'r') return { phase: 'd', seen: state.seen, r: value };
    if (state.r !== k) return { phase: 'r', seen: state.seen };
    if (value > k) return undefined;
    const bit = 1 << (value - 1);
    if (state.seen & bit) return undefined;
    return { phase: 'r', seen: state.seen | bit };
  },
  accept: (state) => state.phase === 'r' && state.seen === (1 << k) - 1,
}, numValues);
const areaCoverage = Array.from({ length: 8 }, (_, i) => {
  const k = i + 1;
  return new NFA(coverageNFA(k), `area-size-${k}`,
    ...gridCells.flatMap(cell => [area.at(cell), cell]));
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...jigsawPieces,
  ...givens,
  path.toVar('snakePath'),
  ...pathMembership,
  ...degrees,
  pathConnected,
  area.toVar('areaLabel'),
  ...pathAreaAgree,
  ...areaConnected,
  ...areaCoverage,
];
