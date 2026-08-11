// Title: Flyghtning Lamp
// Author: Olima
// Video: https://www.youtube.com/watch?v=VbM_SO2eEi4
// Source: https://app.crackingthecryptic.com/sudoku/r2TmnnnmGR

// Standard 9x9 sudoku (rows, columns, 3x3 boxes all-different, from Shape).
// No givens.
//
// Rules encoded:
// - Digits cannot repeat along the marked diagonals: both the full
//   anti-diagonal and the full main diagonal are marked -> two Diagonal
//   constraints.
// - Thermometer: bulb R5C5, increasing to R4C4 -> Thermo.
// - Green lines: neighbouring digits differ by at least 5 -> Whisper(5) per
//   line, cells listed in the drawn path order (two segments of the 11-cell
//   line are diagonal (king-move) steps on the grid; Whisper only cares about
//   path order, not grid adjacency).
// - Purple lines: digits form a consecutive run, any order -> Renban per
//   line.
// - Black dot on the edge R7C5/R7C6: ratio 1:2 -> BlackDot. This dot joins
//   the endpoints of two different purple lines, not a within-line relation.
//   "Not all dots are given" licenses omitting a negative constraint on all
//   other adjacent pairs; only this drawn dot is encoded.

return [
  new Shape('9x9'),

  new Diagonal(1),   // anti-diagonal: R1C9..R9C1
  new Diagonal(-1),  // main diagonal: R1C1..R9C9

  new Thermo('R5C5', 'R4C4'),

  new Whisper(5, 'R1C1', 'R2C2', 'R3C3'),
  new Whisper(5, 'R7C7', 'R8C8', 'R9C9'),
  new Whisper(5, 'R3C4', 'R4C3'),
  new Whisper(5, 'R3C5', 'R4C4', 'R5C3'),
  new Whisper(5, 'R3C7', 'R3C6', 'R4C6', 'R4C5', 'R5C6', 'R6C6', 'R6C5', 'R5C4', 'R6C4', 'R6C3', 'R7C3'),

  new Renban('R7C4', 'R7C5'),
  new Renban('R7C6', 'R7C7', 'R6C7'),
  new Renban('R4C7', 'R5C7'),

  new BlackDot('R7C5', 'R7C6'),
];
