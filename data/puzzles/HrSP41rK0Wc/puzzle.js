// Title: F-Puzzle
// Author: PulverizingPancake
// Video: https://www.youtube.com/watch?v=HrSP41rK0Wc
// Source: https://app.crackingthecryptic.com/sudoku/qrq2PJ7gGf

// Normal sudoku rules (default rows/cols/boxes). Killer cages: digits sum to
// the printed total and do not repeat within a cage. The marked diagonal
// (top-right to bottom-left) contains each digit 1-9 exactly once.
// Anti-knight: no repeat a knight's move apart.

// Cage cells and totals transcribed from the drawn `cages` array (payload
// also lists two cageless metadata stub entries, not encoded).
const cages = [
  [9, 'R2C1', 'R2C2'],
  [30, 'R1C4', 'R2C4', 'R2C5', 'R2C6', 'R1C6', 'R3C6', 'R2C7'],
  [30, 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R3C8'],
  [30, 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R4C5', 'R6C6'],
  [10, 'R4C6', 'R5C6'],
  [11, 'R6C2', 'R6C3'],
  [8, 'R8C1', 'R8C2'],
  [10, 'R8C3', 'R8C4'],
  [6, 'R9C4', 'R9C5'],
  [15, 'R7C8', 'R8C8', 'R8C7'],
  [10, 'R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  // Drawn line R1C9-R2C8-R3C7-R4C6-R5C5-R6C4-R7C3-R8C2-R9C1 is the
  // top-right-to-bottom-left diagonal, i.e. Diagonal(1).
  new Diagonal(1),
  new AntiKnight(),
];
