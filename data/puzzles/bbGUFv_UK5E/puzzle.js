// Title: Jabberwocky
// Author: DadJokes
// Video: https://www.youtube.com/watch?v=bbGUFv_UK5E
// Source: https://tinyurl.com/5n6pa7wf

// Rules encoded here, in the three stages the puzzle names.
//
// Throughout: arrows (circle = sum of the rest of its arrow), German whispers
// (green, adjacent difference at least 5), renban (magenta, a set of
// consecutive digits), entropic (gold, every three consecutive cells hold one
// of 1-3, one of 4-6, one of 7-9) and kropki dots (white = consecutive, black
// = ratio 2). Not all kropki dots are given, so no negative dot rule applies.
// These clues hold both of the grid's two digit fillings.
//
// Stage 1 (the VG overlay): digits 1-9 once per row and once per column, no
// box rule; instead each 3x3 box is an "abstract 3x3" -- it uses only three
// distinct digits, which the solver determines.
//
// Stage 2 (the VS overlay): the whole grid is partitioned into three snakes.
// Each snake is a non-branching path whose two ends are the two cells shaded
// in that snake's colour, and no snake touches itself orthogonally or
// diagonally. Exactly one snake holds all three white dots; the black dot lies
// on a border between two snakes.
//
// Stage 3 (the main grid): the stage-1 digit of every cell that is not on the
// longest snake, not on an arrow and not on a renban carries over as a given;
// the main grid is then a normal sudoku carrying the same variant clues.
//
// Omission: none. Every clause above is encoded.

// --- Drawn clue geometry, transcribed from the grid art. ---

// Arrows: circle cell first, then the arm cells in drawn order.
const ARROWS = [
  ['R1C3', 'R2C2', 'R3C1'],
  ['R2C6', 'R1C6', 'R1C7'],
  ['R1C9', 'R2C8', 'R3C7'],
  ['R5C8', 'R6C8', 'R6C7'],
  ['R8C6', 'R8C5', 'R8C4'],
  ['R6C1', 'R7C1', 'R8C2'],
  ['R4C3', 'R5C3', 'R6C3', 'R6C2'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C6'],
];

// Green lines.
const WHISPERS = [
  ['R3C2', 'R2C2', 'R2C3'],
  ['R2C5', 'R2C6'],
  ['R1C9', 'R1C8', 'R2C7'],
  ['R6C7', 'R7C8', 'R8C8'],
];

// Magenta lines.
const RENBANS = [
  ['R3C6', 'R2C5'],
  ['R5C6', 'R5C7'],
  ['R7C2', 'R8C3'],
];

// Gold lines.
const ENTROPIC_LINES = [
  ['R5C1', 'R6C1', 'R6C2'],
  ['R6C4', 'R6C5', 'R6C6'],
];

// Kropki dots.
const WHITE_DOTS = [
  ['R9C2', 'R9C3'],
  ['R7C6', 'R7C5'],
  ['R8C9', 'R7C9'],
];
const BLACK_DOT = ['R6C3', 'R7C3'];

// Shaded cells: the two ends of each snake, keyed by snake label.
// Snake 1 = pink (#FFD0D0), 2 = lavender (#D0D0FF), 3 = yellow (#FFFFB0).
const SNAKE_ENDS = new Map([
  [1, ['R1C8', 'R8C2']],
  [2, ['R1C9', 'R3C3']],
  [3, ['R4C4', 'R6C1']],
]);

const SNAKE_LABELS = [1, 2, 3];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Stage-1 digits, one Var per grid cell.
const stage1 = graph.makeOverlay('VG');
// Snake label, one Var per grid cell.
const snake = graph.makeOverlay('VS');
// One 0/1-style membership layer per snake, so a snake's length is a Sum.
// Value 2 means "this cell is on snake s", value 1 means it is not.
const OFF = 1, ON = 2;
const memberships = new Map(
  SNAKE_LABELS.map((s, i) => [s, graph.makeOverlay(['VA', 'VB', 'VC'][i])]));

// A snake can be up to 77 cells long, which no single 1-9 Var cell can hold, so
// each length is split into two base-9 digits: length(s) = 9*high + low - 10,
// covering 0..80. One row per snake, high digit first.
const lengthVars = new Var('P', 'snake lengths (base 9, high digit first)', '3x2');
const lengthHigh = s => lengthVars.cell(s, 1);
const lengthLow = s => lengthVars.cell(s, 2);

// --- Clue helpers: the same clue list is applied to both digit fillings. ---

const clueSet = (cellsOf) => [
  ...ARROWS.map(([circle, ...arm]) => new Arrow(cellsOf(circle), ...arm.map(cellsOf))),
  ...WHISPERS.map(line => new Whisper(5, ...line.map(cellsOf))),
  ...RENBANS.map(line => new Renban(...line.map(cellsOf))),
  ...ENTROPIC_LINES.map(line => new Entropic(...line.map(cellsOf))),
  ...WHITE_DOTS.map(pair => new WhiteDot(...pair.map(cellsOf))),
  new BlackDot(...BLACK_DOT.map(cellsOf)),
];

// --- Stage 1: rows, columns, and the abstract 3x3 boxes. ---

// A box's three rows must hold the same three values. Each of those rows is
// already all-different (grid rows are), so the box uses exactly three digits
// and its rows and columns are permutations of them: an abstract 3x3.
const abstractBoxes = graph.boxes().map(
  box => new SameValues(3, ...stage1.at(box)));

const stage1Latin = [
  ...graph.rows().map(row => new AllDifferent(...stage1.at(row))),
  ...graph.columns().map(col => new AllDifferent(...stage1.at(col))),
];

// --- Stage 2: three snakes covering the grid. ---

// Every cell carries one of the three snake labels.
const snakeDomain = snake.makeReplicate(
  new Given(snake.cells()[0], ...SNAKE_LABELS));

const snakeEndCells = [...SNAKE_ENDS.values()].flat();
const snakeEndGivens = [...SNAKE_ENDS].flatMap(
  ([label, ends]) => ends.map(cell => new Given(snake.at(cell), label)));

// Degree: reads a cell's own label, then each orthogonal neighbour's label,
// and counts the neighbours sharing the label. A snake end has exactly one
// such neighbour; every other cell has exactly two. Two ends of degree 1 plus
// degree 2 elsewhere, over a connected label class, is one simple path.
const degreeMachine = required => NFA.encodeSpec({
  startState: { own: null, count: 0 },
  transition: ({ own, count }, label) => {
    if (own === null) return { own: label, count: 0 };
    const next = count + (label === own ? 1 : 0);
    return next > required ? undefined : { own, count: next };
  },
  accept: ({ own, count }) => own !== null && count === required,
}, geometry.numValues);
const degreeMachines = new Map([[1, degreeMachine(1)], [2, degreeMachine(2)]]);
const snakeDegrees = gridCells.map(cell => new NFA(
  degreeMachines.get(snakeEndCells.includes(cell) ? 1 : 2),
  'snake-degree',
  ...snake.at([cell, ...graph.neighbours(cell)])));

// No self-touch: reads the four labels of a 2x2 block, top row then bottom
// row. A snake occupying one diagonal of the block and neither of the other
// two cells touches itself diagonally there. The two cells either side of a
// 90-degree turn are always diagonally adjacent, so the block is allowed when
// a third cell of the same snake joins them -- that pair is the turn itself.
const noSelfTouchMachine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen }, label) => {
    if (seen === null) return { seen: null };   // block already checked
    const next = [...seen, label];
    if (next.length < 4) return { seen: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const touches =
      (topLeft === bottomRight && topRight !== topLeft && bottomLeft !== topLeft) ||
      (topRight === bottomLeft && topLeft !== topRight && bottomRight !== topRight);
    return touches ? undefined : { seen: null };
  },
  accept: ({ seen }) => seen === null,
}, geometry.numValues);
const noSelfTouchHosts = gridCells.filter(cell => graph.block(cell, 2, 2));
const snakeNoSelfTouch = snake.makeReplicate(
  new NFA(noSelfTouchMachine, 'snake-no-self-touch',
    ...snake.at(graph.block(gridCells[0], 2, 2))),
  snake.at(noSelfTouchHosts));

// Each snake is one orthogonally-connected region; with the degree rule above
// that makes it a single non-branching path between its two shaded ends.
const snakeConnected = SNAKE_LABELS.map(
  label => new ConnectedValues('VS', label));

// All six cells of the three white dots lie on one snake, so exactly one snake
// holds every white dot. Six one-cell sets holding the same value.
const whiteDotsOneSnake = new SameValues(
  6, ...snake.at(WHITE_DOTS.flat()));

// The black dot is a border between two snakes.
const blackDotBorder = new AllDifferent(...snake.at(BLACK_DOT));

// --- Snake lengths. ---

// Each membership layer mirrors the snake labels cell by cell.
const membershipKeys = new Map(SNAKE_LABELS.map(s => [
  s, Pair.fnToKey((label, member) => (member === ON) === (label === s), geometry)]));
const membershipLinks = SNAKE_LABELS.flatMap(s => gridCells.map(
  cell => new Pair(membershipKeys.get(s), `on-snake-${s}`,
    snake.at(cell), memberships.get(s).at(cell))));
const membershipDomains = SNAKE_LABELS.map(
  s => memberships.get(s).makeReplicate(
    new Given(memberships.get(s).cells()[0], OFF, ON)));

// A membership layer sums to 81 + length(s), and length(s) = 9*high + low - 10,
// so the layer's cells minus 9*high minus low come to 81 - 10.
const snakeLengths = SNAKE_LABELS.map(s => new Sum(
  71, ...memberships.get(s).cells(),
  [lengthHigh(s), -9], [lengthLow(s), -1]));

// Reads two base-9 length pairs and accepts when the first is the larger.
const longerMachine = NFA.encodeSpec({
  startState: { step: 0 },
  transition: (state, value) => {
    switch (state.step) {
      case 0: return { step: 1, high: value };
      case 1: return { step: 2, first: 9 * state.high + value };
      case 2: return { step: 3, first: state.first, high: value };
      default:
        return state.first > 9 * state.high + value ? { step: 4 } : undefined;
    }
  },
  accept: ({ step }) => step === 4,
}, geometry.numValues);

// --- Stage 3: which stage-1 digits carry over as givens. ---

// Cells erased whatever the snakes turn out to be. A digit sitting in an
// arrow's circle is a digit on that arrow, so circles are erased with arms.
const alwaysErased = new Set([...ARROWS.flat(), ...RENBANS.flat()]);
const carriedCells = gridCells.filter(cell => !alwaysErased.has(cell));

// Reads (snake label, stage-1 digit, stage-3 digit) for one cell and accepts
// when the cell is on snake `label` -- its digit is erased, so unconstrained --
// or the two digits agree.
const carryMachine = label => NFA.encodeSpec({
  startState: { step: 0 },
  transition: (state, value) => {
    switch (state.step) {
      case 0: return value === label ? { step: 'erased', left: 2 } : { step: 1 };
      case 'erased':
        return state.left > 1
          ? { step: 'erased', left: state.left - 1 } : { step: 'kept' };
      case 1: return { step: 2, digit: value };
      case 2: return value === state.digit ? { step: 'kept' } : undefined;
    }
  },
  accept: ({ step }) => step === 'kept',
}, geometry.numValues);

// One branch per snake: that snake is strictly longer than both others, and
// every cell not on it and not already erased keeps its stage-1 digit.
const longestSnakeErasure = new Or(SNAKE_LABELS.map(longest => {
  const machine = carryMachine(longest);
  return new And([
    ...SNAKE_LABELS.filter(s => s !== longest).map(shorter => new NFA(
      longerMachine, `snake-${longest}-longer-than-${shorter}`,
      lengthHigh(longest), lengthLow(longest),
      lengthHigh(shorter), lengthLow(shorter))),
    ...carriedCells.map(cell => new NFA(
      machine, 'carried-given', snake.at(cell), stage1.at(cell), cell)),
  ]);
}));

return [
  new Shape('9x9'),
  stage1.toVar('stage-1 digits'),
  snake.toVar('snake labels'),
  ...SNAKE_LABELS.map(s => memberships.get(s).toVar(`on snake ${s}`)),
  lengthVars,

  ...clueSet(cell => cell),
  ...clueSet(cell => stage1.at(cell)),

  ...stage1Latin,
  ...abstractBoxes,

  snakeDomain,
  ...snakeEndGivens,
  ...snakeDegrees,
  snakeNoSelfTouch,
  ...snakeConnected,
  whiteDotsOneSnake,
  blackDotBorder,

  ...membershipDomains,
  ...membershipLinks,
  ...snakeLengths,

  longestSnakeErasure,
];
