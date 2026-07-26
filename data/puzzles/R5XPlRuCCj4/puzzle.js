// Title: The Phantom Locker
// Author: Sumanta (Anu)
// Video: https://www.youtube.com/watch?v=R5XPlRuCCj4
// Source: https://sudokupad.app/2a8ncwsjcb

// Normal sudoku rules apply. Anti-knight: cells a chess knight's move apart
// cannot repeat a digit. Killer cages: digits in a cage don't repeat and sum
// to the corner total. Grey line is a Palindrome: digits read the same from
// either end.

return [
  new Shape('9x9'),

  new Given('R1C8', 6),
  new Given('R2C7', 7),
  new Given('R7C9', 4),
  new Given('R8C8', 8),
  new Given('R9C7', 1),

  new AntiKnight(),

  // Killer cages, cells and totals from the payload's `killercage` array.
  new Cage(19, 'R1C3', 'R2C3', 'R3C3'),
  new Cage(12, 'R4C3', 'R4C4', 'R5C3'),
  new Cage(6, 'R4C5', 'R4C6'),
  new Cage(26, 'R6C1', 'R6C2', 'R7C1', 'R7C2'),
  new Cage(7, 'R9C1', 'R9C2'),

  // Grey palindrome line, cells from the payload's `palindrome` entry.
  new Palindrome('R5C4', 'R5C5', 'R5C6', 'R6C7', 'R6C8', 'R6C9'),
];
