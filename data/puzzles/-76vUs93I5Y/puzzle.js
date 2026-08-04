// Title: The Devil's Cage
// Author: TinkerTroy
// Video: https://www.youtube.com/watch?v=-76vUs93I5Y
// Source: https://app.crackingthecryptic.com/sudoku/m6hH43dbjr

// Normal sudoku rules (default rows/cols/boxes). Eight killer cages (distinct
// + sum) form a picture-frame ring one cell in from the border. Two arrows
// (bulb cell = sum of its arm cells) share their bulb with a cage corner.
// Anti-knight: no repeat a knight's move apart.

// Cage cells and totals transcribed from the drawn `cages` array (each is a
// straight run of 5 cells along one row or column).
const cages = [
  [34, 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  [33, 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'],
  [31, 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7'],
  [31, 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  [34, 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  [32, 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2'],
  [31, 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8'],
  [32, 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
];

// Arrow bulb (first cell) and arm cells, from the drawn arrow paths and their
// circle overlays: each arrow starts at its circled cell (R8C3 / R8C7) and
// runs through two arm cells to the arrowhead.
const arrows = [
  ['R8C3', 'R8C2', 'R9C1'],
  ['R8C7', 'R8C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  new AntiKnight(),
];
