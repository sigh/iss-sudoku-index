// Title: Arrow Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=c_NjEbFEeW0
// Source: https://app.crackingthecryptic.com/sudoku/Bg6rfFNt9G

// Normal sudoku rules (default 9x9 rows/cols/boxes). Digits along each arrow
// sum to the number shown in its bulb: a single circle for a 1-digit sum, a
// two-cell rounded pill for a 2-digit sum read left-to-right (tens cell
// first). Bulb/pill cells are excluded from the arm per the source geometry.

const givens = [
  ['R1C6', 7], ['R2C1', 3], ['R2C9', 5], ['R3C6', 3], ['R6C1', 1],
  ['R6C9', 3], ['R7C4', 3], ['R8C1', 5], ['R8C9', 1], ['R9C4', 7],
].map(([cell, digit]) => new Given(cell, digit));

// Single-circle arrows: bulb cell first, then arm cells (Arrow's own order).
const singleArrows = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R4C1', 'R5C1', 'R6C1'],
  ['R8C2', 'R7C2', 'R7C1'],
  ['R9C6', 'R9C5', 'R9C4'],
  ['R2C8', 'R3C8', 'R3C9'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R9C9', 'R9C8', 'R9C7'],
  ['R4C5', 'R5C5', 'R6C5'],
].map(cells => new Arrow(...cells));

// Two-cell pill arrows: PillArrow(2, tensCell, onesCell, ...armCells).
const pillArrows = [
  { pill: ['R2C2', 'R2C3'], arm: ['R3C3', 'R3C2', 'R4C2', 'R4C3'] },
  { pill: ['R8C7', 'R8C8'], arm: ['R7C8', 'R7C7', 'R6C7', 'R6C8'] },
].map(({ pill, arm }) => new PillArrow(2, ...pill, ...arm));

return [
  new Shape('9x9'),
  ...givens,
  ...singleArrows,
  ...pillArrows,
];
