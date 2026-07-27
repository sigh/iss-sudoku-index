// Title: Off Piste
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=iOKWXpS_sFk
// Source: https://sudokupad.app/c0tbslozh0

// Normal sudoku rules apply (default row/column/box all-different from Shape).
//
// Headless-Arrows: the rules give no visual marker for which end of a
// greenyellow line is the sum -- the payload has only `lines`, no `arrows`
// bulb/head data, matching the "headless" name. The digit at ONE end equals
// the sum of the other digits on that line, but which end is not stated or
// drawn, so each line is Or(end-A-is-sum, end-B-is-sum). Arrow's first cell
// is the sum cell (the rest is the arm), so each Or tries the cell list both
// ways round.
//
// X-Sums: outside clues. Each clue's overlay `center` is [row, col],
// row-first, 0-indexed (per payload convention); an out-of-range axis marks
// which side of the grid the clue sits on and which row/column it reads. The
// rules' own worked example -- "if R5C1 is 4 then sum of R5C1-4 is 15" --
// independently pins both the row-first reading and the row-5 clue's
// rightward direction (overlay center [4.5,-0.5], value 15).

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Headless-arrow line cells, in drawn order.
const headlessArrowLines = [
  ['R2C2', 'R2C3', 'R2C4'],
  ['R1C7', 'R2C7', 'R3C7'],
  ['R1C8', 'R2C8', 'R3C8'],
  ['R8C9', 'R8C8', 'R9C8'],
  ['R8C1', 'R7C2', 'R8C3'],
  ['R2C5', 'R3C4', 'R4C4', 'R5C4'],
  ['R7C4', 'R8C4', 'R9C4'],
  ['R6C6', 'R7C6', 'R8C6'],
  ['R1C2', 'R1C3', 'R1C4'],
];

const headlessArrows = headlessArrowLines.map(cells => new Or([
  new Arrow(...cells),
  new Arrow(...cells.slice().reverse()),
]));

// X-Sum outside clues: (total, ray start cell, ray direction), read from each
// outside clue badge's off-grid position.
const xSums = [
  // center [1.5,-0.5]: left of row 2, reading rightward from R2C1.
  XSum.fromCells(15, graph.ray('R2C1', 0, 1), geometry),
  // center [-0.5,7.5]: above column 8, reading downward from R1C8.
  XSum.fromCells(10, graph.ray('R1C8', 1, 0), geometry),
  // center [7.5,9.5]: right of row 8, reading leftward from R8C9.
  XSum.fromCells(15, graph.ray('R8C9', 0, -1), geometry),
  // center [9.5,1.5]: below column 2, reading upward from R9C2.
  XSum.fromCells(11, graph.ray('R9C2', -1, 0), geometry),
  // center [4.5,-0.5]: left of row 5, reading rightward from R5C1 -- the
  // rules text's own worked example.
  XSum.fromCells(15, graph.ray('R5C1', 0, 1), geometry),
];

return [
  new Shape('9x9'),
  ...headlessArrows,
  ...xSums,
];
