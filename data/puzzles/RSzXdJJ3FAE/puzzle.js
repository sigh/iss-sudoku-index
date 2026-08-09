// Title: Intersections
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=RSzXdJJ3FAE
// Source: https://sudokupad.app/9g93q6jrmB

// Every row, column, and 3x3 box has either zero or exactly d copies of each
// digit d. The outlined cages contain no repeated digit.
//
// Rows/columns/boxes routinely repeat digits (e.g. a unit holding digit 4
// four times), so the grid is Raw: no implicit rows, columns, boxes or
// all-different, so every rule below is stated explicitly.
const shape = new Shape('9x9', 9, 'Raw');
const board = cellGraph(shape);

// Raw grid has no default boxes; build the ordinary 3x3 tiling explicitly.
const boxes = [];
for (let r = 1; r <= 9; r += 3) {
  for (let c = 1; c <= 9; c += 3) {
    boxes.push(board.block(makeCellId(r, c), 3, 3));
  }
}
const units = [...board.rows(), ...board.columns(), ...boxes];

// Each machine scans one unit for one target digit; count d is allowed only
// as zero (absent) or d (present), with d + 1 rejected immediately.
const countMachine = (target) => NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => {
    const next = count + (value === target ? 1 : 0);
    return next <= target ? next : undefined;
  },
  accept: (count) => count === 0 || count === target,
  maxDepth: 9,
}, shape);
const selfCounts = units.flatMap(cells =>
  Array.from({ length: 9 }, (_, i) =>
    new NFA(countMachine(i + 1), `count ${i + 1}`, ...cells)));

// These no-total cage cell lists are transcribed from the drawn cage outlines.
const cages = [
  ['R3C4', 'R4C4', 'R5C2', 'R5C3', 'R5C4'],
  ['R4C6', 'R4C7', 'R5C7'],
  ['R3C2', 'R4C2'],
  ['R7C4', 'R7C5'],
  ['R8C2', 'R9C2'],
  ['R2C6', 'R2C7'],
  ['R2C9', 'R3C9'],
  ['R8C8', 'R8C9'],
].map(cells => new AllDifferent(...cells));

return [
  shape,
  ...selfCounts,
  ...cages,
];
