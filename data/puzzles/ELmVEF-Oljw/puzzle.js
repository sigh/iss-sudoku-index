// Title: You're Going Places
// Author: Jeet Sampat
// Video: https://www.youtube.com/watch?v=ELmVEF-Oljw
// Source: https://app.crackingthecryptic.com/sudoku/6t4pFDGtBq

// Normal sudoku rules apply (default row/column/box all-different from Shape).
// Cells a knight's move apart must differ (AntiKnight). On thermometers,
// digits strictly increase from the bulb (Thermo).
//
// One thermometer branches: three drawn lines share bulb R9C1 and the prefix
// R9C1-R8C2-R7C3, then split at R7C3 into three arms. Each drawn line is
// already the full bulb-to-tip path for one arm, so it is encoded as three
// separate Thermo constraints (one per drawn segment), consistent on their
// shared prefix.

const thermos = [
  // Five ordinary thermometers, transcribed from lines[3..7].
  ['R1C1', 'R2C1', 'R3C1', 'R4C2', 'R4C3'],
  ['R7C6', 'R8C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R1C4', 'R2C4'],
  ['R1C9', 'R2C9'],
  ['R2C7', 'R1C7'],
  // Branching thermometer at bulb R9C1: three full bulb-to-tip arms, from
  // lines[0..2].
  ['R9C1', 'R8C2', 'R7C3', 'R6C2', 'R5C1'],
  ['R9C1', 'R8C2', 'R7C3', 'R8C4', 'R9C5'],
  ['R9C1', 'R8C2', 'R7C3', 'R6C4'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...thermos.map((cells) => new Thermo(...cells)),
];
