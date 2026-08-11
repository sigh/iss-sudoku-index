// Title: ThanX
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=x8_UdDF73uM
// Source: https://app.crackingthecryptic.com/sudoku/86667rD74D

// Standard 9x9 sudoku. Along thermometers, digits increase from the bulb
// end (Thermo's own semantics). Cage cells sum to the printed total; each
// cage below sits entirely inside one row or one column, so Sudoku's own
// row/column all-different already forbids a repeat within it -- Cage's
// built-in distinctness adds nothing beyond that. Cells joined by an X sum
// to 10; a white dot joins consecutive digits; a black dot joins digits in
// a 1:2 ratio. "Not all possible dots/Xs are given" forbids inferring a
// negative (unmarked pair) from the absence of a mark, so only the marked
// pairs below are encoded.
//
// Two of the puzzle's four grey circle/square markers sit exactly at the
// first cell of a thermometer line -- a manually-drawn thermo bulb (a
// circle paired with a line). The rules name the parity clue in the
// singular ("the cell with a grey circle" / "... grey square"), matching
// the two remaining standalone markers (R1C3 circle, R9C7 square) and not
// the two bulb circles. There is no Odd/Even class; parity is encoded as
// a multi-valued Given restricting the cell's candidates.

return [
  new Shape('9x9'),

  // Givens.
  new Given('R2C7', 8),
  new Given('R4C3', 9),

  // Parity clues: grey circle = odd, grey square = even.
  new Given('R1C3', 1, 3, 5, 7, 9),
  new Given('R9C7', 2, 4, 6, 8),

  // Thermometers, bulb cell first.
  new Thermo('R1C9', 'R1C8', 'R1C7'),
  new Thermo('R9C1', 'R9C2', 'R9C3'),

  // Cages, each confined to a single row or column.
  new Cage(20, 'R1C4', 'R1C5', 'R1C6'),
  new Cage(7, 'R4C5', 'R5C5', 'R6C5'),
  new Cage(20, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(20, 'R4C3', 'R5C3', 'R6C3'),
  new Cage(20, 'R4C7', 'R5C7', 'R6C7'),

  // X marks, sum to 10.
  new X('R2C1', 'R3C1'),
  new X('R2C2', 'R3C2'),
  new X('R6C4', 'R6C5'),
  new X('R4C5', 'R4C6'),
  new X('R7C8', 'R8C8'),
  new X('R7C9', 'R8C9'),

  // White dots, consecutive.
  new WhiteDot('R5C1', 'R6C1'),
  new WhiteDot('R7C1', 'R7C2'),
  new WhiteDot('R8C3', 'R9C3'),
  new WhiteDot('R8C5', 'R9C5'),
  new WhiteDot('R3C8', 'R3C9'),
  new WhiteDot('R4C8', 'R4C9'),

  // Black dot, 1:2 ratio.
  new BlackDot('R6C9', 'R7C9'),
];
