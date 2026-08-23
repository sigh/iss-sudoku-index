// Title: Phoenix Knights
// Author: apiyo
// Video: https://www.youtube.com/watch?v=LT2NrAgT-rs
// Source: https://app.crackingthecryptic.com/sudoku/bGh8gpgMMd

// Normal sudoku rules apply (standard rows/cols/boxes, regions are the default
// 3x3 boxes). Cells a knight's move apart cannot repeat a digit (AntiKnight).
// Neighbouring digits along a red line differ by at least 5 (Whisper(5)); two
// of the six drawn red lines fold back through the same box, so each line is
// given as the ordered chain of cell-adjacent steps its drawn path actually
// takes (per the geometry helper's interpolated pairs), not source waypoint
// order. A black dot means a 1:2 ratio (BlackDot) and a white dot means
// consecutive digits (WhiteDot); "not all possible dots are shown" only
// disclaims exhaustiveness, so undrawn adjacent pairs are left unconstrained.

const whispers = [
  ['R2C1', 'R1C2'],
  ['R4C4', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R6C4'],
  ['R4C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R6C6'],
  ['R4C5', 'R3C5', 'R2C6'],
  ['R6C5', 'R7C5', 'R8C4'],
  ['R9C8', 'R8C9'],
].map((cells) => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...whispers,
  new BlackDot('R5C7', 'R5C8'),
  new WhiteDot('R5C8', 'R5C9'),
];
