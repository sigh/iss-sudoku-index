// Title: Scrub Python
// Author: Peter C. Hayward
// Video: https://www.youtube.com/watch?v=yDkkFZvQi5A
// Source: https://app.crackingthecryptic.com/webapp/mQgPbbGfGr

// Rules encoded below, in full:
//   Normal Sudoku rules apply.
//   The grid contains a 1-cell-wide python: a path of orthogonally connected
//   cells that begins at one red cell (R9C1) and ends at the other (R5C5).
//   The python may not touch itself orthogonally or diagonally.
//   The digits on the python form a palindrome, with the given 8 (R3C9) at the
//   midpoint.
//   The blue cells are not python. Each blue cell's digit is the number of its
//   up-to-8 king neighbours that are python.
//   All possible blue cells are given: no unshaded cell is both off the python
//   and equal to that same neighbour count.
// Nothing is omitted.

const ON = 1;   // VP: python membership, one Var cell per grid cell
const OFF = 2;

// Distance from the palindrome's midpoint, carried as two residues so that the
// two cells the palindrome pairs can be recognised locally. A cell's distance
// is its step count along the python from R3C9. VA holds (distance mod 7) + 1,
// VB holds (distance mod 8) + 1; the top value of each layer marks a cell that
// is off the python. 7 and 8 are coprime, so two python cells share both
// residues exactly when their distances differ by a multiple of 56; a python of
// at most 81 cells has an arm of at most 40 cells, so within this grid equal
// residues mean equal distance.
const A_MOD = 7;
const B_MOD = 8;
const A_OFF = A_MOD + 1;   // 8
const B_OFF = B_MOD + 1;   // 9
const MAX_ARM = 40;        // floor((81 - 1) / 2): longest possible half-python

// Residue value one step nearer the midpoint.
const stepInA = value => ((value - 2 + A_MOD) % A_MOD) + 1;
const stepInB = value => ((value - 2 + B_MOD) % B_MOD) + 1;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const python = graph.makeOverlay('VP');    // on/off the python
const armA = graph.makeOverlay('VA');      // distance mod 7
const armB = graph.makeOverlay('VB');      // distance mod 8

// Drawn data: the shaded cells and the four given digits, read off the grid.
const blueCells = [
  'R1C7', 'R1C9', 'R2C2', 'R2C4', 'R3C5', 'R4C3', 'R4C6',
  'R4C8', 'R5C6', 'R6C9', 'R7C2', 'R7C6', 'R8C2',
];
const redCells = ['R9C1', 'R5C5'];
const midpointCell = 'R3C9';               // the purple cell, holding the given 8
const givens = [
  new Given('R3C3', 1),
  new Given(midpointCell, 8),
  new Given('R4C6', 3),
  new Given('R5C1', 7),
];

// --- Layer domains and the three layers' agreement about membership. ---
const domains = [
  python.makeReplicate(new Given(python.cells()[0], ON, OFF)),
  armA.makeReplicate(new Given(armA.cells()[0], 1, 2, 3, 4, 5, 6, 7, A_OFF)),
  // VB uses all nine values, so it needs no restriction.
];
const membershipKeyA = Pair.fnToKey(
  (member, residue) => (member === ON) === (residue !== A_OFF), geometry);
const membershipKeyB = Pair.fnToKey(
  (member, residue) => (member === ON) === (residue !== B_OFF), geometry);
const membershipAgrees = gridCells.flatMap(cell => [
  new Pair(membershipKeyA, 'on-python-A', python.at(cell), armA.at(cell)),
  new Pair(membershipKeyB, 'on-python-B', python.at(cell), armB.at(cell)),
]);

// --- Fixed membership: the red ends and the purple midpoint are python, the
// --- blue cells are not. The midpoint is at distance 0.
const fixedMembership = [
  ...redCells.map(cell => new Given(python.at(cell), ON)),
  new Given(python.at(midpointCell), ON),
  new Given(armA.at(midpointCell), 1),
  new Given(armB.at(midpointCell), 1),
  ...blueCells.map(cell => new Given(python.at(cell), OFF)),
];

// --- Degree: a python cell has exactly `expected` python cells orthogonally
// --- adjacent to it -- one at each red end, two everywhere else. Reads the
// --- cell's own membership, then each neighbour's; off cells are free.
const degreeMachine = expected => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', count: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (membership === ON ? 1 : 0);
    return next > expected ? undefined : { phase: 'on', count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count === expected,
}, geometry.numValues);
const endMachine = degreeMachine(1);
const throughMachine = degreeMachine(2);
const degrees = gridCells.map(cell => new NFA(
  redCells.includes(cell) ? endMachine : throughMachine, 'degree',
  ...python.at([cell, ...graph.neighbours(cell)])));

// --- 1-cell-wide, and no diagonal self-touch. Reads the four membership cells
// --- of a 2x2 block, left-to-right then top-to-bottom. Two python cells on a
// --- diagonal of the block with neither shared orthogonal neighbour on the
// --- python are a diagonal touch between cells that cannot be consecutive; all
// --- four on the python is two cells wide. Three on the block is a legal turn.
const noTouchMachine = NFA.encodeSpec({
  // `block` accumulates the 2x2's membership flags, and becomes null once the
  // block has passed the check (all further symbols are absorbed).
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    const allFour = topLeft && topRight && bottomLeft && bottomRight;
    return diagonalOnly || allFour ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// One template over the top-left 2x2 block, stamped onto every block's top-left
// cell -- the 64 copies are the same machine at a shifted position.
const noTouchTemplate = new NFA(noTouchMachine, 'no-touch',
  ...python.at(graph.block(gridCells[0], 2, 2)));
const noTouches = python.makeReplicate(noTouchTemplate,
  python.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// --- Distance labelling: every python cell other than the midpoint has exactly
// --- one orthogonal neighbour whose residues are one step nearer the midpoint.
// --- Reads the cell's own (VA, VB), then each neighbour's. Together with the
// --- degree rule and the single-region rule this both connects every python
// --- cell to the midpoint and makes the residues the true step distance.
const distanceMachine = NFA.encodeSpec({
  startState: { phase: 'selfA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'selfA':
        // Cells off the python carry the sentinel and are not labelled.
        return value === A_OFF ? { phase: 'skip' } : { phase: 'selfB', a: value };
      case 'skip':
        return { phase: 'skip' };
      case 'selfB':
        return { phase: 'nbrA', a: state.a, b: value, count: 0 };
      case 'nbrA':
        return {
          phase: 'nbrB', a: state.a, b: state.b, count: state.count,
          nearerA: value === stepInA(state.a),
        };
      case 'nbrB': {
        const nearer = state.nearerA && value === stepInB(state.b);
        const count = state.count + (nearer ? 1 : 0);
        return count > 1
          ? undefined
          : { phase: 'nbrA', a: state.a, b: state.b, count };
      }
    }
  },
  accept: state => state.phase === 'skip'
    || (state.phase === 'nbrA' && state.count === 1),
}, geometry.numValues);
const distanceLabels = gridCells
  .filter(cell => cell !== midpointCell)
  .map(cell => new NFA(distanceMachine, 'nearer',
    armA.at(cell), armB.at(cell),
    ...graph.neighbours(cell).flatMap(n => [armA.at(n), armB.at(n)])));

// --- The given 8 is the midpoint: both red ends are the same distance away.
const equalArms = [
  new SameValues(2, ...armA.at(redCells)),
  new SameValues(2, ...armB.at(redCells)),
];

// --- Palindrome: the two python cells at each distance from the midpoint hold
// --- the same digit. One machine per distance, scanning (VA, VB, digit) for
// --- every cell and requiring the digits of the cells carrying that distance's
// --- residue pair to agree.
const palindromeMachine = distance => {
  const aValue = (distance % A_MOD) + 1;
  const bValue = (distance % B_MOD) + 1;
  return NFA.encodeSpec({
    startState: { phase: 'residueA', digit: null },
    transition: (state, value) => {
      switch (state.phase) {
        case 'residueA':
          return {
            phase: 'residueB', digit: state.digit, atDistanceA: value === aValue,
          };
        case 'residueB':
          return {
            phase: 'digit', digit: state.digit,
            atDistance: state.atDistanceA && value === bValue,
          };
        case 'digit':
          if (!state.atDistance) return { phase: 'residueA', digit: state.digit };
          if (state.digit === null) {
            return { phase: 'residueA', digit: value };
          }
          return state.digit === value
            ? { phase: 'residueA', digit: state.digit }
            : undefined;
      }
    },
    accept: ({ phase }) => phase === 'residueA',
  }, geometry.numValues);
};
const palindromeCells = gridCells.flatMap(
  cell => [armA.at(cell), armB.at(cell), cell]);
const palindrome = Array.from({ length: MAX_ARM }, (_, i) => i + 1).map(
  distance => new NFA(palindromeMachine(distance), `mirror-${distance}`,
    ...palindromeCells));

// --- Blue cells: the digit counts the python cells among the king neighbours.
// --- Reads the digit, then each neighbour's membership.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const blueCounts = blueCells.map(cell => new NFA(countMachine, 'blue-count',
  cell, ...python.at(graph.kingNeighbours(cell))));

// --- All possible blue cells are given: an unshaded cell must not be off the
// --- python with its digit equal to that same count. Reads the cell's
// --- membership, its digit, then each king neighbour's membership; a cell on
// --- the python passes at once.
const notBlueMachine = NFA.encodeSpec({
  startState: { phase: 'membership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'membership':
        return value === ON ? { phase: 'onPython' } : { phase: 'digit' };
      case 'onPython':
        return { phase: 'onPython' };
      case 'digit':
        return { phase: 'count', target: value, count: 0 };
      case 'count': {
        const next = state.count + (value === ON ? 1 : 0);
        // Past the digit the count can no longer equal it: one sink state.
        return next > state.target
          ? { phase: 'exceeded' }
          : { phase: 'count', target: state.target, count: next };
      }
      case 'exceeded':
        return { phase: 'exceeded' };
    }
  },
  accept: state => state.phase === 'onPython' || state.phase === 'exceeded'
    || (state.phase === 'count' && state.count !== state.target),
}, geometry.numValues);
const shadedCells = new Set([...blueCells, ...redCells, midpointCell]);
const notBlue = gridCells
  .filter(cell => !shadedCells.has(cell))
  .map(cell => new NFA(notBlueMachine, 'not-blue',
    python.at(cell), cell, ...python.at(graph.kingNeighbours(cell))));

return [
  new Shape('9x9'),
  python.toVar('python'),
  armA.toVar('arm mod 7'),
  armB.toVar('arm mod 8'),
  ...givens,
  ...domains,
  ...membershipAgrees,
  ...fixedMembership,
  // The python is a single path: one orthogonally connected region of python
  // cells, degree 2 everywhere except the two red ends.
  new ConnectedValues('VP', ON),
  ...degrees,
  noTouches,
  ...distanceLabels,
  ...equalArms,
  ...palindrome,
  ...blueCounts,
  ...notBlue,
];
