// Title: Straightjacket
// Author: Isamook
// Video: https://www.youtube.com/watch?v=EKsVsYAlK7A
// Source: https://sudokupad.app/vxtt08627z

// Normal Sudoku; red cage totals sum the targets selected by their digits.
// A pointer selects the numbered box, preserving its relative position.
// Lavender lines are zippers, with marked central cells. Fog is display only.

// The six red cage outlines and their printed totals.
const cages = [
  [27, ['R1C1','R1C2','R1C3']],
  [3, ['R1C5','R1C6','R1C7']],
  [6, ['R1C9','R2C9','R3C9']],
  [18, ['R7C9','R8C9','R9C9']],
  [6, ['R4C5','R5C4','R5C5']],
  [37, ['R7C1','R7C2','R7C3','R8C1','R8C2','R8C3','R9C1','R9C2','R9C3']],
];
// The six lavender paths; each dot lies at its path's middle cell.
const lines = [
  ['R1C3','R1C2','R1C1'],
  ['R1C5','R1C6','R1C7'],
  ['R2C1','R2C2','R2C3','R3C3','R3C2'],
  ['R2C4','R2C5','R3C4'],
  ['R4C6','R5C6','R6C6','R6C5','R6C4'],
  ['R1C9','R2C9','R3C9','R4C9','R5C9','R6C9','R7C9','R8C9','R9C9'],
];
const pointers = cages.flatMap(([, cells]) => cells);
const targets = new Var('VT', 'Pointed-at digit', pointers.length);
// Each auxiliary digit equals the target in the box selected by the pointer.
// The nine alternatives enumerate box numbers, not puzzle solutions.
const selections = pointers.map((pointer, i) => {
  const {row, col} = parseCellId(pointer);
  return new Or(Array.from({length: 9}, (_, b) => new And([
    new Given(pointer, b + 1),
    new SameValues(2, targets.cell(i + 1), makeCellId(
      3 * Math.floor(b / 3) + (row - 1) % 3 + 1,
      3 * (b % 3) + (col - 1) % 3 + 1)),
  ])));
});
const totals = cages.map(([total, cells], i) => {
  const start = cages.slice(0, i).reduce((n, [, previous]) => n + previous.length, 0);
  return new Sum(total, ...cells.map((_, j) => targets.cell(start + j + 1)));
});
return [
  new Shape('9x9'),
  targets,
  ...selections,
  ...totals,
  ...lines.map(cells => new Zipper(...cells)),
];
