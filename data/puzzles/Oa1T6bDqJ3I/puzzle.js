// Title: The Flux Capacitor
// Author: John Ciolfi
// Video: https://www.youtube.com/watch?v=Oa1T6bDqJ3I
// Source: https://sudokupad.app/q7khd7z32d

const givens = [
  new Given('R2C5', 9),
  new Given('R2C7', 5),
  new Given('R3C4', 1),
  new Given('R3C6', 5),
];

// The first three thermometers are the arms of the Flux Capacitor and increase
// from their outer tips toward their shared center at R5C5.
const thermometers = [
  new Thermo('R2C2', 'R3C3', 'R4C4', 'R5C5'),
  new Thermo('R2C8', 'R3C7', 'R4C6', 'R5C5'),
  new Thermo('R9C5', 'R8C5', 'R7C5', 'R6C5', 'R5C5'),
  new Thermo('R6C6', 'R6C5', 'R6C4'),
  new Thermo('R4C2', 'R4C3'),
  new Thermo('R4C8', 'R4C7'),
  new Thermo('R5C2', 'R6C1', 'R7C1', 'R6C2'),
  new Thermo('R7C9', 'R6C8', 'R5C8', 'R6C9'),
];

const cages = [
  new Cage(8, 'R5C4', 'R6C4'),
  new Cage(8, 'R6C6', 'R7C6'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermometers,
  ...cages,
  new AntiKnight(),
];
