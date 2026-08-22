// Title: 77
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=F0HXX_Yb26Y
// Source: https://app.crackingthecryptic.com/sudoku/GJ824F3qq4

// Normal sudoku rules apply (default row/col/box all-different, standard
// 3x3 boxes). Digits in green cells sum to 77 -- Sum, not Cage: the rules
// state only a total, not that the nine cells are mutually distinct.
// Adjacent digits on a grey line differ by at least 4 -- Whisper(4). Each
// grey line is drawn as a closed loop that returns to its own start, so its
// cell list repeats the first cell at the end to also cover the wrap-around
// edge, per the closed-loop convention for sequential-pair constraints.

const greenCells = [
  'R1C3', 'R2C1', 'R1C8', 'R3C9', 'R5C5', 'R7C1', 'R9C2', 'R9C7', 'R8C9',
]; // the nine green (yellow-green) 1x1 highlighted cells

const lineA = [
  'R2C6', 'R2C5', 'R2C4', 'R2C3', 'R2C2', 'R3C2', 'R3C3', 'R3C4', 'R3C5',
  'R4C4', 'R5C3', 'R6C2', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C6',
]; // grey line A, drawn cell walk

const lineB = [
  'R3C8', 'R4C7', 'R5C6', 'R6C5', 'R7C4', 'R8C4', 'R8C5', 'R8C6', 'R8C7',
  'R8C8', 'R7C8', 'R7C7', 'R7C6', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C8',
]; // grey line B, drawn cell walk

return [
  new Shape('9x9'),

  new Given('R3C6', 5),
  new Given('R7C8', 1),

  new Sum(77, ...greenCells),

  new Whisper(4, ...lineA),
  new Whisper(4, ...lineB),
];
