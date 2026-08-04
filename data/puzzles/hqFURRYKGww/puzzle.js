// Title: Steeples
// Author: Derektionary
// Video: https://www.youtube.com/watch?v=hqFURRYKGww
// Source: https://app.crackingthecryptic.com/sudoku/LnHb4hQ62N

// Normal sudoku rules (default rows/cols/boxes; no givens). Three killer
// cages (distinct + sum, total in the top-left cell). Eight green lines:
// adjacent digits must differ by at least 5.

// Cage cells and totals transcribed from the drawn `cages` array.
const cages = [
  [40, 'R2C2', 'R3C2', 'R4C2', 'R4C1', 'R5C1', 'R4C3', 'R5C3'],
  [42, 'R2C5', 'R3C5', 'R4C5', 'R4C4', 'R5C4', 'R4C6', 'R5C6'],
  [38, 'R2C8', 'R3C8', 'R4C8', 'R4C7', 'R5C7', 'R4C9', 'R5C9'],
];

// Green line cell paths, walked in drawn waypoint order (`lines[].wayPoints`).
// Several segments cut diagonally across a cell corner rather than staying
// orthogonal; Whisper only constrains consecutive pairs in the list, so the
// diagonal steps carry no extra meaning.
const whispers = [
  ['R1C1', 'R1C2', 'R2C3', 'R1C4', 'R1C5'],
  ['R2C6', 'R1C7', 'R1C8', 'R2C9'],
  ['R4C9', 'R3C8', 'R4C7'],
  ['R4C6', 'R3C5', 'R4C4'],
  ['R4C3', 'R3C2', 'R4C1'],
  ['R6C1', 'R7C2', 'R7C3', 'R6C4'],
  ['R6C5', 'R7C6', 'R7C7', 'R6C8'],
  ['R8C1', 'R9C2', 'R9C3', 'R8C4', 'R9C5', 'R9C6', 'R8C7'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
];
