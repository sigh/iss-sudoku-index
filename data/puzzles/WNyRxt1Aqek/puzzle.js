// Title: Irregular Whirlpool
// Author: Jojo81
// Video: https://www.youtube.com/watch?v=WNyRxt1Aqek
// Source: https://app.crackingthecryptic.com/sudoku/494Mp9mjR6

// Irregular Sudoku uses the nine drawn regions instead of standard boxes.
// Digits along an arrow sum to the digit in that arrow's circle. Digits in a
// cage sum to the small clue in the cage's top-left cell. Nothing is omitted.
const regions = [
  ['R1C1', 'R1C5', 'R1C9', 'R5C1', 'R5C5', 'R5C9', 'R9C1', 'R9C5', 'R9C9'],
  ['R1C2', 'R2C1', 'R2C2', 'R2C3', 'R3C2', 'R3C3', 'R3C4', 'R4C3', 'R4C4'],
  ['R1C3', 'R1C4', 'R1C6', 'R1C7', 'R2C4', 'R2C5', 'R2C6', 'R3C5', 'R4C5'],
  ['R1C8', 'R2C7', 'R2C8', 'R2C9', 'R3C6', 'R3C7', 'R3C8', 'R4C6', 'R4C7'],
  ['R3C1', 'R4C1', 'R4C2', 'R5C2', 'R5C3', 'R5C4', 'R6C1', 'R6C2', 'R7C1'],
  ['R3C9', 'R4C8', 'R4C9', 'R5C6', 'R5C7', 'R5C8', 'R6C8', 'R6C9', 'R7C9'],
  ['R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C1', 'R8C2', 'R8C3', 'R9C2'],
  ['R6C5', 'R7C5', 'R8C4', 'R8C5', 'R8C6', 'R9C3', 'R9C4', 'R9C6', 'R9C7'],
  ['R6C6', 'R6C7', 'R7C6', 'R7C7', 'R7C8', 'R8C7', 'R8C8', 'R8C9', 'R9C8'],
];

// Drawn irregular-region membership.
const jigsaw = regions.map(cells => new Jigsaw('9x9', ...cells));

// Five arrows whose circle is the first cell of the drawn line, arm following.
const arrows = [
  new Arrow('R3C7', 'R4C8', 'R5C8', 'R6C8'),
  new Arrow('R7C6', 'R8C5', 'R8C4'),
  new Arrow('R3C4', 'R2C5', 'R2C6'),
  new Arrow('R7C3', 'R6C2', 'R5C2', 'R4C2'),
  new Arrow('R8C6', 'R7C5', 'R7C4'),
  // The sixth arrow's own line begins at R4C5: its first waypoint sits the
  // same ~0.28-cell offset from R4C5's centre that every other arrow's first
  // waypoint sits from its own circle (all five above), so R4C5, not the
  // separately-drawn circle graphic one cell south, is this arrow's control
  // cell.
  new Arrow('R4C5', 'R5C6', 'R6C5', 'R5C4'),
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...jigsaw,
  new Given('R2C1', 1),
  new Given('R2C9', 4),
  new Given('R8C1', 3),
  new Given('R8C9', 2),
  new Cage(10, 'R3C3', 'R4C3', 'R4C4'),
  new Cage(14, 'R3C6', 'R4C6', 'R4C7'),
  new Cage(12, 'R6C6', 'R6C7', 'R7C7'),
  new Cage(12, 'R6C3', 'R6C4', 'R7C4'),
  ...arrows,
];
