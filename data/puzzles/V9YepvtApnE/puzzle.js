// Title: Star Python 2
// Author: Peter C. Hayward
// Video: https://www.youtube.com/watch?v=V9YepvtApnE
// Source: https://app.crackingthecryptic.com/sudoku/mM7rgHLjHD

// Rules encoded below:
//   Place 1-9 once each in every row, column and irregular region.
//   The digits 1 and 9 may not be within a king's move of themselves or each
//   other.
//   The final grid contains a 1-cell-wide python: a path of orthogonally
//   connected cells, beginning at the given (red) 1 in R6C7. Each 1 and 9 in
//   the grid is part of the python. The python may not touch itself
//   orthogonally or diagonally.
//   Digits in blue cells count how many of their surrounding cells are python.
//   Blue cells cannot be python.
//   "Not all possible blue cells are given" makes the blue clues
//   non-exhaustive: an unmarked cell is told nothing and may be python, so
//   that sentence adds no constraint.
//
// "May not touch itself orthogonally or diagonally" is read with the two cells
// either side of a 90-degree turn exempt: a turn always leaves them diagonally
// adjacent, so the strict reading admits only a straight python, which cannot
// carry the nine 1s and nine 9s that all have to lie on it.

// Python membership, one Var cell per grid cell: off the python, on it with two
// python neighbours, or one of its two ends (one python neighbour).
const OFF = 1;
const BODY = 2;
const END = 3;
const onPython = value => value === BODY || value === END;

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const python = graph.makeOverlay('VP');

// Region layout read off the drawn region borders, one label per cell in
// reading order.
const REGION_LAYOUT = [
  '111222333',
  '112222333',
  '811225533',
  '881444553',
  '981444655',
  '988444655',
  '998866665',
  '999877766',
  '997777776',
].join('');
const regions = [...new Set(REGION_LAYOUT)].map(
  label => gridCells.filter((_, i) => REGION_LAYOUT[i] === label));

// Solid-blue cells, and the solid-red cell holding the given 1.
const BLUE = [
  'R1C9', 'R2C3', 'R2C5', 'R2C7', 'R2C9', 'R3C7', 'R4C7', 'R4C8',
  'R5C1', 'R5C7', 'R7C2', 'R7C8', 'R8C4', 'R8C8', 'R9C2',
];
const RED = 'R6C7';

// --- The python is a single path. -------------------------------------------
// Every cell is OFF, BODY or END; blue cells are OFF; the red cell is an END.
// Exactly two cells are ENDs, which with the degree machine below makes the
// python cells 2-regular apart from two degree-1 cells; adding ConnectedValues
// (one connected region) leaves exactly one simple path. Two ENDs is forced by
// the rules: the nine 1s and nine 9s all lie on the python, so it has at least
// 18 cells, and a path of two or more cells has two distinct ends.
const membership = [
  python.makeReplicate(new Given(python.cells()[0], OFF, BODY, END)),
  ...python.at(BLUE).map(cell => new Given(cell, OFF)),
  new Given(python.at(RED), END),
  new ContainExact(`${END}_${END}`, ...python.cells()),
];

// Degree: a BODY cell has exactly two python orthogonal neighbours, an END
// exactly one, an OFF cell is unconstrained here. Reads the membership of the
// cell, then of each of its neighbours.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, want, count }, membership) => {
    if (phase === 'start') {
      if (membership === BODY) return { phase: 'on', want: 2, count: 0 };
      if (membership === END) return { phase: 'on', want: 1, count: 0 };
      return { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (onPython(membership) ? 1 : 0);
    return next > want ? undefined : { phase: 'on', want, count: next };
  },
  accept: ({ phase, want, count }) => phase === 'off' || count === want,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...python.at([cell, ...graph.neighbours(cell)])));

// No self-touch on a diagonal: forbid a 2x2 block whose only python cells are a
// diagonal pair. Such a pair has no python cell between it, so it is not the
// turn the reading above exempts. Reads the four membership cells of the block,
// left to right then top to bottom.
const noDiagonalTouchMachine = NFA.encodeSpec({
  // `block` accumulates the 2x2's membership flags, and becomes null once the
  // block has been checked (all further symbols are absorbed).
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, onPython(membership)];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// One template stamped on every cell that starts a 2x2 block.
const blockTopLefts = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = python.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...python.at(graph.block(gridCells[0], 2, 2))),
  python.at(blockTopLefts));

// --- Blue clues. ------------------------------------------------------------
// The blue digit equals the number of its king neighbours on the python. Reads
// the digit, then each neighbour's membership; a blue cell on an edge or corner
// has only the neighbours the grid gives it.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };   // the blue digit
    const next = count + (onPython(value) ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const blueCounts = BLUE.map(cell => new NFA(countMachine, 'blue-count',
  cell, ...python.at(graph.kingNeighbours(cell))));

// --- Digit rules tied to the python. ----------------------------------------
// Every 1 and 9 lies on the python. Reads (digit, membership) for one cell.
const onPythonKey = Pair.fnToKey(
  (digit, membership) => digit !== 1 && digit !== 9 || onPython(membership),
  geometry);
const oneNinesOnPython = gridCells.map(cell => new Pair(
  onPythonKey, 'one-nine-on-python', cell, python.at(cell)));

// 1s and 9s are not within a king's move of themselves or each other: no two
// king-adjacent cells both hold a 1 or a 9.
const kingSeparationKey = Pair.fnToKey(
  (a, b) => !((a === 1 || a === 9) && (b === 1 || b === 9)),
  geometry);
// One template per direction, stamped on every cell for which both of the
// template's offsets stay in the grid; together the four cover each
// king-adjacent pair exactly once.
const kingSeparation = [[0, 1], [1, 0], [1, 1], [1, -1]].map(([dR, dC]) => {
  // A leftward step is written as a rightward offset from the stamped cell, so
  // that both offsets are non-negative and no target precedes the origin.
  const shift = Math.max(0, -dC);
  const offsets = [[0, shift], [dR, dC + shift]];
  const stepAll = cell => offsets.map(([r, c]) => graph.step(cell, r, c));
  const [from, to] = stepAll(gridCells[0]);
  return graph.makeReplicate(
    new Pair(kingSeparationKey, 'one-nine-king', from, to),
    gridCells.filter(cell => stepAll(cell).every(Boolean)));
});

return [
  shape,
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),
  new Given('R4C5', 7),
  new Given(RED, 1),
  python.toVar('python'),
  ...membership,
  // One python: its cells form a single orthogonally-connected region.
  new ConnectedValues('VP', [BODY, END]),
  ...degrees,
  noDiagonalTouches,
  ...blueCounts,
  ...oneNinesOnPython,
  ...kingSeparation,
];
