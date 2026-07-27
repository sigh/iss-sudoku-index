// Title: Fibo-Knight-i
// Author: CraftyRaf
// Video: https://www.youtube.com/watch?v=K8Jpnhr_tyQ
// Source: https://sudokupad.app/x42g360vvp

// Normal sudoku rules apply (standard rows/columns/boxes, the ISS default).
// Anti-knight: cells a chess knight's move apart cannot repeat a digit.
// Cage: digits in a cage sum to the cage total in the top left. The source
// ruleset names only this one "Cage" rule (no separate "killer cage" rule,
// no stated all-different), and applies it uniformly to the payload's `cage`
// and `killercage` entries alike -- so all three cages below are sum-only.
// Cages A and B (11 and 12 cells) could not be all-different anyway: with
// only 9 symbols that would be unsatisfiable by pigeonhole, confirming the
// sum-only reading. Cage C's 3 cells fall in a single column, so its digits
// are already forced distinct by the normal-sudoku column rule regardless.
// Odd/Even: a gray square cell is even, a gray circle cell is odd (encoded
// as multi-value Given -- ISS has no dedicated Odd/Even class).

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R2C4', 1),
  new Given('R2C6', 2),
  new Given('R2C8', 3),
  new Given('R3C2', 5),
  new Given('R4C4', 8),
  new Given('R5C6', 1),
  new Given('R5C7', 3),
  new Given('R6C2', 2),
  new Given('R6C3', 1),
  new Given('R7C5', 3),
  new Given('R7C6', 4),
  new Given('R9C7', 8),
  new Given('R9C8', 9),

  new AntiKnight(),

  // Even (gray square)
  new Given('R4C5', 2, 4, 6, 8),
  // Odd (gray circle)
  new Given('R8C8', 1, 3, 5, 7, 9),

  // Cage A: R2C3,R2C4,R2C5,R3C3,R4C3,R4C4,R4C5,R5C3,R6C3,R7C3,R8C3, total 55.
  new Sum(55,
    'R2C3', 'R2C4', 'R2C5',
    'R3C3',
    'R4C3', 'R4C4', 'R4C5',
    'R5C3',
    'R6C3',
    'R7C3',
    'R8C3'),

  // Cage B: R4C7,R5C7,R6C7,R7C7,R7C8,R7C9,R8C7,R8C8,R8C9,R9C7,R9C8,R9C9, total 55.
  new Sum(55,
    'R4C7',
    'R5C7',
    'R6C7',
    'R7C7', 'R7C8', 'R7C9',
    'R8C7', 'R8C8', 'R8C9',
    'R9C7', 'R9C8', 'R9C9'),

  // Cage C: R6C5,R7C5,R8C5, total 8.
  new Sum(8, 'R6C5', 'R7C5', 'R8C5'),
];
