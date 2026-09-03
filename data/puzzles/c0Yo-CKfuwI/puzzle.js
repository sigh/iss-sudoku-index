// Title: Pentominophibian
// Author: Lil Gunga Jr
// Video: https://www.youtube.com/watch?v=c0Yo-CKfuwI
// Source: https://app.crackingthecryptic.com/t4vu4ndtl3

// Normal sudoku rules apply.
//
// Draw three snakes in the grid by connecting the yellow, green and blue dots to
// their respective partner. Each snake is an orthogonally connected set of cells
// that doesn't branch, doesn't touch itself (even diagonally), and doesn't share
// cells with any other snake.
//
// Digits in a grey square are even, and digits in a grey circle are odd. Cells
// containing a square or circle may not lie on any snake. Digits in a square or
// circle indicate how many of the surrounding (up to 8) cells belong to a snake.
//
// Divide each snake into contiguous groups of 5 cells, i.e. pentominoes, such
// that every cell along each snake belongs to exactly one pentomino. No two
// pentominoes in the entire grid may be of identical shape (rotations identical,
// reflections distinct).
//
// One snake path is a Dutch whisper line (adjacent digits differ by at least 4),
// one is a palindrome, one is a renban line (consecutive digits, no repeats); the
// solver must determine which is which.
//
// Digits separated by a black dot are in a 1:2 ratio; digits separated by a white
// dot are consecutive. Not all possible dots are given.
//
// Encoded here: sudoku, the kropki dots, the grey-shape parity and off-snake
// clues, the grey-shape snake counts, the three-snake route structure, the Dutch
// whisper on a solver-chosen snake, and the renban on a different solver-chosen
// snake.
//
// Omitted:
//   * pentomino shape distinctness -- only its consequence "each snake's length
//     is a positive multiple of 5" is encoded (see the length machine below);
//   * the palindrome rule on the third snake.

const OFF = 1;                    // VS overlay values: 1 = not on a snake,
const YELLOW = 2;                 // 2/3/4 = the yellow / green / blue snake.
const GREEN = 3;
const BLUE = 4;
const LABELS = [YELLOW, GREEN, BLUE];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

// Snake membership: one Var cell per grid cell, holding OFF or a snake label.
const snake = graph.makeOverlay('VS');

// Drawn data, transcribed from the small coloured dots in the cell centres.
const endpoints = [
  [YELLOW, ['R7C9', 'R9C6']],
  [GREEN, ['R2C2', 'R9C9']],
  [BLUE, ['R3C3', 'R3C7']],
];
const endpointCells = endpoints.flatMap(([, cells]) => cells);

// Drawn data, transcribed from the large translucent grey markers.
const greyCircles = ['R6C5', 'R8C5', 'R9C3'];   // odd digits
const greySquares = ['R3C9', 'R4C5', 'R6C1'];   // even digits
const greyCells = [...greyCircles, ...greySquares];

// Which snake carries which line rule is part of the puzzle, so each role holds
// the label of its snake: VR1 the Dutch whisper, VR2 the renban. The palindrome
// would be the remaining label and is not encoded.
const WHISPER_ROLE = 'VR1';
const RENBAN_ROLE = 'VR2';

const roles = [
  new Var('R', 'roles', 2),
  new Given(WHISPER_ROLE, ...LABELS),
  new Given(RENBAN_ROLE, ...LABELS),
  new AllDifferent(WHISPER_ROLE, RENBAN_ROLE),
];

// --- Snake membership -------------------------------------------------------
const membership = [
  snake.makeReplicate(new Given(snake.cells()[0], OFF, ...LABELS)),
  ...endpoints.flatMap(([label, cells]) =>
    cells.map(cell => new Given(snake.at(cell), label))),
  ...snake.at(greyCells).map(cell => new Given(cell, OFF)),
];

// --- Route structure --------------------------------------------------------
// Each snake runs from one coloured dot to its partner, so its cells form a
// simple path whose two ends are the dots. Degree is counted over same-label
// orthogonal neighbours: exactly 1 at a dot, exactly 2 at every other snake
// cell. Together with one connected region per label that is exactly a path
// between the two dots (a connected graph of maximum degree 2 is a path or a
// cycle, and the degree-1 dots exclude the cycle). Non-consecutive orthogonal
// self-contact is excluded by the same degree bound, since it would give the
// touched cell a third same-label neighbour.
//
// Reads the cell's own label, then each orthogonal neighbour's label; an off
// cell absorbs the rest.
const degreeMachine = (degree) => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, value) => {
    if (state.phase === 'start') {
      if (value === OFF) return { phase: 'off' };
      if (value > BLUE) return undefined;         // VS holds OFF or a label only
      return { phase: 'on', label: value, count: 0 };
    }
    if (state.phase === 'off') return { phase: 'off' };
    const count = state.count + (value === state.label ? 1 : 0);
    if (count > degree) return undefined;
    return { phase: 'on', label: state.label, count };
  },
  accept: (state) => state.phase === 'off' || state.count === degree,
}, numValues);

const endDegreeMachine = degreeMachine(1);
const midDegreeMachine = degreeMachine(2);

const degrees = gridCells.map(cell => new NFA(
  endpointCells.includes(cell) ? endDegreeMachine : midDegreeMachine,
  'degree',
  ...snake.at([cell, ...graph.neighbours(cell)])));

// No diagonal self-touch. Over the four labels of a 2x2 block, read left to
// right and top to bottom: a diagonal pair sharing a label is legal only when it
// is the pair around a 90-degree turn, i.e. when one of the two cells they have
// in common also carries that label. Any other same-label diagonal pair is two
// snake cells that are not consecutive, which the rule forbids.
const noDiagonalTouchMachine = NFA.encodeSpec({
  // `block` accumulates the four labels, then becomes null once the block has
  // been checked (all further symbols are absorbed).
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    if (value > BLUE) return undefined;
    const next = [...block, value];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const illegal =
      (topLeft !== OFF && topLeft === bottomRight &&
       topRight !== topLeft && bottomLeft !== topLeft) ||
      (topRight !== OFF && topRight === bottomLeft &&
       topLeft !== topRight && bottomRight !== topRight);
    return illegal ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, numValues);

// One template on the top-left 2x2, shifted onto every cell that starts a 2x2
// block (i.e. every cell off the bottom row and right column).
const noDiagonalTouches = snake.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...snake.at(graph.block(gridCells[0], 2, 2))),
  snake.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// One connected region per snake label. Combined with the degree rule above this
// makes each label a single simple path; it also keeps the three snakes from
// splitting into detached pieces.
const connectivity = LABELS.map(label => new ConnectedValues('VS', label));

// --- Grey shapes ------------------------------------------------------------
const parities = [
  ...greyCircles.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...greySquares.map(cell => new Given(cell, 2, 4, 6, 8)),
];

// The shape's digit counts its up-to-8 king neighbours that are on any snake.
// Reads the digit, then each neighbour's label.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === OFF ? 0 : 1);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, numValues);

const snakeCounts = greyCells.map(cell => new NFA(countMachine, 'snake-count',
  cell, ...snake.at(graph.kingNeighbours(cell))));

// --- Pentomino division (length consequence only) ---------------------------
// Each snake splits exactly into pentominoes, so its cell count is a positive
// multiple of 5. Scans every VS cell carrying the label modulo 5; `seen` keeps
// the empty snake out. The shape-distinctness half of the rule is not encoded.
const lengthMachine = (label) => NFA.encodeSpec({
  startState: { residue: 0, seen: false },
  transition: ({ residue, seen }, value) => value === label
    ? { residue: (residue + 1) % 5, seen: true }
    : { residue, seen },
  accept: ({ residue, seen }) => seen && residue === 0,
}, numValues);

const lengths = LABELS.map(label =>
  new NFA(lengthMachine(label), 'length-mod-5', ...snake.cells()));

// --- Dutch whisper ----------------------------------------------------------
// Two orthogonally adjacent cells carry the same snake label exactly when they
// are consecutive along that snake: the degree rule above forbids same-label
// orthogonal contact between non-consecutive cells. So the whisper is one
// machine per orthogonally adjacent pair, reading the whisper role's label, both
// membership cells, then both digits; a pair not on the whisper snake absorbs
// the digits it has left and accepts.
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'role' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'role':
        if (value < YELLOW || value > BLUE) return undefined;
        return { phase: 'first', label: value };
      case 'first':
        return value === state.label
          ? { phase: 'second', label: state.label }
          : { phase: 'skip', left: 3 };           // VS, digit, digit remain
      case 'second':
        return value === state.label
          ? { phase: 'digitA' }
          : { phase: 'skip', left: 2 };           // digit, digit remain
      case 'digitA':
        return { phase: 'digitB', first: value };
      case 'digitB':
        return Math.abs(value - state.first) >= 4 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 }
          : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, numValues);

// Right and down steps only, so each orthogonally adjacent pair is covered once.
const adjacentPairs = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => [cell, other]));

const whispers = adjacentPairs.map(([a, b]) => new NFA(whisperMachine, 'whisper',
  WHISPER_ROLE, snake.at(a), snake.at(b), a, b));

// --- Renban -----------------------------------------------------------------
// The renban snake's digits do not repeat, so it holds at most 9 cells; its
// length is a multiple of 5, so it is exactly 5 cells, and those five digits are
// five consecutive digits. One machine over the whole grid: it reads the renban
// role's label, then each cell's membership followed by that cell's digit,
// collecting the digits of the cells carrying the role's label. Only the count
// and the smallest and largest collected digit are carried, since
// `max - min === count - 1` is what "a set of consecutive digits without
// repeats" amounts to; `take` says whether the digit about to be read belongs
// to the renban snake.
const RENBAN_LENGTH = 5;
const renbanMachine = NFA.encodeSpec({
  startState: { label: null },
  transition: (state, value) => {
    if (state.label === null) {
      if (value < YELLOW || value > BLUE) return undefined;
      return { label: value, count: 0, min: 0, max: 0, take: null };
    }
    if (state.take === null) {
      if (value > BLUE) return undefined;
      return {
        label: state.label, count: state.count, min: state.min, max: state.max,
        take: value === state.label,
      };
    }
    if (!state.take) {
      return {
        label: state.label, count: state.count, min: state.min, max: state.max,
        take: null,
      };
    }
    const count = state.count + 1;
    const min = state.count === 0 ? value : Math.min(state.min, value);
    const max = state.count === 0 ? value : Math.max(state.max, value);
    if (count > RENBAN_LENGTH || max - min > RENBAN_LENGTH - 1) return undefined;
    return { label: state.label, count, min, max, take: null };
  },
  accept: ({ label, count, min, max }) =>
    label !== null && count === RENBAN_LENGTH && max - min === RENBAN_LENGTH - 1,
}, numValues);

const renban = new NFA(renbanMachine, 'renban', RENBAN_ROLE,
  ...gridCells.flatMap(cell => [snake.at(cell), cell]));

// --- Kropki dots ------------------------------------------------------------
// Transcribed from the three edge marks: filled = black, outlined = white.
const kropki = [
  new BlackDot('R3C2', 'R4C2'),
  new BlackDot('R3C8', 'R3C9'),
  new WhiteDot('R8C7', 'R8C8'),
];

return [
  new Shape('9x9'),
  snake.toVar('snake'),
  ...roles,
  ...membership,
  ...connectivity,
  ...degrees,
  noDiagonalTouches,
  ...parities,
  ...snakeCounts,
  ...lengths,
  ...whispers,
  renban,
  ...kropki,
];
