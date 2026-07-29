// Title: Simoku
// Author: Catmandoku
// Video: https://www.youtube.com/watch?v=RGcTzUMKxyA
// Source: https://app.crackingthecryptic.com/rd6t0wcabb

// Normal Sudoku applies. Orange/green lines are minimum-difference lines;
// the pink closed line is a Renban; the peach line alternates low 1-4 with
// high 6-9. Cages sum without repeated digits, the grey line is a thermometer,
// and the square/circle parity marks restrict their cells.
const peachAlternation = Pair.fnToKey(
  (a, b) => (a <= 4 && b >= 6) || (a >= 6 && b <= 4), 9);

// Drawn cage cells and totals.
const cages = [
  new Cage(9, 'R5C7', 'R5C8', 'R5C9'),
  new Cage(12, 'R5C1', 'R5C2', 'R5C3'),
  new Cage(15, 'R1C5', 'R2C5', 'R3C5'),
  new Cage(12, 'R7C5', 'R8C5', 'R9C5'),
  new Cage(8, 'R4C5', 'R4C6'),
  new Cage(10, 'R8C2', 'R8C3'),
  new Cage(5, 'R2C7', 'R2C8'),
  new Cage(8, 'R6C4', 'R6C5'),
];

// The peach predicate accepts exactly one low digit (1-4) and one high digit
// (6-9), so 5 cannot appear on that line.
return [
  new Shape('9x9'),
  new Given('R2C2', 5),
  new Given('R9C9', 3),
  ...cages,
  new Whisper(4, 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R2C2', 'R2C3', 'R3C3', 'R3C2', 'R3C1'),
  new Whisper(5, 'R6C4', 'R5C4', 'R4C4', 'R5C5', 'R4C6', 'R5C6', 'R6C6'),
  new Renban('R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1'),
  new Pair(peachAlternation, 'peach low/high alternation', 'R9C7', 'R8C7', 'R7C7', 'R8C8', 'R9C9', 'R8C9', 'R7C9'),
  new Thermo('R1C8', 'R2C8', 'R3C8'),
  new Given('R5C1', 2, 4, 6, 8),
  new Given('R5C8', 2, 4, 6, 8),
  new Given('R2C4', 1, 3, 5, 7, 9),
];
