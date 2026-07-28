// Title: Snooker
// Author: Wichu
// Video: https://www.youtube.com/watch?v=D_4NNTcXBA4
// Source: https://sudokupad.app/qdL72NjhM7

// Normal Sudoku rules apply. Orange cells form an extra 1-9 region; knight-move
// cells differ. Cages sum to their labels, thermometers increase from their
// circled bulbs, and each arrow's arms sum to its circled cell.
const orangeRegion = [
  'R1C1', 'R1C9', 'R5C1', 'R5C4', 'R5C5', 'R5C6', 'R5C9', 'R9C1', 'R9C9',
];

// Drawn cage totals, in the source's separate cage entries.
const cages = [
  new Cage(7, 'R1C9', 'R2C9'),
  new Cage(3, 'R3C6', 'R3C7'),
  new Cage(4, 'R8C1', 'R8C2'),
  new Cage(8, 'R9C4', 'R9C5'),
  new Cage(6, 'R6C2', 'R6C3'),
  new Cage(5, 'R1C2', 'R1C3'),
];

// The grey circles identify the bulbs; duplicate grey strokes are visual layers.
const thermometers = [
  new Thermo('R1C1', 'R2C2'),
  new Thermo('R1C9', 'R2C8'),
  new Thermo('R9C1', 'R8C2'),
];

// The two circled arrow bulbs and their drawn arms.
const arrows = [
  new Arrow('R1C1', 'R1C2', 'R2C3'),
  new Arrow('R9C9', 'R8C8', 'R7C8'),
];

return [
  new Shape('9x9'),
  new Given('R5C4', 1), new Given('R5C5', 4), new Given('R5C6', 7),
  new AllDifferent(...orangeRegion),
  new AntiKnight(),
  ...cages,
  ...thermometers,
  ...arrows,
];
