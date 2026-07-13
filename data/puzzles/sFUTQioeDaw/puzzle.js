// Title: Schubladen
// Author: Myxo
// Video: https://www.youtube.com/watch?v=sFUTQioeDaw
// Source: https://sudokupad.app/329yqbkq53

// Normal sudoku rules apply.
// Digits must not repeat along either of the main diagonals.
// Along a grey thermometer, digits increase from the bulb end.

return [
  new Shape('9x9'),

  new Given('R4C6', 5),
  new Given('R6C1', 2),
  new Given('R9C4', 8),

  // Both main diagonals, all-different.
  new Diagonal(1),
  new Diagonal(-1),

  // Six grey thermometers, bulb cell listed first.
  new Thermo('R8C1', 'R9C2', 'R8C3', 'R9C3'),
  new Thermo('R8C9', 'R7C9', 'R7C8', 'R6C8'),
  new Thermo('R7C6', 'R8C7', 'R9C8', 'R9C7'),
  new Thermo('R3C1', 'R2C1', 'R3C2', 'R4C3'),
  new Thermo('R3C4', 'R2C3', 'R1C2', 'R1C3'),
  new Thermo('R3C9', 'R3C8', 'R2C9', 'R1C8', 'R2C7', 'R1C7'),
];
