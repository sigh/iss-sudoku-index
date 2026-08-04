// Title: Charybde and Scylla
// Author: Orlo
// Video: https://www.youtube.com/watch?v=Wu9SZYuZY7w
// Source: https://app.crackingthecryptic.com/sudoku/gMpr4t68gG

// Rules encoded: standard sudoku (rows/cols/regions all-different) over 9
// drawn irregular jigsaw regions (not boxes); anti-knight; a bulb-first
// thermometer R2C8->R1C9; an outside clue giving the sum (16) of the
// anti-diagonal R9C1..R1C9 (the thermometer's two cells are that diagonal's
// last two cells); and an undrawn 8-cell horizontal-or-vertical straight
// line, somewhere in the grid, whose neighbouring cells differ by >= 5.
// The line's placement is not given -- the solver must find it -- so it is
// encoded as a disjunction (Or) of a Whisper(5) over every candidate 8-cell
// row/column run (2 runs per row + 2 runs per column = 36 candidates).

const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C3', 'R3C1', 'R3C3', 'R2C4', 'R2C5'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C3', 'R6C1', 'R6C3', 'R3C2', 'R2C2'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R5C2', 'R6C2'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C4', 'R3C5', 'R3C6', 'R2C7', 'R2C8'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
  ['R7C4', 'R7C5', 'R7C6', 'R8C4', 'R9C4', 'R9C5', 'R9C6', 'R8C3', 'R8C2'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C7', 'R3C8', 'R3C9', 'R4C8', 'R5C8'],
  ['R4C7', 'R4C9', 'R5C7', 'R5C9', 'R6C7', 'R6C8', 'R6C9', 'R7C8', 'R8C8'],
  ['R7C7', 'R7C9', 'R8C7', 'R8C9', 'R9C7', 'R9C8', 'R9C9', 'R8C6', 'R8C5'],
];
const jigsaw = regions.map(cells => new Jigsaw('9x9', ...cells));

// Every candidate placement of the undrawn 8-cell straight line: for each
// row, the two possible column offsets (1-8, 2-9), and symmetrically for
// each column.
const lineCandidates = [];
for (let r = 1; r <= 9; r++) {
  for (const start of [1, 2]) {
    lineCandidates.push(
      Array.from({ length: 8 }, (_, i) => makeCellId(r, start + i)));
  }
}
for (let c = 1; c <= 9; c++) {
  for (const start of [1, 2]) {
    lineCandidates.push(
      Array.from({ length: 8 }, (_, i) => makeCellId(start + i, c)));
  }
}
const mysteryLine = new Or(
  lineCandidates.map(cells => new Whisper(5, ...cells)));

return [
  new Shape('9x9'),
  new Given('R5C5', 2),
  new NoBoxes(),
  ...jigsaw,
  new AntiKnight(),
  new Thermo('R2C8', 'R1C9'),
  new Sum(
    16,
    'R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'),
  mysteryLine,
];
