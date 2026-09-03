// Title: Diagonal Snakes
// Author: MonkeyApprentice
// Video: https://www.youtube.com/watch?v=gGCefF9qw6E
// Source: https://app.crackingthecryptic.com/QFgMQf2NpF

// Rules encoded here:
// - Normal sudoku.
// - Two non-overlapping, non-crossing snakes connect the coloured cells: one
//   joins the two green cells, the other the two purple cells. A snake is a
//   one-cell-wide orthogonally connected path whose ends are its two coloured
//   cells, and it may not touch itself, even diagonally. The two snakes may
//   touch each other.
// - One snake holds all high digits (6-9) or all low digits (1-4); the other
//   holds all odd digits or all even digits. Which snake takes which property
//   is not given.
// - No snake enters a grey-circle cell; a grey-circle digit is odd.
// - X: sum 10. V: sum 5. White dot: consecutive. Black dot: 2:1 ratio. The
//   rules do not declare the marking exhaustive, so no negative constraint is
//   applied to unmarked pairs.
// - Digits do not repeat along the negative diagonal.
//
// "Non-crossing" is not encoded separately: each snake is a path through cell
// centres stepping only orthogonally, so two cell-disjoint snakes cannot cross.

const OFF = 1;      // snake-membership codes, held in the VS overlay
const GREEN = 2;
const PURPLE = 3;

const HIGH = 1;     // digit-class codes, held in the VC class cells
const LOW = 2;
const ODD = 3;
const EVEN = 4;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Snake membership: one Var cell per grid cell (VS1..VS81, in grid order).
const snake = graph.makeOverlay('VS');

// Drawn clue data.
const greenCells = ['R1C1', 'R6C5'];        // green shaded cells
const purpleCells = ['R2C2', 'R9C9'];       // purple shaded cells
const greyCircles = ['R1C2', 'R3C8', 'R9C8'];
const givens = [['R1C7', 7], ['R2C4', 5], ['R3C5', 7], ['R4C6', 2], ['R9C1', 7]];
const whiteDots = [                          // consecutive
  ['R3C1', 'R4C1'], ['R2C2', 'R2C3'], ['R3C4', 'R4C4'],
  ['R6C6', 'R6C7'], ['R7C9', 'R8C9']];
const blackDots = [['R4C3', 'R5C3']];        // 2:1 ratio
const xMarks = [['R7C7', 'R8C7'], ['R9C8', 'R9C9']];
const vMarks = [['R4C2', 'R4C3'], ['R6C4', 'R7C4']];

const endpoints = [...greenCells, ...purpleCells];

// --- Snake membership -------------------------------------------------------
const membership = [
  snake.makeReplicate(new Given(snake.cells()[0], OFF, GREEN, PURPLE)),
  ...snake.at(greenCells).map(cell => new Given(cell, GREEN)),
  ...snake.at(purpleCells).map(cell => new Given(cell, PURPLE)),
  ...snake.at(greyCircles).map(cell => new Given(cell, OFF)),
];

// --- Degree: a snake cell has exactly `required` neighbours of its own snake.
// Reads the cell's own membership, then each orthogonal neighbour's. Cells off
// both snakes are unconstrained. The two coloured cells of a snake are its ends
// (required 1); every other snake cell is interior (required 2). Connected +
// two degree-1 cells + degree-2 elsewhere is exactly one simple path per snake,
// and degree <= 2 is also what forbids orthogonal self-touching.
const degreeMachine = (required) => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, membership) => {
    if (state.phase === 'start') {
      return membership === OFF
        ? { phase: 'off' }
        : { phase: 'on', label: membership, count: 0 };
    }
    if (state.phase === 'off') return { phase: 'off' };
    const count = state.count + (membership === state.label ? 1 : 0);
    return count > required
      ? undefined
      : { phase: 'on', label: state.label, count };
  },
  accept: (state) => state.phase === 'off' || state.count === required,
}, geometry.numValues);
const endMachine = degreeMachine(1);
const interiorMachine = degreeMachine(2);
const degrees = gridCells.map(cell => new NFA(
  endpoints.includes(cell) ? endMachine : interiorMachine, 'degree',
  ...snake.at([cell, ...graph.neighbours(cell)])));

// --- No diagonal self-touch -------------------------------------------------
// Over each 2x2 block, read the four membership cells left-to-right then
// top-to-bottom. Two cells of one snake on a diagonal of the block are legal
// only as the arms of a turn, whose corner is the third cell of that same
// snake; so a diagonal pair with neither of the other two cells on that snake
// is forbidden. Cells of *different* snakes on a diagonal are always fine.
const noSelfTouchMachine = NFA.encodeSpec({
  // `block` accumulates the 2x2's membership codes and becomes null once the
  // block has passed the check (all further symbols are absorbed).
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    // `a` and `d` are the diagonal; `b` and `c` the other two cells.
    const bareDiagonal = (a, b, c, d) => a !== OFF && a === d && b !== a && c !== a;
    return bareDiagonal(topLeft, topRight, bottomLeft, bottomRight)
      || bareDiagonal(topRight, topLeft, bottomRight, bottomLeft)
      ? undefined
      : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// One template on the top-left 2x2, stamped onto every in-grid 2x2 block.
const blockCorners = gridCells.filter(cell => graph.block(cell, 2, 2));
const noSelfTouches = snake.makeReplicate(
  new NFA(noSelfTouchMachine, 'no-touch',
    ...snake.at(graph.block(blockCorners[0], 2, 2))),
  snake.at(blockCorners));

// --- Snake digit classes ----------------------------------------------------
// VC1 holds the green snake's digit class, VC2 the purple snake's; each is one
// of HIGH/LOW/ODD/EVEN.
const classVar = new Var('C', 'snake digit class', 2);
const [greenClass, purpleClass] = classVar.cells();
const inClass = (digitClass, digit) => {
  switch (digitClass) {
    case HIGH: return digit >= 6;
    case LOW: return digit <= 4;
    case ODD: return digit % 2 === 1;
    case EVEN: return digit % 2 === 0;
  }
};

// One snake takes a high/low class and the other a parity class: exactly one of
// the two class cells is below ODD.
const classPairing = new Pair(
  Pair.fnToKey((a, b) => (a < ODD) !== (b < ODD), geometry),
  'one high-low snake, one parity snake', greenClass, purpleClass);

// Per grid cell: read the two class cells, then this cell's membership, then
// its digit. A cell off both snakes is unconstrained; otherwise its digit must
// satisfy its own snake's class.
const classMachine = NFA.encodeSpec({
  startState: { phase: 'green' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'green':
        return value > EVEN ? undefined : { phase: 'purple', green: value };
      case 'purple':
        return value > EVEN
          ? undefined
          : { phase: 'member', green: state.green, purple: value };
      case 'member':
        if (value === OFF) return { phase: 'done' };
        return {
          phase: 'digit',
          digitClass: value === GREEN ? state.green : state.purple,
        };
      case 'digit':
        return inClass(state.digitClass, value) ? { phase: 'done' } : undefined;
      case 'done':
        return { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const classChecks = gridCells.map(cell => new NFA(classMachine, 'snake-class',
  greenClass, purpleClass, snake.at(cell), cell));

return [
  new Shape('9x9'),
  snake.toVar('snake'),
  classVar,
  ...givens.map(([cell, value]) => new Given(cell, value)),

  ...membership,
  // Each snake's cells form one orthogonally-connected region.
  new ConnectedValues('VS', GREEN),
  new ConnectedValues('VS', PURPLE),
  ...degrees,
  noSelfTouches,

  new Given(greenClass, HIGH, LOW, ODD, EVEN),
  new Given(purpleClass, HIGH, LOW, ODD, EVEN),
  classPairing,
  ...classChecks,

  // A digit in a grey circle is odd.
  ...greyCircles.map(cell => new Given(cell, 1, 3, 5, 7, 9)),

  ...whiteDots.map(pair => new WhiteDot(...pair)),
  ...blackDots.map(pair => new BlackDot(...pair)),
  ...xMarks.map(pair => new X(...pair)),
  ...vMarks.map(pair => new V(...pair)),

  new Diagonal(-1),
];
