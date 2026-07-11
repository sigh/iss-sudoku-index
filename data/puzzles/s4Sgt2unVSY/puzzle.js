// Title: Figure 8
// Author: Antiknight
// Video: https://www.youtube.com/watch?v=s4Sgt2unVSY
// Source: https://sudokupad.app/93r6idydph

// Rules:
// Normal Sudoku rules apply.
// Digits must not repeat in cells that are a chess knight's move apart.
// The digits along each arrow must sum to the digit in the circled cell.
// Digits may repeat along an arrow if permitted by other rules.
// Digits do not repeat along gold Nabner lines. Additionally, no pair of
// digits anywhere on a Nabner line can be consecutive.
// Digits along each magenta line must be a set of consecutive digits in any
// order.

const arrows = [
  ['R5C5', 'R4C4', 'R3C3'],
  ['R5C5', 'R6C4', 'R7C3'],
  ['R5C5', 'R6C6', 'R7C7'],
  ['R5C5', 'R4C6', 'R3C7'],
];

const renbanLines = [
  ['R3C4', 'R4C5', 'R3C6'],
  ['R7C4', 'R6C5', 'R7C6'],
  ['R8C6', 'R9C6'],
  ['R8C9', 'R9C8'],
  ['R1C2', 'R2C1'],
];

// Nabner lines: closed loops through the 4 cells of a 2x2 block. All-different
// plus no two cells anywhere on the loop hold consecutive digits.
const nabnerLoops = [
  ['R3C9', 'R4C9', 'R4C8', 'R3C8'],
  ['R6C8', 'R7C8', 'R7C9', 'R6C9'],
  ['R6C1', 'R7C1', 'R7C2', 'R6C2'],
  ['R3C1', 'R4C1', 'R4C2', 'R3C2'],
];

const notConsecutive = PairX.fnToKey((a, b) => a !== b && Math.abs(a - b) !== 1, 9);

return [
  new AntiKnight(),
  ...arrows.map(cells => new Arrow(...cells)),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...nabnerLoops.map(cells => new PairX(notConsecutive, '', ...cells)),
];
