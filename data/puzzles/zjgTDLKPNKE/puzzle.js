// Title: Pointing in Both Directions
// Author: Celery
// Video: https://www.youtube.com/watch?v=zjgTDLKPNKE
// Source: https://app.crackingthecryptic.com/sudoku/8hhm7r36N6

// Normal sudoku (default 9x9 boxes) plus:
//  - anti-knight: cells a knight's move apart cannot repeat a digit.
//  - three arrows: the bulb cell's digit equals the sum of its arm cells.
//  - two green (#A3E048) lines: adjacent cells on the line differ by >= 5.
// The payload also draws six dashed, totalled cages that the rules text above
// does not name. A drawn cage with a printed total is the standard killer-cage
// mark (SudokuPad's own cage semantics: value = total, no rule text needed to
// establish it), so they are encoded as ordinary Cage (sum + all-different).
return [
  new Shape('9x9'),

  new Given('R6C8', 1),

  new AntiKnight(),

  // Arrow bulb is the first cell; sum of the remaining (arm) cells must equal
  // the bulb's own digit.
  new Arrow('R4C5', 'R3C6'),
  new Arrow('R4C6', 'R3C7', 'R2C8'),
  new Arrow('R5C6', 'R4C7'),

  // Green lines (#A3E048), consecutive cells differ by >= 5.
  new Whisper(5, 'R6C4', 'R7C3'),
  new Whisper(5, 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4', 'R8C5'),

  // Cages: dashed outline, total in the top-left cell (see comment above).
  new Cage(6, 'R1C1', 'R2C1'),
  new Cage(24, 'R1C3', 'R1C4', 'R2C4', 'R2C3'),
  new Cage(3, 'R1C5', 'R2C5'),
  new Cage(11, 'R5C8', 'R5C9'),
  new Cage(22, 'R6C8', 'R6C9', 'R7C9', 'R7C8'),
  new Cage(6, 'R9C8', 'R9C9'),
];
