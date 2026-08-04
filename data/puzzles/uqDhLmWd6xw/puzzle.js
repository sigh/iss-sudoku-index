// Title: Arrows & Killers
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=uqDhLmWd6xw
// Source: https://app.crackingthecryptic.com/sudoku/R78bj3n4H9

// Normal sudoku rules apply (standard rows/columns/boxes; the payload draws
// the boxes explicitly but they coincide with the default 3x3 boxes, so no
// custom Region/NoBoxes is needed). Cage(): digits do not repeat and sum to
// the shown total. Arrow(): the first cell of each Arrow() call is the
// circled bulb; the remaining cells are the arrow's line, whose digits sum
// to the bulb's digit (bulb cell is separate from every line cell).

const cages = [
  new Cage(10, 'R1C8', 'R1C7', 'R2C7'),
  new Cage(13, 'R3C6', 'R4C6'),
  new Cage(13, 'R3C4', 'R4C4'),
  new Cage(11, 'R6C6', 'R7C6'),
  new Cage(11, 'R6C4', 'R7C4'),
  new Cage(13, 'R6C9', 'R7C9'),
  new Cage(12, 'R6C1', 'R7C1'),
];

const arrows = [
  new Arrow('R2C8', 'R2C9', 'R3C9'),
  new Arrow('R3C4', 'R2C5', 'R1C6'),
  new Arrow('R3C6', 'R4C5', 'R5C4'),
  new Arrow('R5C6', 'R6C5', 'R7C4'),
  new Arrow('R7C6', 'R8C5', 'R9C4'),
  new Arrow('R6C8', 'R5C9', 'R4C9'),
  new Arrow('R7C8', 'R8C9', 'R9C9'),
  new Arrow('R7C2', 'R8C1', 'R9C1'),
  new Arrow('R6C2', 'R5C1', 'R4C1'),
  new Arrow('R2C2', 'R2C1', 'R3C1'),
];

return [
  new Shape('9x9'),
  new Given('R1C4', 2),
  new Given('R9C6', 2),
  ...cages,
  ...arrows,
];
