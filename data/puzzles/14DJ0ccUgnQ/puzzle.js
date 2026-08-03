// Title: Knight Arrows
// Author: Dr Sudoku
// Video: https://www.youtube.com/watch?v=14DJ0ccUgnQ
// Source: https://app.crackingthecryptic.com/sudoku/fQgpJfjPLB

// Normal sudoku rules apply. Digits along an arrow must sum to the number in
// the attached circle -- Arrow() takes the circle/bulb cell first, then the
// arm cells. Cells joined by a grey ratio dot must be in the ratio printed on
// the dot (2:1 or 3:1); BlackDot enforces the fixed 2:1 case, and the 3:1 dot
// uses a custom Pair since ISS has no built-in 3:1 dot class. Cells a
// (chess) knight's move apart may not contain the same digit (AntiKnight).
return [
  new Shape('9x9'),

  new Given('R1C7', 6),
  new Given('R3C1', 9),
  new Given('R5C5', 5),
  new Given('R7C9', 7),
  new Given('R9C3', 8),

  new AntiKnight(),

  new Arrow('R9C3', 'R9C4', 'R8C4', 'R7C4'),
  new Arrow('R7C9', 'R6C9', 'R6C8', 'R6C7'),
  new Arrow('R1C7', 'R1C6', 'R2C6', 'R3C6'),
  new Arrow('R3C1', 'R4C1', 'R4C2', 'R4C3'),
  new Arrow('R8C8', 'R9C9', 'R9C8'),
  new Arrow('R8C2', 'R9C1', 'R9C2'),

  // Grey dot labelled "3": R3C6 and R4C6 must be in a 3:1 ratio.
  new Pair(
    Pair.fnToKey((a, b) => a === b * 3 || b === a * 3, 9),
    'ratio-3', 'R3C6', 'R4C6'),
  // Grey dot labelled "2": R4C3 and R4C4 must be in a 2:1 ratio.
  new BlackDot('R4C3', 'R4C4'),
];
