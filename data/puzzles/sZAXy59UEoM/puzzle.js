// Title: Besties
// Author: Jeet Sampat
// Video: https://www.youtube.com/watch?v=sZAXy59UEoM
// Source: https://app.crackingthecryptic.com/sudoku/GDrLhdGdgh

// Normal sudoku rules apply (rows, columns, boxes all-different -- ISS
// default; the drawn regions are exactly the default 3x3 box partition, so
// no Jigsaw is needed). Killer cages: digits in each cage sum to the
// labelled total and do not repeat within the cage. Adjacent digits on the
// green line must differ by at least 5 (Whisper's default difference).
// Cages below are transcribed from the drawn cage outlines and totals. The
// green line is drawn across three cells; a second stroke shares its
// colour and thickness but has no drawn path, so it renders nothing and is
// not a clue.

const cages = [
  [13, ['R1C2', 'R2C2']],
  [13, ['R1C4', 'R2C4', 'R2C3']],
  [7, ['R3C4', 'R4C4']],
  [13, ['R3C5', 'R4C5']],
  [7, ['R3C6', 'R4C6']],
  [7, ['R3C7', 'R4C7']],
  [13, ['R3C8', 'R4C8']],
  [7, ['R3C9', 'R4C9']],
  [13, ['R1C7', 'R2C7']],
  [13, ['R1C8', 'R2C8']],
  [7, ['R1C9', 'R2C9']],
  [7, ['R8C9', 'R9C9']],
  [13, ['R8C7', 'R8C6', 'R9C6']],
  [13, ['R6C6', 'R7C6']],
  [13, ['R6C5', 'R7C5']],
  [7, ['R6C4', 'R7C4']],
  [13, ['R6C3', 'R7C3']],
  [13, ['R6C2', 'R7C2']],
  [7, ['R6C1', 'R7C1']],
  [7, ['R8C1', 'R9C1']],
  [13, ['R8C2', 'R9C2']],
  [7, ['R8C3', 'R9C3']],
].map(([sum, cells]) => new Cage(sum, ...cells));

const greenLine = new Whisper(5, 'R9C4', 'R9C5', 'R9C6');

return [
  new Shape('9x9'),
  ...cages,
  greenLine,
];
