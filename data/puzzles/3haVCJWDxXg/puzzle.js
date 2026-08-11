// Title: Tricky but Approachable
// Author: Serhii Tyshchenko
// Video: https://www.youtube.com/watch?v=3haVCJWDxXg
// Source: https://app.crackingthecryptic.com/sudoku/fPHT869f6B

// Normal sudoku rules apply (default 3x3 boxes). Digits along an arrow sum to
// the number in the attached circle: each circled cell is itself a normal
// grid cell whose digit is the target sum, with no separate written total.
// Five circled cells each carry two or four arrow arms; the arms of a shared
// circle bend once, one cell from the bulb, and diverge from there, so a
// bulb with several arms has that first bend cell counted in each arm's sum
// independently. Cell paths transcribed from the drawn arrow waypoints.
const arrows = [
  new Arrow('R4C4', 'R3C3', 'R2C3', 'R1C3'),
  new Arrow('R4C4', 'R3C3', 'R3C2', 'R3C1'),
  new Arrow('R5C5', 'R4C6', 'R3C6'),
  new Arrow('R5C5', 'R4C6', 'R4C7'),
  new Arrow('R5C5', 'R6C4', 'R6C3'),
  new Arrow('R5C5', 'R6C4', 'R7C4'),
  new Arrow('R6C6', 'R7C7', 'R7C8', 'R7C9'),
  new Arrow('R6C6', 'R7C7', 'R8C7', 'R9C7'),
  new Arrow('R1C9', 'R2C8', 'R2C7', 'R2C6'),
  new Arrow('R1C9', 'R2C8', 'R3C8', 'R4C8'),
  new Arrow('R9C1', 'R8C2', 'R7C2', 'R6C2'),
  new Arrow('R9C1', 'R8C2', 'R8C3', 'R8C4'),
];

// Givens transcribed from the drawn grid.
return [
  new Shape('9x9'),
  new Given('R1C1', 7),
  new Given('R1C7', 5),
  new Given('R3C9', 7),
  new Given('R7C1', 3),
  new Given('R9C3', 8),
  new Given('R9C9', 5),
  ...arrows,
];
