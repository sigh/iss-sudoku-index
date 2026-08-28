// Title: Feb 8, 2022: One by One
// Author: clover!
// Video: https://www.youtube.com/watch?v=0lKUNou9vuk
// Source: https://tinyurl.com/3cbsjf4n

// Fill with digits 1-5 only (some cells stay empty); each of 1-5 appears
// exactly once per row, column, and standard 3x3 box (no jigsaw/windoku
// markup in the payload, so the boxes are the default tiling). Cells hold
// 0-5 on a Raw grid, 0 meaning empty: widening to a 9-symbol Sudoku
// alphabet and padding the blanks with pseudo-digits 6-9 would force the
// blank cells into their own extra Latin-square structure across rows,
// columns AND boxes simultaneously, which the rules never state -- only
// that 4 cells per row/column/box are empty. ContainExact's multiset check
// gets the count right without adding that structure.
// Each grey line has exactly one filled (non-zero) cell.

const shape = new Shape('9x9', '0-5', 'Raw');
const graph = cellGraph(shape);
const MULTISET = '0_0_0_0_1_2_3_4_5';

const rows = graph.rows().map(cells => new ContainExact(MULTISET, ...cells));
const cols = graph.columns().map(cells => new ContainExact(MULTISET, ...cells));
// Raw grids report no default box regions, so the box cell lists come from
// an ordinary Sudoku-type graph over the same coordinates.
const boxes = cellGraph('9x9').boxes().map(
  cells => new ContainExact(MULTISET, ...cells));

// Givens -- from the printed grid.
const givens = [
  new Given('R1C9', 1),
  new Given('R2C2', 5),
  new Given('R3C2', 4),
  new Given('R3C5', 5),
  new Given('R4C2', 3),
  new Given('R4C4', 1),
  new Given('R4C6', 2),
  new Given('R6C4', 4),
  new Given('R6C6', 3),
  new Given('R6C8', 2),
  new Given('R7C5', 4),
  new Given('R7C8', 3),
  new Given('R8C8', 4),
  new Given('R9C1', 2),
];

// One filled cell per grey line: a 2-state counting NFA that only tracks how
// many non-zero cells have been seen so far -- order-independent, since the
// rule does not care which cell it is. Passing `shape` (not a bare value
// count) makes encodeSpec report `value` as the actual 0-5 grid digit.
const oneFilledSpec = NFA.encodeSpec({
  startState: 0,
  transition: (seenFilled, value) => {
    if (value === 0) return seenFilled;
    if (seenFilled === 0) return 1;
    return undefined; // a second filled cell on the line -- reject
  },
  accept: (seenFilled) => seenFilled === 1,
}, shape);

// Grey lines -- cell paths as drawn (waypoint order).
const grayLines = [
  ['R3C5', 'R4C5', 'R5C6', 'R5C7', 'R4C8', 'R3C8', 'R2C7', 'R2C6'],
  ['R5C2', 'R6C1', 'R7C1', 'R8C2'],
  ['R5C8', 'R4C9', 'R3C9', 'R2C8'],
  ['R6C5', 'R5C4', 'R5C3', 'R6C2', 'R7C2', 'R8C3', 'R8C4'],
  ['R7C6', 'R8C6', 'R9C5', 'R9C4'],
  ['R3C4', 'R2C4', 'R1C5', 'R1C6'],
];
const lines = grayLines.map(cells => new NFA(oneFilledSpec, 'oneFilled', ...cells));

return [shape, ...givens, ...rows, ...cols, ...boxes, ...lines];
