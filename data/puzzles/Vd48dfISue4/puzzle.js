// Title: All Things Being Equal
// Author: actinide
// Video: https://www.youtube.com/watch?v=Vd48dfISue4
// Source: https://app.crackingthecryptic.com/sudoku/bTpPDqJbG9

// Rules encoded here, in full:
//   Normal sudoku rules apply. All cages and marked diagonals sum to the same
//   number which is to be found by the solver. They MAY include repeated
//   digits if allowed by the other rules. The inequality sign points to the
//   lower digit. Three of the nine digits are always grouped together in a set
//   of orthogonally connected cells without repeats. Those sets cannot touch
//   each other orthogonally. The green shapes are two of those sets.
//
// "All cages and marked diagonals sum to the same number" is one EqualSum over
// the 11 cages and the 2 diagonals, with no total given. "MAY include repeated
// digits" is why no cage carries an AllDifferent.
//
// The grouping rule: three digits (which three is for the solver) are ALWAYS
// grouped, so every cell holding one of them lies in such a set. A set holds
// the three digits without repeats, so it is 3 orthogonally connected cells;
// three digits fill 27 cells, so there are 9 sets; and sets never touch each
// other, so the sets are exactly the connected components of those 27 cells.
// Two overlays carry that:
//   VM  the cell's own digit when it is one of the three, else OFF_DIGIT.
//   VR  the cell's role in its set: OFF, MID (the cell adjacent to the other
//       two) or END.

const OFF_DIGIT = 10;                  // VM: this cell's digit is not one of the three
const OFF = 1, MID = 2, END = 3;       // VR roles

// The alphabet is widened to 10 so VM has a spare value for OFF_DIGIT; grid
// cells are pinned back to 1-9 below.
const shape = new Shape('9x9', 10);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const mark = graph.makeOverlay('VM');
const role = graph.makeOverlay('VR');

const digitDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));
const roleDomain = role.makeReplicate(
  new Given(role.cells()[0], OFF, MID, END));

// VM copies the cell's digit or declares the cell out of the group; VR is OFF
// exactly when VM is.
const markIsDigitOrOff = Pair.fnToKey(
  (digit, m) => m === OFF_DIGIT || m === digit, 10);
const roleMatchesMark = Pair.fnToKey(
  (m, r) => (m === OFF_DIGIT) === (r === OFF), 10);
const markLinks = gridCells.map(
  cell => new Pair(markIsDigitOrOff, 'mark', cell, mark.at(cell)));
const roleLinks = gridCells.map(
  cell => new Pair(roleMatchesMark, 'role', mark.at(cell), role.at(cell)));

// Which digits are grouped is uniform across the grid: every row gives up
// exactly 3 cells, and the whole overlay shows only 4 distinct values --
// OFF_DIGIT plus the three grouped digits. A row's 3 grouped cells are
// distinct digits drawn from a 3-digit pool, so they are that pool, which
// makes every occurrence of a grouped digit a member of a set.
const threePerRow = graph.rows().map(
  cells => new ContainExact(
    new Array(6).fill(OFF_DIGIT).join('_'), ...mark.at(cells)));
const distinctCount = new Var('D', 'distinct marks', 1);
const threeGroupedDigits = [
  new Given('VD', 4),
  new CountDistinct('VD', ...mark.cells()),
];

// Each cell against its orthogonal neighbours: a MID has exactly two END
// neighbours and no MID neighbour; an END has exactly one MID neighbour and no
// END neighbour; an OFF cell is unconstrained. That makes every component of
// the grouped cells one MID with its two ENDs -- a 3-cell orthogonally
// connected set -- and leaves no grouped cell adjacent to another set, which is
// the "cannot touch each other orthogonally" clause. The state after the first
// cell is that cell's role plus how many neighbours of the required kind have
// been seen; a wrong kind or an over-count rejects.
const roleMachine = NFA.encodeSpec({
  startState: null,
  transition: (state, value) => {
    if (state === null) {
      if (value === OFF) return { r: OFF };
      if (value === MID) return { r: MID, n: 0 };
      return { r: END, n: 0 };
    }
    if (state.r === OFF) return state;
    if (state.r === MID) {
      if (value === MID) return undefined;
      if (value === OFF) return state;
      return state.n === 2 ? undefined : { r: MID, n: state.n + 1 };
    }
    if (value === END) return undefined;
    if (value === OFF) return state;
    return state.n === 1 ? undefined : { r: END, n: state.n + 1 };
  },
  accept: (state) => state !== null && (
    state.r === OFF || (state.r === MID ? state.n === 2 : state.n === 1)),
}, 10);
const roleStars = gridCells.map(cell => new NFA(
  roleMachine, 'triomino', ...role.at([cell, ...graph.neighbours(cell)])));

// "without repeats": a set's MID shares a row or column with each of its ENDs,
// so only the two ENDs can repeat, and only when the set bends -- which puts
// all three cells in one 2x2 block with the ENDs on a diagonal of it. Read the
// block as [TL, TR, BL, BR]: a diagonal pair of equal grouped digits is legal
// only while both of the other two cells are OFF_DIGIT, since one grouped cell
// there would join them into a single set.
const blockMachine = NFA.encodeSpec({
  startState: { i: 0 },
  transition: (state, value) => {
    switch (state.i) {
      case 0: return { i: 1, a: value };
      case 1: return { i: 2, a: state.a, b: value };
      case 2: {
        const anyBC = state.b !== OFF_DIGIT || value !== OFF_DIGIT;
        if (state.b === value && value !== OFF_DIGIT) {
          if (state.a !== OFF_DIGIT) return undefined;
          return { i: 3, a: OFF_DIGIT, anyBC, dOff: true };
        }
        return { i: 3, a: state.a, anyBC, dOff: false };
      }
      default:
        if (state.dOff && value !== OFF_DIGIT) return undefined;
        if (state.a === value && value !== OFF_DIGIT && state.anyBC) return undefined;
        return { i: 4 };
    }
  },
  accept: (state) => state.i === 4,
}, 10);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noSetRepeat = mark.makeReplicate(
  new NFA(blockMachine, 'set-no-repeat',
    ...mark.at(graph.block(gridCells[0], 2, 2))),
  mark.at(blockOrigins));

// The two green shapes, each listed MID first: the shaded cell adjacent to the
// other two shaded cells is the set's middle.
const greenSets = [
  ['R3C8', 'R3C7', 'R4C8'],
  ['R7C4', 'R6C4', 'R7C5'],
];
const greenRoles = greenSets.flatMap(([mid, ...ends]) => [
  new Given(role.at(mid), MID),
  ...ends.map(cell => new Given(role.at(cell), END)),
]);

// The 11 drawn cages, none of which prints a total.
const cages = [
  ['R1C1', 'R1C2', 'R2C1'],
  ['R1C5', 'R1C6', 'R1C7', 'R2C6'],
  ['R2C8', 'R2C9', 'R3C9'],
  ['R3C5', 'R4C4', 'R4C5', 'R5C5', 'R5C6', 'R6C5'],
  ['R6C4', 'R7C4', 'R7C5', 'R7C6'],
  ['R6C6', 'R6C7', 'R7C7'],
  ['R4C8', 'R5C8', 'R6C8', 'R7C8'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9'],
  ['R6C2', 'R7C1', 'R7C2'],
  ['R4C1', 'R5C1', 'R5C2', 'R6C1'],
  ['R3C2', 'R3C3', 'R4C3', 'R5C3'],
];

// The two marked diagonals, walked from the cell each drawn arrow enters,
// down-right to the grid edge; each carries a "-" label in place of a total.
const diagonals = [
  graph.ray('R1C5', 1, 1),
  graph.ray('R6C1', 1, 1),
];

return [
  shape,
  mark.toVar('grouped digit'),
  role.toVar('set role'),
  distinctCount,
  digitDomain,
  roleDomain,
  ...markLinks,
  ...roleLinks,
  ...threePerRow,
  ...threeGroupedDigits,
  ...roleStars,
  noSetRepeat,
  ...greenRoles,
  new EqualSum(...cages, ...diagonals),
  // The "<" on the R4C4/R4C5 edge opens toward R4C5, so it points at R4C4.
  new GreaterThan('R4C5', 'R4C4'),
];
