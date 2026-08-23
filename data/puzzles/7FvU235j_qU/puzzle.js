// Title: Crossroads
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=7FvU235j_qU
// Source: https://app.crackingthecryptic.com/sudoku/H9QDg4N2FP

// Normal sudoku (default 9x9, 3x3 boxes). Eight plain grey circles sit two
// per corner (R2C1/R1C2, R1C8/R2C9, R8C9/R9C8, R9C2/R8C1). Four coloured
// hexagonal lines, one per quadrant, each associated with the circle pair in
// its own corner by proximity: every digit on a line is strictly between
// the two circle digits (`Between`). Each line sits alone in one grid
// quadrant, nearest to only one corner's circle pair, so no other pairing
// is geometrically plausible. Eight outside arrows give little-killer
// diagonal sums (repeats allowed); the four short 2-cell diagonals coincide
// with the four corner circle pairs.

const geometry = cellGeometry(9);

// Diagonal sum clues (LittleKiller). Cell order taken from the puzzle's own
// arrow direction; the corner id each resolves to is ISS's own canonical
// diagonal label, not necessarily the cell the arrow visually touches.
const littleKillers = [
  [13, ['R1C6', 'R2C7', 'R3C8', 'R4C9']],
  [11, ['R1C8', 'R2C9']],
  [10, ['R6C9', 'R7C8', 'R8C7', 'R9C6']],
  [5, ['R8C9', 'R9C8']],
  [27, ['R9C4', 'R8C3', 'R7C2', 'R6C1']],
  [9, ['R9C2', 'R8C1']],
  [30, ['R4C1', 'R3C2', 'R2C3', 'R1C4']],
  [15, ['R2C1', 'R1C2']],
].map(([value, cells]) => LittleKiller.fromCells(value, cells, geometry));

// Between lines: first/last args are the associated circle pair; the middle
// args are the hexagonal line's cells (Between only checks bounds against
// the first/last args, so the corner circles do not need to be adjacent to
// the line on the grid).
const betweenLines = [
  new Between('R2C1', 'R2C3', 'R3C4', 'R4C5', 'R5C4', 'R4C3', 'R3C2', 'R1C2'),
  new Between('R1C8', 'R2C7', 'R3C6', 'R4C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9'),
  new Between('R8C9', 'R7C8', 'R6C7', 'R5C6', 'R6C5', 'R7C6', 'R8C7', 'R9C8'),
  new Between('R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C4', 'R6C3', 'R7C2', 'R8C1'),
];

return [
  new Shape('9x9'),
  ...littleKillers,
  ...betweenLines,
];
