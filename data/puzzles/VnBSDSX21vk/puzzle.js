// Title: Six
// Author: TidepoolSalts
// Video: https://www.youtube.com/watch?v=VnBSDSX21vk
// Source: https://app.crackingthecryptic.com/sudoku/PFr2r23jL3

// Rules encoded here:
//  * Normal sudoku.
//  * The 78 white cells -- every cell except the three grey ones, R4C5, R5C5
//    and R6C5 -- are divided into 13 hexominoes: orthogonally connected groups
//    of six cells. Digits do not repeat within a hexomino.
//  * A small white dot: its two cells are in different hexominoes, and their
//    digits differ by 1.
//  * A small black dot: its two cells are in the same hexomino, and one digit
//    is double the other.
//  * A large white dot: exactly three of the four cells around it are in one
//    hexomino. Where such a dot carries numbers, those numbers appear among
//    its four cells.
//  * A large black dot: all four cells around it are in one hexomino.
//
// Omitted: "each hexomino must be different", i.e. the 13 hexominoes are 13
// distinct shapes (up to rotation and reflection). That is a distinctness
// test between whole regions the solver is still discovering; nothing here
// compares one region's shape against another's, so a solution may repeat a
// hexomino.

const GREY_CELLS = ['R4C5', 'R5C5', 'R6C5'];
const NUM_HEXOMINOES = 13;
const HEXOMINO_SIZE = 6;
// Hexomino labels are 1..13; the grey cells belong to no hexomino and carry
// the one extra label, which no rule below mentions.
const NO_HEXOMINO = NUM_HEXOMINOES + 1;

const shape = new Shape('9x9', NO_HEXOMINO);
const graph = cellGraph(shape);
const numValues = graph.gridGeometry().numValues;
const hex = graph.makeOverlay('VH');

const gridCells = graph.cells();
const whiteCells = gridCells.filter(cell => !GREY_CELLS.includes(cell));
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const LABELS = Array.from({ length: NUM_HEXOMINOES }, (_, i) => i + 1);

// --- Domains ------------------------------------------------------------
// The alphabet is widened to 14 to hold the hexomino labels, so the grid
// itself has to be put back to 1-9.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));
const hexDomain = hex.makeReplicate(
  new Given(hex.at(whiteCells[0]), ...LABELS), hex.at(whiteCells));
const greyLabels = GREY_CELLS.map(
  cell => new Given(hex.at(cell), NO_HEXOMINO));

// --- The hexomino partition ---------------------------------------------
// Each label is one orthogonally connected group of exactly six cells, and
// 13 x 6 is the 78 white cells, so the labels partition them into hexominoes.
const partition = LABELS.map(
  label => new ConnectedValues('VH', label, HEXOMINO_SIZE));

// Labels are interchangeable, which would multiply every answer by 13!.
// Scanning the whole layer in reading order, a label may be one more than the
// highest seen so far but no more, so each partition has exactly one labelling.
const labelOrderNFA = NFA.encodeSpec({
  startState: { used: 0 },
  transition: ({ used }, value) => {
    if (value === NO_HEXOMINO) return { used };
    if (value > used + 1) return undefined;
    return { used: value > used ? value : used };
  },
  accept: ({ used }) => used === NUM_HEXOMINOES,
}, numValues);
const labelOrder = new NFA(
  labelOrderNFA, 'label-order', ...hex.at(gridCells));

// --- Digits do not repeat within a hexomino -----------------------------
// Read as [label(a), label(b), digit(a), digit(b)]: cells sharing a label
// must differ. Cells more than five steps apart cannot share a hexomino.
const sameHexDistinctNFA = NFA.encodeSpec({
  startState: { phase: 'labelA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'labelA':
        return { phase: 'labelB', label: value };
      case 'labelB':
        // Different hexominoes: the digits are unrelated, so accept the rest.
        return value === state.label ? { phase: 'digitA' } : { phase: 'other' };
      case 'other':
        return { phase: 'other' };
      case 'digitA':
        return { phase: 'digitB', digit: value };
      default:
        return value === state.digit ? undefined : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'other' || phase === 'done',
}, numValues);

// Cells at white-cell distance six or more can never be in one hexomino, and a
// shared row, column or box already forbids a repeat, so neither needs a
// machine.
const whiteSet = new Set(whiteCells);
const boxOf = new Map(graph.boxes().flatMap(
  (box, i) => box.map(cell => [cell, i])));
const withinHexomino = (from) => {
  const dist = new Map([[from, 0]]);
  const queue = [from];
  for (const cell of queue) {
    if (dist.get(cell) === HEXOMINO_SIZE - 1) continue;
    for (const next of graph.neighbours(cell)) {
      if (!whiteSet.has(next) || dist.has(next)) continue;
      dist.set(next, dist.get(cell) + 1);
      queue.push(next);
    }
  }
  return [...dist.keys()];
};
const noRepeatPairs = whiteCells.flatMap((a, i) => withinHexomino(a)
  .filter(b => whiteCells.indexOf(b) > i)
  .filter(b => parseCellId(a).row !== parseCellId(b).row)
  .filter(b => parseCellId(a).col !== parseCellId(b).col)
  .filter(b => boxOf.get(a) !== boxOf.get(b))
  .map(b => [a, b]));
const noRepeats = noRepeatPairs.map(([a, b]) => new NFA(
  sameHexDistinctNFA, 'no-repeat', hex.at(a), hex.at(b), a, b));

// --- Dots ---------------------------------------------------------------
// Every dot drawn on the board, by the edge or corner it sits on. Large dots
// are named by the top-left cell of the 2x2 they sit in the middle of; a large
// white dot's `values` are the numbers printed inside it.
const SMALL_WHITE_DOTS = [
  ['R2C1', 'R2C2'], ['R1C7', 'R2C7'], ['R4C1', 'R5C1'], ['R5C4', 'R6C4'],
  ['R6C3', 'R6C4'], ['R7C7', 'R8C7'], ['R3C4', 'R4C4'],
];
const SMALL_BLACK_DOTS = [
  ['R7C7', 'R7C8'], ['R1C8', 'R1C9'], ['R1C6', 'R1C7'], ['R1C4', 'R1C5'],
];
const LARGE_BLACK_DOTS = [
  'R1C2', 'R2C2', 'R3C6', 'R3C8', 'R8C8', 'R8C5',
];
const LARGE_WHITE_DOTS = [
  { corner: 'R4C3', values: [8, 8] },
  { corner: 'R5C3', values: [7, 7] },
  { corner: 'R5C2', values: [] },
  { corner: 'R5C1', values: [] },
  { corner: 'R6C2', values: [] },
  { corner: 'R7C1', values: [] },
  { corner: 'R8C2', values: [] },
  { corner: 'R8C3', values: [] },
  { corner: 'R7C3', values: [] },
  { corner: 'R6C6', values: [] },
  { corner: 'R6C7', values: [] },
  { corner: 'R6C8', values: [] },
  { corner: 'R5C8', values: [] },
  { corner: 'R5C7', values: [1, 4, 6] },
  { corner: 'R2C8', values: [7] },
  { corner: 'R2C4', values: [] },
];

const smallWhite = SMALL_WHITE_DOTS.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  new AllDifferent(...hex.at([a, b])),
]);
const smallBlack = SMALL_BLACK_DOTS.flatMap(([a, b]) => [
  new BlackDot(a, b),
  new SameValues(2, ...hex.at([a, b])),
]);
const largeBlack = LARGE_BLACK_DOTS.map(
  corner => new SameValues(4, ...hex.at(graph.block(corner, 2, 2))));

// Read as the four labels around a large white dot: exactly one value occurs
// three times, so the remaining cell is in a different hexomino. After two
// cells the state holds the labels seen; after three it holds what the last
// cell must be (`same`) or must not be (`differ`).
const threeOfFourNFA = NFA.encodeSpec({
  startState: { phase: 'first' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'first':
        return { phase: 'second', a: value };
      case 'second':
        return value === state.a
          ? { phase: 'third', a: state.a, b: null }
          : { phase: 'third', a: state.a, b: value };
      case 'third':
        // A third distinct label leaves no room for three of a kind.
        if (state.b === null) {
          return value === state.a
            ? { phase: 'last', differ: state.a }
            : { phase: 'last', same: state.a };
        }
        if (value === state.a) return { phase: 'last', same: state.a };
        if (value === state.b) return { phase: 'last', same: state.b };
        return undefined;
      default:
        if (state.same !== undefined) {
          return value === state.same ? { phase: 'done' } : undefined;
        }
        return value === state.differ ? undefined : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, numValues);
const largeWhite = LARGE_WHITE_DOTS.flatMap(({ corner, values }) => {
  const cells = graph.block(corner, 2, 2);
  return [
    new NFA(threeOfFourNFA, 'three-of-four', ...hex.at(cells)),
    ...(values.length ? [new Quad(corner, ...values)] : []),
  ];
});

return [
  shape,
  hex.toVar('hexomino'),
  digitDomain,
  hexDomain,
  ...greyLabels,
  new Given('R2C6', 4),
  new Given('R3C7', 9),
  new Given('R5C5', 3),
  new Given('R6C8', 3),
  new Given('R8C3', 1),
  new Given('R9C4', 4),
  ...partition,
  labelOrder,
  ...noRepeats,
  ...smallWhite,
  ...smallBlack,
  ...largeBlack,
  ...largeWhite,
];
