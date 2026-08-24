// Title: Renban XV
// Author: tenaliraman
// Video: https://www.youtube.com/watch?v=9Pj4_tFUIMA
// Source: https://app.crackingthecryptic.com/sudoku/3HG8mfT49q

// Normal Sudoku on a standard 3x3-box 9x9 grid (the payload's regions array
// is exactly the nine default boxes, so no explicit Regions/NoBoxes needed).
// Each grey line is a Renban: its own drawn cell count is the consecutive
// run length, in any order. Each marked X/V is one adjacent-pair sum
// (10 / 5). The rules state Xs and Vs are not exhaustively marked, so no
// negative constraint (StrictXV) applies to unmarked pairs -- only the
// drawn marks below are constrained.

const renbans = [
  ['R1C3', 'R1C4', 'R2C4'],
  ['R1C6', 'R2C6', 'R3C6'],
  ['R1C8', 'R2C8', 'R3C8'],
  ['R5C4', 'R4C4', 'R4C5'],
  ['R5C2', 'R6C2', 'R6C3'],
  ['R5C8', 'R6C8', 'R6C7'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4'],
  ['R7C5', 'R7C6'],
].map(cells => new Renban(...cells));

const xMarks = [
  ['R2C1', 'R2C2'],
  ['R3C4', 'R3C5'],
  ['R5C5', 'R6C5'],
  ['R5C6', 'R6C6'],
  ['R7C8', 'R7C9'],
].map(cells => new X(...cells));

const vMarks = [
  ['R2C3', 'R3C3'],
  ['R2C7', 'R3C7'],
  ['R4C2', 'R4C3'],
  ['R4C7', 'R4C8'],
  ['R7C7', 'R7C8'],
  ['R7C4', 'R8C4'],
].map(cells => new V(...cells));

return [
  new Shape('9x9'),
  ...renbans,
  ...xMarks,
  ...vMarks,
];
