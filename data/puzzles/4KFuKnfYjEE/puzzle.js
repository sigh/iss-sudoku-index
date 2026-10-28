// Title: Arrow Times Thermo
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=4KFuKnfYjEE
// Source: https://sudokupad.app/urt5xlp81q

// Normal Sudoku, anti-king, increasing thermometers, and arrow sums.
// Grey bulb-and-shaft paths transcribed from the drawing, bulb first.
const thermometers = [
  ['R1C3', 'R1C2', 'R1C1'],
  ['R1C3', 'R2C3', 'R3C3'],
  ['R3C9', 'R3C8', 'R3C7'],
  ['R3C9', 'R2C9', 'R1C9'],
  ['R9C7', 'R8C7', 'R7C7'],
  ['R9C7', 'R9C8', 'R9C9'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R7C1', 'R7C2', 'R7C3'],
  ['R6C4', 'R5C5', 'R4C6'],
];
// White circles and their arrow shafts transcribed from the drawing, circle first.
const arrows = [
  ['R3C1', 'R2C1', 'R1C1'],
  ['R3C1', 'R3C2', 'R3C3'],
  ['R1C7', 'R2C7', 'R3C7'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R6C6', 'R5C5', 'R4C4'],
  ['R9C3', 'R8C3', 'R7C3'],
  ['R9C3', 'R9C2', 'R9C1'],
  ['R7C9', 'R7C8', 'R7C7'],
  ['R7C9', 'R8C9', 'R9C9'],
];
return [
  new Shape("9x9"),
  // Printed givens.
  new Given("R5C9", 1),
  new Given("R7C7", 6),
  new AntiKing(),
  ...thermometers.map(cells => new Thermo(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
];
