// Title: Sudo-Cube
// Author: XeonRisq
// Video: https://www.youtube.com/watch?v=TuqzLD0EKTc
// Source: https://app.crackingthecryptic.com/sudoku/7gbg37R9fj

// Normal sudoku rules apply. Grey lines: digits between the two circled
// ends (Between). Purple lines: digits consecutive, any order (Renban).
// Green lines: adjacent digits differ by >= 5 (Whisper(5)). Outside
// diagonal clues: sum of the digits along the indicated diagonal, repeats
// allowed (Sum, not Cage).
//
// Two arrows drawn outside the grid, each pointing down-left, settle which
// of the two candidate diagonals each outside "22" clue reads (each outside
// position is otherwise equidistant between an up-left and a down-left
// diagonal).

// Grey "between" lines: two overlapping squares of circled corners
// (top-left: R2C2/R2C6/R6C6/R6C2; bottom-right: R4C4/R4C8/R8C8/R8C4) plus
// four diagonal connectors joining matching corners of the two squares.
const greyLines = [
  ['R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2'],
  ['R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6'],
  ['R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6'],
  ['R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8'],
  ['R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4'],
  ['R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8'],
  ['R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'],
  ['R2C2', 'R3C3', 'R4C4'],
  ['R6C2', 'R7C3', 'R8C4'],
  ['R2C6', 'R3C7', 'R4C8'],
  ['R6C6', 'R7C7', 'R8C8'],
];

// Purple Renban lines: the middle three cells of each top-left-square edge.
const purpleLines = [
  ['R2C3', 'R2C4', 'R2C5'],
  ['R3C2', 'R4C2', 'R5C2'],
  ['R3C6', 'R4C6', 'R5C6'],
  ['R6C3', 'R6C4', 'R6C5'],
];

// Green German-whisper(5) lines: the middle three cells of each
// bottom-right-square edge.
const greenLines = [
  ['R4C5', 'R4C6', 'R4C7'],
  ['R5C8', 'R6C8', 'R7C8'],
  ['R8C5', 'R8C6', 'R8C7'],
  ['R5C4', 'R6C4', 'R7C4'],
];

return [
  new Shape('9x9'),
  new Given('R9C1', 2),

  ...greyLines.map(cells => new Between(...cells)),
  ...purpleLines.map(cells => new Renban(...cells)),
  ...greenLines.map(cells => new Whisper(5, ...cells)),

  // Diagonal touching top edge at R1C5 and left edge at R5C1; direction
  // fixed by arrow #1 (drawn ray R1C5-R2C4-R3C3-R4C2-R5C1, down-left).
  new Sum(22, 'R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'),
  // Diagonal touching right edge at R7C9 and bottom edge at R9C7; direction
  // fixed by arrow #0 (drawn ray R7C9-R8C8-R9C7, down-left).
  new Sum(22, 'R7C9', 'R8C8', 'R9C7'),
];
