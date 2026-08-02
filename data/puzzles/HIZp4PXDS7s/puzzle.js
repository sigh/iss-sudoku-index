// Title: Gallimaufry
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=HIZp4PXDS7s
// Source: https://app.crackingthecryptic.com/sudoku/6rPQDFRNh8

// Normal Sudoku rules apply. The main diagonal has no repeated digit.
// Purple lines are renbans; orange lines are modular-3 lines. Grey-bulbed
// lines are thermometers. The two drawn cages have their displayed totals.
// The white and black dots respectively mark consecutive and 1:2-ratio pairs.
return [
  new Shape('9x9'),
  new Diagonal(-1),

  new Renban('R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'),
  new Renban('R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1'),

  new Modular(3, 'R2C5', 'R2C6', 'R1C7', 'R2C7', 'R2C8', 'R1C8', 'R2C9'),
  new Modular(3, 'R5C2', 'R6C2', 'R7C1', 'R7C2', 'R8C2', 'R8C1', 'R9C2'),

  // The grey circles are the bulbs, so each path is bulb-first.
  new Thermo('R6C9', 'R5C9', 'R5C8', 'R4C9', 'R3C8'),
  new Thermo('R8C3', 'R9C4', 'R8C5', 'R9C5', 'R9C6'),

  // Cell lists are transcribed from the two drawn cages.
  new Cage(28, 'R7C8', 'R7C9', 'R8C7', 'R8C9', 'R9C7', 'R9C8', 'R9C9'),
  new Cage(42, 'R4C5', 'R4C6', 'R5C4', 'R5C6', 'R6C4', 'R6C5', 'R6C6'),

  new WhiteDot('R7C5', 'R8C5'),
  new BlackDot('R5C7', 'R5C8'),
];
