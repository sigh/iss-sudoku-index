// Title: Tie Those Thermos!
// Author: Sayori
// Video: https://www.youtube.com/watch?v=ONcbJwNdw9A
// Source: https://app.crackingthecryptic.com/sudoku/NRqj3LMrLr

// Normal 9x9 Sudoku. Grey thermos increase from their circular bulbs.
// Purple lines are renban lines: each holds consecutive non-repeating digits.
// Coordinates come from the drawn grey thermos and purple lines in the source payload.
return [
  new Shape('9x9'),
  new Thermo('R4C1', 'R4C2', 'R4C3', 'R3C4', 'R3C5'),
  new Thermo('R1C6', 'R1C5', 'R1C4', 'R2C3', 'R2C2'),
  new Thermo('R1C8', 'R2C9'),
  new Thermo('R3C9', 'R3C8', 'R3C7', 'R4C6', 'R4C5'),
  new Thermo('R5C3', 'R5C4'),
  new Thermo('R3C3', 'R4C3'),
  new Thermo('R7C6', 'R6C7'),
  new Thermo('R6C9', 'R7C9', 'R8C9'),
  new Thermo('R6C4', 'R7C3', 'R7C2', 'R8C1'),
  new Thermo('R7C4', 'R8C3', 'R8C2'),
  new Renban('R3C1', 'R3C2', 'R3C3', 'R2C4', 'R2C5', 'R2C6'),
  new Renban('R4C4', 'R5C3', 'R5C2', 'R5C1'),
  new Renban('R6C8', 'R6C9'),
];
