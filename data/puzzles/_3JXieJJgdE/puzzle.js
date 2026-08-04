// Title: First day at the gym
// Author: Adem Jaziri
// Video: https://www.youtube.com/watch?v=_3JXieJJgdE
// Source: https://app.crackingthecryptic.com/sudoku/bbRJNPMh6h

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Purple lines are
// Renban: a set of non-repeating consecutive digits, in any order. Arrows
// sum their shaft cells to the digit in the circled cell. Anti-knight: cells
// a chess knight's move apart cannot repeat a digit.

// Purple lines (drawn cell paths).
const renbanLines = [
  ['R6C4', 'R5C3', 'R4C4', 'R3C5', 'R2C6', 'R3C7'],
  ['R7C7', 'R6C6', 'R5C7', 'R6C8'],
  ['R6C5', 'R7C6'],
];

// Arrows (drawn cell paths); first cell of each is the circle.
const arrows = [
  ['R3C4', 'R4C5', 'R5C6', 'R6C7'],
  ['R4C3', 'R3C2'],
  ['R4C9', 'R3C8', 'R4C7', 'R5C8'],
  ['R1C4', 'R2C4', 'R2C5'],
  ['R1C3', 'R1C2', 'R1C1'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
];
