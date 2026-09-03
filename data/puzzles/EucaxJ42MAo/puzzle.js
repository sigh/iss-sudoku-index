// Title: Caduceus
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=EucaxJ42MAo
// Source: https://app.crackingthecryptic.com/sudoku/jRhnH89mNm

// Normal sudoku rules apply. Two snakes (A and B) live in the grid; one is an
// Equal Sum Line, the other a German Whisper Line, and the solver must work out
// which is which. Each snake is an orthogonally connected set of cells whose two
// ends are the marked cells; each snake visits every 3x3 box; a snake never
// touches itself, not even diagonally; the snakes may touch each other but do
// not cross. The clue outside a row/column is the sum of that line's non-snake
// digits. The digit in a squared cell counts the non-snake cells of its box. On
// the Equal Sum Line the digits in each box the line visits share one total; on
// the German Whisper Line consecutive digits differ by at least 5.
//
// Every rule above is encoded. The A/B labels are never used as such: the two
// snakes are stored directly as "the whisper snake" and "the equal-sum snake",
// and the only thing the unknown assignment costs is a two-branch Or over the
// four marked cells (each marked pair belongs to one snake, but which is open).

const NONE = 1;       // VS codes: this cell is on neither snake,
const WHISPER = 2;    // on the German Whisper snake,
const EQSUM = 3;      // or on the Equal Sum snake.

// The alphabet is widened to 0-9 so the two masked digit overlays can carry 0
// for "this cell is not on my snake"; the grid cells are pinned back to 1-9.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const snake = graph.makeOverlay('VS');        // membership: NONE / WHISPER / EQSUM
const whisperDigit = graph.makeOverlay('VW'); // digit if on the whisper snake, else 0
const sumDigit = graph.makeOverlay('VE');     // digit if on the equal-sum snake, else 0

// Drawn clues, transcribed from the source artwork.
// The four lettered cells: pencil-mark 'A' in R1C3 and R4C4, 'B' in R6C4 and R8C9.
const markedA = ['R1C3', 'R4C4'];
const markedB = ['R6C4', 'R8C9'];
const markedCells = new Set([...markedA, ...markedB]);
// The nine white squares, one per box; the box's non-snake count is read from
// the digit that goes in the squared cell.
const squares = [
  'R1C1', 'R2C6', 'R2C8', 'R4C1', 'R6C5', 'R4C7', 'R9C3', 'R8C5', 'R8C7'];
// Outside clues: three above columns 1-3, three left of rows 6, 8 and 9.
const columnClues = { 1: 45, 2: 23, 3: 5 };
const rowClues = { 6: 4, 8: 7, 9: 45 };

// --- Playable digits and membership domains. ---
const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  snake.makeReplicate(new Given(snake.cells()[0], NONE, WHISPER, EQSUM)),
];

// --- The two masked digit overlays. ---
// Reads [membership, digit, whisperDigit, sumDigit] for one cell and forces each
// overlay to hold the digit when the cell is on that overlay's snake, else 0.
// So a cell's digit lands in exactly one of {non-snake, VW, VE}, which is what
// lets the sum clues below be plain Sums.
const maskMachine = NFA.encodeSpec({
  startState: { phase: 'membership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'membership':
        return value === NONE || value === WHISPER || value === EQSUM
          ? { phase: 'digit', membership: value } : undefined;
      case 'digit':
        return { phase: 'whisper', membership: state.membership, digit: value };
      case 'whisper':
        return value === (state.membership === WHISPER ? state.digit : 0)
          ? { phase: 'sum', membership: state.membership, digit: state.digit }
          : undefined;
      case 'sum':
        return value === (state.membership === EQSUM ? state.digit : 0)
          ? { phase: 'done' } : undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry);
const masks = gridCells.map(cell => new NFA(maskMachine, 'mask',
  snake.at(cell), cell, whisperDigit.at(cell), sumDigit.at(cell)));

// --- Which snake is which. ---
// The two 'A' cells are the ends of one snake and the two 'B' cells the ends of
// the other; the rules leave open which of them whispers, so both assignments
// are disjoined. Nothing else in the encoding depends on the A/B labels.
const roleAssignment = new Or([WHISPER, EQSUM].map(aRole => new And([
  ...snake.at(markedA).map(cell => new Given(cell, aRole)),
  ...snake.at(markedB).map(
    cell => new Given(cell, aRole === WHISPER ? EQSUM : WHISPER)),
])));

// --- Each snake is a path between its two marked ends. ---
// A marked cell has one same-snake orthogonal neighbour, any other snake cell
// has two. With ConnectedValues below (one connected region per snake), exactly
// two degree-1 cells and degree 2 elsewhere is a single simple path.
// Reads the cell's own membership, then each orthogonal neighbour's.
const memo = (fn) => { const m = new Map(); return k => (m.has(k) ? m : m.set(k, fn(k))).get(k); };
const degreeMachine = memo(target => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, value) => {
    if (state.phase === 'start') {
      return value === NONE
        ? { phase: 'off' }
        : { phase: 'on', own: value, count: 0 };
    }
    if (state.phase === 'off') return { phase: 'off' };
    const count = state.count + (value === state.own ? 1 : 0);
    return count > target
      ? undefined : { phase: 'on', own: state.own, count: count };
  },
  accept: (state) => state.phase === 'off' || state.count === target,
}, geometry));
const degrees = gridCells.map(cell => new NFA(
  degreeMachine(markedCells.has(cell) ? 1 : 2), 'degree',
  ...snake.at([cell, ...graph.neighbours(cell)])));

// --- A snake never touches itself, not even diagonally. ---
// Reading the rule together with the path structure: two cells of one snake that
// are orthogonally adjacent must be consecutive (the degree rule already forces
// that), and two that are diagonally adjacent must be the two ends of a turn, so
// the turn cell -- one of the other two cells of their 2x2 -- is on the snake
// too. What is left to forbid is a 2x2 whose cells of one snake are exactly a
// diagonal pair. That also rules out the two snakes crossing: an X through a 2x2
// would put each snake on a bare diagonal.
// Reads the four membership cells of a 2x2 block, left to right, top to bottom.
const noTouchMachine = NFA.encodeSpec({
  // `block` collects the four memberships (anything but a snake code counts as
  // absent), and becomes null once the block has been checked.
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value === WHISPER || value === EQSUM ? value : 0];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const bareDiagonal = [WHISPER, EQSUM].some(v =>
      (topLeft === v && bottomRight === v && topRight !== v && bottomLeft !== v) ||
      (topRight === v && bottomLeft === v && topLeft !== v && bottomRight !== v));
    return bareDiagonal ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry);
// Cells on the bottom or right edge start no 2x2 block.
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noTouches = snake.makeReplicate(
  new NFA(noTouchMachine, 'no-touch',
    ...snake.at(graph.block(gridCells[0], 2, 2))),
  snake.at(blockOrigins));

// --- Each snake is connected, and visits every box. ---
const connectivity = [
  new ConnectedValues('VS', WHISPER),
  new ConnectedValues('VS', EQSUM),
];
const boxVisits = snake.boxes().map(
  box => new ContainAtLeast(`${WHISPER}_${EQSUM}`, ...box));

// --- Squared cells: the digit counts the box's non-snake cells. ---
// Reads the squared cell's digit as the target, then the box's nine membership
// cells, counting NONE.
const boxCountMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === NONE ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry);
const gridBoxes = graph.boxes();
const boxCounts = squares.map(square => new NFA(boxCountMachine, 'box-count',
  square, ...snake.boxes()[gridBoxes.findIndex(box => box.includes(square))]));

// --- Outside clues: the non-snake digits of a row/column sum to the clue. ---
// Each digit of a line lands in exactly one of the three buckets, so the
// non-snake total is 45 (a full row or column) minus the two snake overlays.
const outsideClues = [
  ...Object.entries(columnClues).map(([col, clue]) => new Sum(45 - clue,
    ...whisperDigit.column(Number(col)), ...sumDigit.column(Number(col)))),
  ...Object.entries(rowClues).map(([row, clue]) => new Sum(45 - clue,
    ...whisperDigit.row(Number(row)), ...sumDigit.row(Number(row)))),
];

// --- German whispers along the whisper snake. ---
// Two orthogonally adjacent cells that are both on the snake are consecutive
// along it (the degree rule leaves no other way for them to be adjacent), so the
// rule is a plain relation on the masked overlay: a 0 means "not on this snake".
const whisperKey = Pair.fnToKey(
  (a, b) => a === 0 || b === 0 || Math.abs(a - b) >= 5, geometry);
// Right and down steps only, so each orthogonal pair is covered once; the step
// falls off the grid at the last column/row, which those cells' targets drop.
const whispers = [[0, 1], [1, 0]].map(([dRow, dCol]) => whisperDigit.makeReplicate(
  new Pair(whisperKey, 'whisper',
    ...whisperDigit.at([gridCells[0], graph.step(gridCells[0], dRow, dCol)])),
  whisperDigit.at(gridCells.filter(cell => graph.step(cell, dRow, dCol)))));

// --- The equal sum snake: one total per box. ---
// The snake visits every box, so every box carries a segment of it and all nine
// box totals of the masked overlay are the line's per-box total N.
const equalSums = new EqualSum(...sumDigit.boxes());

return [
  shape,
  snake.toVar('snake'),
  whisperDigit.toVar('whisper digits'),
  sumDigit.toVar('equal sum digits'),
  ...domains,
  ...masks,
  roleAssignment,
  ...degrees,
  noTouches,
  ...connectivity,
  ...boxVisits,
  ...boxCounts,
  ...outsideClues,
  ...whispers,
  equalSums,
];
