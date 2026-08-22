// Title: Snek is Friend
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=19oI1pITI5s
// Source: https://app.crackingthecryptic.com/sudoku/6b4fM2jNL4

// Normal 9x9 sudoku (standard rows/columns/boxes), no givens. A cell is
// "friendly" if its digit equals its own row number, column number, or box
// number (1-9, reading order). All friendly cells form a single
// orthogonally-connected snake that does not branch and does not touch
// itself, even diagonally. "Snake" is read as an open path with a head and a
// tail, not a closed loop -- the rules never say "loop" or "ring", and the
// puzzle's own title/genre is a snake, distinct from the "loop" puzzles this
// same modelling pattern is normally used for.
//
// Each drawn dot joins two orthogonally-adjacent cells that are both
// friendly. A dot is white when the two cells share at least one matching
// "type" (both hit the rule via row, or both via column, or both via box);
// grey otherwise. A cell may satisfy more than one type at once (e.g. digit
// equal to both its row and column number) -- "type" is which criterion (or
// criteria) each cell individually satisfies, not that the two cells share
// the same numeric value.

const ON = 1, OFF = 2;   // friendly-membership overlay values
const LOW = 1, HIGH = 2; // shape-role overlay values: LOW = path endpoint or
                          // an isolated single-cell snake (friendly degree <= 1)

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Standard 3x3 box number (1-9, reading order) for a 1-based (row, col).
const boxOf = (row, col) => Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;

// --- Friendly-membership overlay: one Var per grid cell, ON/OFF. ---
const friendly = graph.makeOverlay('VF');
const friendlyOrigin = friendly.cells()[0];

// Links the overlay to the grid digit: a 2-cell relation between the digit
// and its membership flag, so it is a Pair rather than an NFA. Checks
// membership === ON iff the digit equals this cell's own row/col/box number.
// row/col/box are baked in per cell -- they are fixed geometry, not solver
// state.
const friendlyLinks = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const box = boxOf(row, col);
  const key = Pair.fnToKey(
    (digit, membership) => membership === ((digit === row || digit === col || digit === box) ? ON : OFF),
    geometry.numValues);
  return new Pair(key, 'friendly-link', cell, friendly.at(cell));
});

// --- Shape-role overlay: LOW/HIGH, derived from friendly membership. ---
// Reads (own membership, each orthogonal neighbour's membership, own role) and
// rejects a friendly cell with 3+ friendly neighbours (no branching), then
// checks role === LOW iff the cell is friendly with at most 1 friendly
// neighbour (a path endpoint, or the whole isolated single-cell snake).
// Non-friendly cells always take role HIGH.
const role = graph.makeOverlay('VR');
const roleOrigin = role.cells()[0];
const roleMachine = (neighbourCount) => NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: (state, value) => {
    if (state.phase === 'self') {
      return { phase: 'count', remaining: neighbourCount, onCount: 0, isFriendly: value === ON };
    }
    if (state.phase === 'count') {
      const onCount = state.onCount + (value === ON ? 1 : 0);
      // Only a friendly cell's own degree is capped (no branching); an
      // off cell may freely have 3+ friendly neighbours.
      if (state.isFriendly && onCount > 2) return undefined;
      const remaining = state.remaining - 1;
      return remaining > 0
        ? { phase: 'count', remaining, onCount, isFriendly: state.isFriendly }
        : { phase: 'role', onCount, isFriendly: state.isFriendly };
    }
    const expected = state.isFriendly && state.onCount <= 1 ? LOW : HIGH;
    return value === expected ? { phase: 'done' } : undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const shapeRoles = gridCells.map(cell => {
  const neighbours = graph.neighbours(cell);
  return new NFA(roleMachine(neighbours.length), 'shape-role',
    friendly.at(cell), ...friendly.at(neighbours), role.at(cell));
});

// --- No diagonal self-touch: forbid a 2x2 block whose only friendly cells
// are the two on one diagonal. Same pattern as the other loop/snake scripts.
// One NFA template anchored at the grid's first 2x2 block, replicated (via
// the friendly overlay's own coordinate system) to every other valid
// top-left position -- these are genuine shifted copies of one template.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
const noDiagonalTouchTemplate = new NFA(noDiagonalTouchMachine, 'no-touch',
  ...friendly.at(graph.block(gridCells[0], 2, 2)));
const noDiagonalTouchTargets = friendly.at(
  gridCells.filter(cell => graph.block(cell, 2, 2)));
const noDiagonalTouches = [
  friendly.makeReplicate(noDiagonalTouchTemplate, noDiagonalTouchTargets),
];

// --- Dots: both endpoints friendly, colour fixed by shared matching type.
// A 2-cell relation between the two raw digits (not the overlay), so it is a
// Pair. Checks each digit against its own cell's row/col/box, since the dot
// rule is about which criterion each cell individually satisfies.

// Dot cell pairs and colours, from the puzzle's drawn edge marks.
const dots = [
  ['R7C9', 'R8C9', true],
  ['R3C3', 'R3C4', true],
  ['R6C4', 'R7C4', true],
  ['R8C8', 'R8C9', false],
  ['R9C1', 'R9C2', false],
  ['R1C6', 'R1C7', false],
].map(([a, b, white]) => {
  const { row: rowA, col: colA } = parseCellId(a);
  const { row: rowB, col: colB } = parseCellId(b);
  const boxA = boxOf(rowA, colA), boxB = boxOf(rowB, colB);
  const key = Pair.fnToKey((digitA, digitB) => {
    const aRow = digitA === rowA, aCol = digitA === colA, aBox = digitA === boxA;
    const bRow = digitB === rowB, bCol = digitB === colB, bBox = digitB === boxB;
    if (!(aRow || aCol || aBox) || !(bRow || bCol || bBox)) return false; // both must be friendly
    const sameType = (aRow && bRow) || (aCol && bCol) || (aBox && bBox);
    return sameType === white;
  }, geometry.numValues);
  return new Pair(key, 'dot', a, b);
});

return [
  new Shape('9x9'),
  friendly.toVar('friendly'),
  role.toVar('shape role'),
  // Restrict every overlay cell's domain via one replicated Given each,
  // rather than 81 individual Givens.
  friendly.makeReplicate(new Given(friendlyOrigin, ON, OFF)),
  role.makeReplicate(new Given(roleOrigin, LOW, HIGH)),
  ...friendlyLinks,
  // Single connected snake: every friendly cell in one orthogonal region.
  new ConnectedValues('VF', ON),
  ...shapeRoles,
  // At least one LOW-role cell: rules out the all-degree-2 case (a closed
  // loop), which "single connected + max friendly-degree 2" would otherwise
  // also allow.
  new ContainAtLeast('1', ...role.at(gridCells)),
  ...noDiagonalTouches,
  ...dots,
];
