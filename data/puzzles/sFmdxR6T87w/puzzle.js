// Title: 3etweeN
// Author: Henk Nicolai
// Video: https://www.youtube.com/watch?v=sFmdxR6T87w
// Source: https://app.crackingthecryptic.com/sudoku/BT7TMtM62j

// The payload carries no rules text. Standard normal sudoku on 9x9 with
// standard 3x3 boxes (matches the payload's own `regions`), one given, seven
// grey lines drawn with the standard SudokuPad between-line convention (open
// circle at each end, values strictly between the two circled values), and
// two sum arrows (open circle bulb = sum of its arm).
//
// Three of the between lines carry an extra circle at an interior cell, not
// only at their two ends (payload `underlays`, colour/size matching the
// endpoint circles). Each interior circle sits exactly where two `Between`
// segments would need to share an endpoint (matching how an arrow bulb splits
// a shaft into two arms): the drawn line #1 (R3C5..R3C1) is read as segments
// 2+3 below, split at R5C3, and drawn line #3 (R1C9..R9C9) is read as
// segments 5+6+7, split at R5C8 and R7C8. Every circle in the payload is
// consumed exactly once across the ten segments below, with no leftover
// circled cell and no segment endpoint left uncircled.

const betweenLines = [
  ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'],
  ['R3C5', 'R2C4', 'R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3'],
  ['R5C3', 'R4C2', 'R3C1'],
  ['R3C5', 'R4C6', 'R5C7', 'R4C7', 'R3C7', 'R2C7', 'R1C7'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C8'],
  ['R5C8', 'R6C9', 'R7C8'],
  ['R7C8', 'R8C9', 'R9C9'],
  ['R7C6', 'R7C7', 'R8C7', 'R9C7', 'R8C6'],
  ['R9C1', 'R8C1', 'R8C2', 'R9C2'],
  ['R7C1', 'R6C2', 'R7C3'],
];

// Arrow(...cells): first cell is the bulb, remaining cells are the arm.
const arrows = [
  ['R1C5', 'R1C6', 'R2C6', 'R3C6'],
  ['R9C5', 'R9C4', 'R8C4', 'R7C4'],
];

return [
  new Shape('9x9'),

  new Given('R2C2', 3),

  ...betweenLines.map(cells => new Between(...cells)),

  ...arrows.map(cells => new Arrow(...cells)),
];
