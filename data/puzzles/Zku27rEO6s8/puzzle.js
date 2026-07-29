// Title: Postcodes
// Author: Maggie & BremSter
// Video: https://www.youtube.com/watch?v=Zku27rEO6s8
// Source: https://app.crackingthecryptic.com/czdmvpnot8

// Normal Sudoku rules apply. Each purple line is a consecutive, non-repeating set.
// The grey tab placement rule is omitted: the joined tab artwork does not identify
// a separate narrow-end direction for every visible digit label.
return [
  new Shape('9x9'),
  // Purple paths transcribed from the drawn line geometry.
  new Renban('R2C2', 'R3C2', 'R4C2', 'R4C3', 'R3C3', 'R3C4'),
  new Renban('R7C2', 'R6C2', 'R5C2', 'R5C3', 'R6C3', 'R6C4'),
  new Renban('R3C8', 'R4C8', 'R5C8', 'R5C7', 'R4C7', 'R4C6'),
  new Renban('R8C8', 'R7C8', 'R6C8', 'R6C7', 'R7C7', 'R7C6'),
  new Renban('R1C4', 'R1C5', 'R2C5', 'R2C6', 'R2C7', 'R1C7'),
  new Renban('R9C3', 'R8C3', 'R8C4', 'R8C5', 'R9C5', 'R9C6'),
];
