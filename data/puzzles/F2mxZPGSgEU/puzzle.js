// Title: Godzilla In Sudokutown
// Author: FryTheGuy
// Video: https://www.youtube.com/watch?v=F2mxZPGSgEU
// Source: https://app.crackingthecryptic.com/sudoku/4GP3nrFJLd
//
// Standard sudoku. R5C1 and R8C4 (the grey circles) hold odd digits. Digits
// are skyscraper heights; the 18 outside clues count visible skyscrapers from
// each vantage point, scanning near-to-far, where a cell is visible if its
// digit beats every earlier digit on the line. Godzilla draws a single
// orthogonal path from R1C1 to R9C9 (the grey squares) that cannot touch
// itself, even diagonally, cannot cross a 9, and removes every path cell from
// the skyscraper scans (neither counted nor able to block a later digit).
//
// Path membership is a Var overlay (ON=1 / OFF=2) per grid cell, shaped into a
// single simple path by: domain restriction, the two endpoints forced ON,
// per-cell degree NFAs (endpoints degree 1, other on-path cells degree 2,
// off-path cells free) over orthogonal neighbours, a no-diagonal-touch NFA
// over every 2x2 block, and single-region connectivity on the ON cells. With
// degree capped at 2 everywhere, no cell can be a branch point, so orthogonal
// self-touch is already excluded by the degree rule; the 2x2 NFA adds the
// diagonal case, which degree alone cannot see.

const ON = 1;   // path-membership values, stored in the Var cells
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

const path = graph.makeOverlay('VP');
const ENDPOINTS = ['R1C1', 'R9C9'];

// --- Path membership domain + endpoints ---
const originCell = path.cells()[0];
const membership = [
  path.makeReplicate(new Given(originCell, ON, OFF)),
  ...ENDPOINTS.map(cell => new Given(path.at(cell), ON)),
];

// --- Degree: each on-path cell has exactly `target` on-path orthogonal
// neighbours (1 at the two endpoints, 2 everywhere else on the path);
// off-path cells are unconstrained. Reads this cell's membership, then each
// orthogonal neighbour's membership.
function makeDegreeMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, membershipValue) => {
      if (phase === 'start') {
        return membershipValue === ON
          ? { phase: 'on', onNeighbours: 0 }
          : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (membershipValue === ON ? 1 : 0);
      return count > target ? undefined : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === target,
  }, numValues);
}
const degree1Machine = makeDegreeMachine(1);
const degree2Machine = makeDegreeMachine(2);
const isEndpoint = new Set(ENDPOINTS);
const degrees = gridCells.map(cell => new NFA(
  isEndpoint.has(cell) ? degree1Machine : degree2Machine,
  'degree', ...path.at([cell, ...graph.neighbours(cell)])));

// --- No diagonal self-touch: forbid a 2x2 block whose only on-path cells are
// a diagonal pair. Reads the four membership cells of the block in reading
// order (top-left, top-right, bottom-left, bottom-right).
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, membershipValue) => {
    if (block === null) return { block: null };
    const next = [...block, membershipValue === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = path.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...path.at(graph.block(gridCells[0], 2, 2))),
  path.at(blockOrigins));

// --- Godzilla cannot cross a 9: on any cell, membership ON and digit 9 may
// not both hold.
const noNineKey = Pair.fnToKey((digitValue, membershipValue) =>
  !(membershipValue === ON && digitValue === 9), numValues);
const noNineOnPath = gridCells.map(cell =>
  new Pair(noNineKey, 'no-nine-on-path', cell, path.at(cell)));

// --- Skyscraper visibility, skipping on-path cells entirely (they neither
// count as a skyscraper nor block a later one). Reads (membership, digit)
// pairs in near-to-far order; a later digit is visible when it beats the
// running max among off-path cells seen so far.
function makeSkyscraperMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'mem', max: 0, count: 0 },
    transition: (state, value) => {
      if (state.phase === 'mem') {
        return { phase: 'digit', max: state.max, count: state.count, on: value === ON };
      }
      const { max, count, on } = state;
      if (on) return { phase: 'mem', max, count };
      if (value <= max) return { phase: 'mem', max, count };
      const nextCount = count + 1;
      // Kill the branch as soon as it can only fail: another visible digit
      // beyond the clue's target is never recoverable.
      return nextCount > target ? undefined : { phase: 'mem', max: value, count: nextCount };
    },
    accept: (state) => state.phase === 'mem' && state.count === target,
  }, numValues);
}

// Outside skyscraper clues: [target, near-to-far cell ids].
// Transcribed from the drawn outside-clue overlays.
const skyscraperClues = [
  [4, ['R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3']],
  [2, ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6']],
  [3, ['R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R9C7']],
  [1, ['R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8']],
  [1, ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9']],
  [5, ['R9C2', 'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R1C2']],
  [2, ['R9C3', 'R8C3', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R2C3', 'R1C3']],
  [5, ['R9C5', 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5', 'R2C5', 'R1C5']],
  [2, ['R9C8', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C8', 'R2C8', 'R1C8']],
  [3, ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9']],
  [1, ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9']],
  [5, ['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9']],
  [4, ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9']],
  [5, ['R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1']],
  [2, ['R3C9', 'R3C8', 'R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R3C2', 'R3C1']],
  [3, ['R6C9', 'R6C8', 'R6C7', 'R6C6', 'R6C5', 'R6C4', 'R6C3', 'R6C2', 'R6C1']],
  [5, ['R7C9', 'R7C8', 'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R7C2', 'R7C1']],
  [3, ['R8C9', 'R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1']],
];
const skyscrapers = skyscraperClues.map(([target, cells]) => new NFA(
  makeSkyscraperMachine(target), 'skyscraper',
  ...cells.flatMap(cell => [path.at(cell), cell])));

return [
  new Shape('9x9'),
  path.toVar('path'),
  ...membership,
  new ConnectedValues('VP', ON),
  ...degrees,
  noDiagonalTouches,
  ...noNineOnPath,
  ...skyscrapers,
  // Grey circles: odd digits (candidate restriction, per catalog convention).
  new Given('R5C1', 1, 3, 5, 7, 9),
  new Given('R8C4', 1, 3, 5, 7, 9),
];
