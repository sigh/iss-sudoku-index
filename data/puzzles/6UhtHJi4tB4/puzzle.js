// Title: Rodeo
// Author: Flash Groudon
// Video: https://www.youtube.com/watch?v=6UhtHJi4tB4
// Source: https://app.crackingthecryptic.com/9jdtqgDPTP

// Standard 6x6 Sudoku uses 3x2 boxes. Knight-separated cells differ. The
// orange circle at R1C2 is odd; the blue square at R1C3 is even. Thermometers
// increase from their circular bulbs, and the arrow's arm sums to its circle.
const parityClues = [
  new Given('R1C2', 1, 3, 5),
  new Given('R1C3', 2, 4, 6),
];

// The drawn thermometer paths are bulb-first.
const thermometers = [
  new Thermo('R2C3', 'R2C4', 'R2C5'),
  new Thermo('R6C4', 'R6C5', 'R6C6'),
];

return [
  new Shape('6x6'),
  ...parityClues,
  ...thermometers,
  new Arrow('R1C4', 'R1C3', 'R1C2'),
  new AntiKnight(),
];
