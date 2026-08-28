// Title: Snooker Sudoku
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=mrALcjhTczs
// Source: https://cracking-the-cryptic.web.app/sudoku/n2pR3jQB63
//
// Normal sudoku (default rows/cols/boxes). Cells a king's move apart cannot
// repeat a digit (AntiKing matches this rule's wording exactly). The 20
// grey-shaded cells can only hold odd digits, encoded as a multi-value
// Given restricting each to {1,3,5,7,9} (grey cells: R3C2, R3C4, R3C6-C8,
// R4C1-C2, R4C4, R4C8, R5C2, R5C4-C6, R5C8, R6C2, R6C5, R6C8, R7C2, R7C5,
// R7C8 -- from the raw payload's underlays).

const oddCells = [
  'R3C2', 'R3C4', 'R3C6', 'R3C7', 'R3C8',
  'R4C1', 'R4C2', 'R4C4', 'R4C8',
  'R5C2', 'R5C4', 'R5C5', 'R5C6', 'R5C8',
  'R6C2', 'R6C5', 'R6C8',
  'R7C2', 'R7C5', 'R7C8',
];

const oddGivens = oddCells.map(c => new Given(c, 1, 3, 5, 7, 9));

return [
  new Shape('9x9'),

  new Given('R1C5', 1),
  new Given('R1C9', 4),
  new Given('R2C9', 5),
  new Given('R6C3', 1),
  new Given('R6C9', 8),
  new Given('R7C9', 7),
  new Given('R8C1', 5),
  new Given('R8C3', 3),
  new Given('R8C8', 6),
  new Given('R9C5', 3),

  new AntiKing(),

  ...oddGivens,
];
