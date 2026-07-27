// Title: Arrow Thermo
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=q0WwMPwwQ1g
// Source: https://sudokupad.app/i3cvr72ff5
//
// Rules: normal sudoku; four thermometers (bulb end low, increasing away from
// the bulb); four arrows (cells along the arrow sum to the circled cell); and
// anti-king (cells a king's move apart cannot repeat a digit).
//
// Thermo and arrow cell lists are transcribed from the drawn thermometer and
// arrow geometry (bulb/circle end first in each list).
return [
  new Shape('9x9'),

  new Given('R3C2', 1),
  new Given('R8C2', 6),

  new AntiKing(),

  new Thermo('R9C1', 'R8C1', 'R7C1', 'R6C1'),
  new Thermo('R9C5', 'R8C5', 'R7C5', 'R6C5'),
  new Thermo('R9C9', 'R8C9', 'R7C9', 'R6C9'),
  new Thermo('R5C9', 'R5C8', 'R5C7', 'R5C6'),

  new Arrow('R5C1', 'R5C2', 'R5C3', 'R5C4'),
  new Arrow('R1C1', 'R2C1', 'R3C1', 'R4C1'),
  new Arrow('R1C5', 'R2C5', 'R3C5', 'R4C5'),
  new Arrow('R1C9', 'R2C9', 'R3C9', 'R4C9'),
];
