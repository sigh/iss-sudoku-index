// Title: The Four Lines
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=51X-WroOyWI
// Source: https://app.crackingthecryptic.com/sudoku/2Ln6hRj4Gm
//
// Normal sudoku rules apply (standard rows/columns/3x3 boxes, no givens).
// Cage clue: digits in a cage sum to the small total shown in its top-left
// cell (Cage also enforces no repeated digit within a cage; every cage below
// is confined to a single row, column, or box, so that uniqueness is already
// implied by the base sudoku rules and adds nothing beyond the stated sum).
// Green-line clue: adjacent digits on a green line differ by at least 5
// (Whisper). Each drawn line is a single two-cell segment.
// Outside-diagonal clue: the number outside the grid is the sum of the
// digits along the indicated 4-cell diagonal running into the grid. The
// rules state digits may repeat on such a diagonal unless other rules
// (row/column/box) already forbid it, so the diagonal itself gets a Sum
// (no built-in uniqueness), not a Cage.

const cages = [
  // Cage cell lists transcribed from the drawn cages (top-left cell listed
  // first is only where the clue total is drawn; membership order does not
  // matter to Cage).
  [8, 'R1C1', 'R1C2', 'R2C1'],
  [15, 'R1C5', 'R2C5'],
  [22, 'R2C2', 'R3C1', 'R3C2'],
  [14, 'R5C1', 'R5C2'],
  [11, 'R7C1', 'R7C2', 'R8C2'],
  [12, 'R8C1', 'R9C1', 'R9C2'],
  [10, 'R6C3', 'R6C4'],
  [10, 'R4C3', 'R4C4'],
  [7, 'R4C5', 'R5C5', 'R6C5'],
  [15, 'R8C5', 'R9C5'],
  [10, 'R6C6', 'R6C7'],
  [10, 'R4C6', 'R4C7'],
  [21, 'R1C8', 'R1C9', 'R2C9'],
  [7, 'R2C8', 'R3C8', 'R3C9'],
  [13, 'R5C8', 'R5C9'],
  [9, 'R7C8', 'R7C9', 'R8C8'],
  [18, 'R8C9', 'R9C8', 'R9C9'],
];

// The four drawn green lines, each a single segment covering exactly two
// adjacent cells (a fifth line entry has no coordinates and renders
// nothing, so it is omitted).
const whisperPairs = [
  ['R1C3', 'R1C4'],
  ['R1C6', 'R1C7'],
  ['R9C3', 'R9C4'],
  ['R9C6', 'R9C7'],
];

// Outside-diagonal sums: an outside number paired with a short off-grid
// arrow, resolved to a starting cell and direction from the drawn arrow
// geometry (see the puzzle directory's notes for the waypoint-to-cell
// reasoning). A third arrow entry has no coordinates and renders nothing,
// so it is omitted.
const diagonals = [
  [26, ['R4C1', 'R3C2', 'R2C3', 'R1C4']],
  [17, ['R6C9', 'R7C8', 'R8C7', 'R9C6']],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...whisperPairs.map(([a, b]) => new Whisper(5, a, b)),
  ...diagonals.map(([sum, cells]) => new Sum(sum, ...cells)),
];
