// Title: Friendly Wheel
// Author: TopAutism
// Video: https://www.youtube.com/watch?v=sooMCahwxxM
// Source: https://app.crackingthecryptic.com/sudoku/g8qMpLDNTL

// Normal sudoku rules apply. A purple cell's digit must equal its row
// number, its column number, its box number, or its position within that
// box (a cell satisfying more than one still needs only one digit). Box and
// position numbers both use the scheme the rules give -- top row = 1/2/3,
// middle row = 4/5/6, bottom row = 7/8/9 -- applied respectively to the
// box's own row/col among the 3x3 grid of boxes, and to the cell's row/col
// within its own box. Encoded as a per-cell candidate restriction (a
// multi-value `Given`), computed below rather than hand-enumerated so the
// arithmetic can be checked against the rule text directly.

// Purple cells (fill #D23BE7), from `underlays` in the source payload.
const purpleCells = [
  'R1C4', 'R1C5', 'R1C6', 'R2C3', 'R2C7', 'R3C2', 'R3C3', 'R3C5', 'R3C7',
  'R3C8', 'R4C1', 'R4C4', 'R4C6', 'R4C9', 'R5C1', 'R5C3', 'R5C5', 'R5C7',
  'R5C9', 'R6C1', 'R6C4', 'R6C6', 'R6C9', 'R7C2', 'R7C3', 'R7C5', 'R7C7',
  'R7C8', 'R8C3', 'R8C7', 'R9C4', 'R9C5', 'R9C6',
];

const friendlyGivens = purpleCells.map(cellId => {
  const { row, col } = parseCellId(cellId);
  const box = 3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3) + 1;
  const position = 3 * ((row - 1) % 3) + ((col - 1) % 3) + 1;
  const allowed = [...new Set([row, col, box, position])];
  return new Given(cellId, ...allowed);
});

return [
  new Shape('9x9'),
  ...friendlyGivens,
];
