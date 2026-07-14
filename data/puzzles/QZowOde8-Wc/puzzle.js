// Title: Game Of Arrows
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=QZowOde8-Wc
// Source: https://sudokupad.app/fgujiipq9z

// Normal sudoku regions are the default 3x3 boxes (matches the payload's
// region list), so no explicit Regions constraint is needed.

// Each entry is one drawn arrow: the circled bulb cell, followed by the
// three arm cells (in stroke order) whose digits must sum to the bulb's
// digit. The bulb overlay always sits on the arrow's first waypoint cell,
// and is a self-referential clue (the bulb's own grid digit is the total) --
// it is not itself an addend.
const ARROWS = [
  ['R4C1', 'R4C2', 'R4C3', 'R4C4'],
  ['R4C5', 'R3C4', 'R2C3', 'R1C2'],
  ['R1C6', 'R2C6', 'R3C6', 'R4C6'],
  ['R5C6', 'R4C7', 'R3C8', 'R2C9'],
  ['R6C9', 'R6C8', 'R6C7', 'R6C6'],
  ['R6C5', 'R7C6', 'R8C7', 'R9C8'],
  ['R9C4', 'R8C4', 'R7C4', 'R6C4'],
  ['R5C4', 'R6C3', 'R7C2', 'R8C1'],
];

return [
  new Shape('9x9'),

  new Given('R5C1', 8),
  new Given('R5C2', 5),
  new Given('R5C3', 2),

  // Cells a king's move apart cannot repeat.
  new AntiKing(),

  ...ARROWS.map(cells => new Arrow(...cells)),
];
