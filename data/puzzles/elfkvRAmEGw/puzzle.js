// Title: Mathemagics
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=elfkvRAmEGw
// Source: https://sudokupad.app/7BghrPt24L

// Normal sudoku rules apply. Draw a one-cell-wide loop that moves orthogonally
// through cell centres and neither branches, intersects, nor touches itself,
// including diagonally. It visits every box; in box k it has at most k cells,
// and an on-loop cell holds digit k. An orthogonal digit pair may sum to 7 or
// 10 only when both cells are off the loop.
//
// Omitted: the source gives no recoverable correspondence between the
// centre-line loop and its 24 enclosed cells, so the two deduced 3x3 magic
// squares cannot be located faithfully from the payload alone.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const loop = graph.makeOverlay('VL');

// Every loop overlay cell is either on or off the drawn centre-line loop.
const membership = loop.makeReplicate(new Given(loop.cells()[0], ON, OFF));

// An on-loop cell has exactly two orthogonal on-loop neighbours; an off-loop
// cell has none required. Together with ConnectedValues this is one loop.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membershipValue) => {
    if (phase === 'start') {
      return membershipValue === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membershipValue === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// A diagonal-only on-loop pair in a 2x2 would make the loop touch itself.
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
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = loop.makeReplicate(new NFA(
  noDiagonalTouchMachine, 'no-touch', ...loop.at(graph.block('R1C1', 2, 2))),
loop.at(blockOrigins));

// Each numbered box has 1 through k on-loop cells, and one of those cells has
// the box's reading-order number. The box cells come from the normal 3x3 grid.
const boxCountMachine = max => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, membershipValue) => {
    const next = count + (membershipValue === ON ? 1 : 0);
    return next > max ? undefined : { count: next };
  },
  accept: ({ count }) => count >= 1,
}, geometry.numValues);
const boxContainsDigitMachine = boxNumber => NFA.encodeSpec({
  startState: { phase: 'membership', found: false },
  transition: (state, value) => {
    if (state.phase === 'membership') {
      return { phase: 'digit', found: state.found, on: value === ON };
    }
    return { phase: 'membership', found: state.found || (state.on && value === boxNumber) };
  },
  accept: ({ phase, found }) => phase === 'membership' && found,
}, geometry.numValues);
const boxRules = graph.boxes().flatMap((box, index) => {
  const boxNumber = index + 1;
  return [
    new NFA(boxCountMachine(boxNumber), 'box-count', ...loop.at(box)),
    new NFA(boxContainsDigitMachine(boxNumber), 'box-digit',
      ...box.flatMap(cell => [loop.at(cell), cell])),
  ];
});

// A 7/10 sum is rejected unless both members of the orthogonal pair are off.
const sumRestrictionMachine = NFA.encodeSpec({
  startState: { phase: 'aMembership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aMembership': return { phase: 'aDigit', aOn: value === ON };
      case 'aDigit': return { phase: 'bMembership', aOn: state.aOn, aDigit: value };
      case 'bMembership': return { phase: 'bDigit', aOn: state.aOn, aDigit: state.aDigit, bOn: value === ON };
      case 'bDigit': {
        const restrictedSum = state.aDigit + value === 7 || state.aDigit + value === 10;
        return restrictedSum && (state.aOn || state.bOn) ? undefined : { phase: 'done' };
      }
      case 'done': return { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const sumRestrictions = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(sumRestrictionMachine, 'sum-off-loop',
    loop.at(cell), cell, loop.at(other), other)));

return [
  new Shape('9x9'),
  loop.toVar('loop'),
  membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...boxRules,
  ...sumRestrictions,
];
