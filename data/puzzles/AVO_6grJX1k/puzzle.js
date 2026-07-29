// Title: Molino de huevos
// Author: Glum Hippo
// Video: https://www.youtube.com/watch?v=AVO_6grJX1k
// Source: https://sudokupad.app/pqttdq9MbQ

// Encodes normal Sudoku and the two printed givens.
// Omitted: the unknown snake/egg partition, its topology and region sizes,
// the green-line snake/egg and digit-difference rules, and the circle rules.
return [
  new Shape('9x9'),
  new Given('R4C9', 1),
  new Given('R9C4', 9),
];
