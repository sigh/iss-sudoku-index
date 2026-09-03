// Title: Then one foggy Christmas Eve
// Author: Panthera
// Video: https://www.youtube.com/watch?v=0H8aV33I3ZM
// Source: https://sudokupad.app/b3j6kd3mzp

// Rules encoded below:
//  * Place the digits from 1-6 twice in every row, column and region.
//  * Normal Japanese sums rules apply. Colours used in this puzzle are beige,
//    brown, dark brown, red and grey/black. The squares outside the grid
//    indicate the order of runs of contiguous cells found in that row or column
//    that must be shaded the colour of the clue. The number in the clue, if
//    given, indicates the sum of the cells in the run. There must be at least
//    one unshaded cell between runs of the same colour, though there is no need
//    between runs of differing colours. All runs are given.
//  * White snow dots separate consecutive digits. The rules do not say that all
//    such dots are given, so no negative dot constraint is added.
// The 12x12 board is the region-bordered area of the source canvas; the rows of
// squares above and to the left of it are the clues transcribed below.

// Rows and columns repeat digits, so the grid carries no implicit rules and
// every rule is stated here.
const shape = new Shape('12x12', '1-6', 'Raw');
const graph = cellGraph(shape);

// Each cell also carries a shading: unshaded, or one of the five clue colours.
// Six states fit the grid's own 1-6 value range, which Var cells share.
const shading = graph.makeOverlay('VS');
const UNSHADED = 1;
const BEIGE = 2, BROWN = 3, DARK_BROWN = 4, RED = 5, GREY = 6;

// Every row, column and region holds each of 1-6 exactly twice.
const TWICE_EACH = '1_1_2_2_3_3_4_4_5_5_6_6';

// Region layout, one letter per cell, from the thick borders drawn in the
// source.
const REGION_MAP = [
  'ABBBCCDDEEEF',
  'ABBBCCDDEEEF',
  'ABBBGCDHEEEF',
  'ABBBGCDHEEEF',
  'AGGGGCDHHHHF',
  'AGGGGCDHHHHF',
  'AAAGGCDHHFFF',
  'IIAAACDFFFJJ',
  'IIIICCDDJJJJ',
  'IIIIIIJJJJJJ',
  'KKKKKKLLLLLL',
  'KKKKKKLLLLLL',
];

const regionCells = new Map();
REGION_MAP.forEach((line, rowIndex) => {
  [...line].forEach((letter, colIndex) => {
    const cell = makeCellId(rowIndex + 1, colIndex + 1);
    regionCells.set(letter, [...(regionCells.get(letter) ?? []), cell]);
  });
});

const digitPlacement = [
  ...graph.rows(),
  ...graph.columns(),
  ...regionCells.values(),
].map(cells => new ContainExact(TWICE_EACH, ...cells));

// Clue stacks, transcribed from the coloured squares outside the grid: one
// entry per square, [colour, sum]. The squares are stacked away from the board,
// so the entry furthest from the board is the first run. Every square carries a
// number; on the beige squares the source draws it as a dark cell digit rather
// than as white text.
const COLUMN_CLUES = [
  [[DARK_BROWN, 2]],
  [[DARK_BROWN, 8], [DARK_BROWN, 5], [BROWN, 6], [BEIGE, 4]],
  [[DARK_BROWN, 9], [BROWN, 4], [BEIGE, 3]],
  [[DARK_BROWN, 8], [BROWN, 5], [BEIGE, 2], [BROWN, 12], [BEIGE, 3]],
  [[BROWN, 13], [GREY, 2], [BROWN, 4], [BEIGE, 13]],
  [[BROWN, 17], [BEIGE, 6], [RED, 6]],
  [[BROWN, 21], [BEIGE, 5], [RED, 6]],
  [[BROWN, 9], [GREY, 3], [BROWN, 1], [BEIGE, 11]],
  [[DARK_BROWN, 8], [BROWN, 5], [BEIGE, 3], [BROWN, 12], [BEIGE, 2]],
  [[DARK_BROWN, 6], [BROWN, 6], [BEIGE, 4]],
  [[DARK_BROWN, 8], [DARK_BROWN, 4], [BROWN, 4], [BEIGE, 2]],
  [[DARK_BROWN, 2]],
];

const ROW_CLUES = [
  [[DARK_BROWN, 2], [DARK_BROWN, 2]],
  [[DARK_BROWN, 9], [DARK_BROWN, 7]],
  [[DARK_BROWN, 1], [DARK_BROWN, 2]],
  [[DARK_BROWN, 18], [DARK_BROWN, 15]],
  [[DARK_BROWN, 2], [BROWN, 13], [DARK_BROWN, 2]],
  [[BROWN, 40]],
  [[BEIGE, 9], [BROWN, 22], [BEIGE, 9]],
  [[BROWN, 5], [GREY, 2], [BROWN, 12], [GREY, 3], [BROWN, 5]],
  [[BROWN, 20]],
  [[BROWN, 1], [BEIGE, 13], [BROWN, 1]],
  [[BEIGE, 17]],
  [[BEIGE, 5], [RED, 12], [BEIGE, 5]],
];

// One machine per line, reading the line as shading/digit pairs: each cell's
// shading value is read first, then its digit, so the machine already knows
// whether the digit belongs to an open run when it arrives.
//
// State fields:
//   done  runs finished so far; `done` also indexes the clue being matched
//   open  true while inside the run that clue `done` describes
//   sum   digits collected so far in the open run
//   want  0 = next symbol is a shading value, 1 = next symbol is a digit
// A run here is a maximal stretch of equally shaded cells, so a colour change
// alone ends one run and starts the next ("there is no need [for an unshaded
// cell] between runs of differing colours"), while two runs of the same colour
// are already unable to touch ("there must be at least one unshaded cell
// between runs of the same color").
function japaneseSumsMachine(clues) {
  const colours = clues.map(clue => clue[0]);
  const sums = clues.map(clue => clue[1]);
  const runCount = clues.length;

  return NFA.encodeSpec({
    startState: { done: 0, open: false, sum: 0, want: 0 },
    transition: (state, value) => {
      if (state.want === 1) {
        if (!state.open) return { ...state, want: 0 };
        const sum = state.sum + value;
        if (sum > sums[state.done]) return undefined;
        return { ...state, sum, want: 0 };
      }
      const closes = state.open && state.sum !== sums[state.done];
      if (value === UNSHADED) {
        if (closes) return undefined;
        return {
          done: state.done + (state.open ? 1 : 0),
          open: false, sum: 0, want: 1,
        };
      }
      // A shaded cell of the open run's colour extends it.
      if (state.open && colours[state.done] === value) {
        return { ...state, want: 1 };
      }
      if (closes) return undefined;
      const done = state.done + (state.open ? 1 : 0);
      if (done >= runCount) return undefined;          // more runs than clues
      if (colours[done] !== value) return undefined;   // wrong colour for the clue
      return { done, open: true, sum: 0, want: 1 };
    },
    // The scan ends after a digit, so `want` is back to 0; an open run must
    // close on its clue's total, and every clue must have been used.
    accept: state => state.want === 0 && (state.open
      ? state.done === runCount - 1 && state.sum === sums[state.done]
      : state.done === runCount),
  }, shape);
}

const interleave = cells => cells.flatMap(cell => [shading.at(cell), cell]);

const japaneseSums = [
  ...ROW_CLUES.map((clues, index) => new NFA(
    japaneseSumsMachine(clues), `row ${index + 1}`,
    interleave(graph.row(index + 1)))),
  ...COLUMN_CLUES.map((clues, index) => new NFA(
    japaneseSumsMachine(clues), `column ${index + 1}`,
    interleave(graph.column(index + 1)))),
];

// White dots, transcribed from the source's white circles on cell edges.
const DOTS = [
  [[2, 4], [2, 5]],
  [[2, 11], [2, 12]],
  [[3, 8], [3, 9]],
  [[8, 12], [9, 12]],
  [[9, 1], [10, 1]],
  [[11, 7], [11, 8]],
  [[11, 10], [11, 11]],
];

const whiteDots = DOTS.map(
  pair => new WhiteDot(...pair.map(([row, col]) => makeCellId(row, col))));

return [
  shape,
  shading.toVar('shading'),
  ...digitPlacement,
  ...japaneseSums,
  ...whiteDots,
];
