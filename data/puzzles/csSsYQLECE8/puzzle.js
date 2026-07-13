// Title: Was It A Cat I Saw?
// Author: Mile Lemaic
// Video: https://www.youtube.com/watch?v=csSsYQLECE8
// Source: https://sudokupad.app/vnc80d8n88

// Antiknight: cells a knight's move apart cannot repeat.
// Grey line (R3C5-R2C5-R1C6-R2C6-R3C7-R3C8-R4C7-R5C6-R6C5-R7C4-R7C3-R7C2-R8C2-R8C1)
// is a palindrome.
// Two outside corner clues give diagonal sums: 25 for the main diagonal
// (top-left to bottom-right), 44 for the anti-diagonal (top-right to
// bottom-left). LittleKiller takes the on-grid corner where its diagonal
// starts, not the drawn off-grid position.
return [
  new Shape('9x9'),
  new AntiKnight(),
  new Palindrome(
    'R3C5', 'R2C5', 'R1C6', 'R2C6', 'R3C7', 'R3C8', 'R4C7', 'R5C6',
    'R6C5', 'R7C4', 'R7C3', 'R7C2', 'R8C2', 'R8C1'
  ),
  LittleKiller.fromCells(25, cellGraph('9x9').ray('R1C1', 1, 1), cellGeometry('9x9')),
  LittleKiller.fromCells(44, cellGraph('9x9').ray('R1C9', 1, -1), cellGeometry('9x9')),
];
