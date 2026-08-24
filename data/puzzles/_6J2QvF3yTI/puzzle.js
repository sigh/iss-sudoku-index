// Title: For Your Big Heart With Lots of Room
// Author: Arun Iyer
// Video: https://www.youtube.com/watch?v=_6J2QvF3yTI
// Source: https://app.crackingthecryptic.com/sudoku/ftqpGp2HJ8
//
// Normal sudoku rules apply. A white dot between two cells means those
// cells hold consecutive digits; a black dot means one cell's digit is
// double the other's. "Not all white and black dots are given" -- only the
// drawn dots apply, so this omits any negative/exhaustive Kropki closure
// over undotted pairs. In cages, digits sum to the printed top-left total,
// if given, and never repeat within a cage; several cages have 9 cells and
// no total, so (being all-different over all 9 grid digits) they act as
// extra regions -- encoded here as AllDifferent, matching a no-total killer
// cage's own semantics (distinct digits, no total to enforce).

const cageWithTotal = new Cage(14, 'R1C2', 'R1C1', 'R2C1');

// No-total cages: distinct-only. Cell lists are the puzzle's own drawn
// cage geometry, converted from its 0-indexed [row, col] pairs.
const noTotalCages = [
  ['R1C8', 'R1C9', 'R2C9'],
  ['R6C1', 'R7C1', 'R7C2', 'R8C1', 'R9C1', 'R9C2'],
  ['R6C9', 'R7C9', 'R7C8', 'R8C9', 'R9C9', 'R9C8'],
  ['R1C3', 'R2C3', 'R1C4', 'R2C4', 'R2C5', 'R1C6', 'R2C6', 'R1C7', 'R2C7'],
  ['R2C8', 'R3C8', 'R3C7', 'R3C9', 'R4C9', 'R4C8', 'R5C8', 'R5C9', 'R6C8'],
  ['R4C7', 'R5C7', 'R6C7', 'R7C7', 'R6C6', 'R7C6', 'R8C6', 'R6C5', 'R7C5'],
  ['R3C6', 'R3C5', 'R3C4', 'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R5C5', 'R5C4'],
  ['R4C3', 'R5C3', 'R6C3', 'R7C3', 'R6C4', 'R7C4', 'R8C4', 'R8C5', 'R9C5'],
  ['R3C3', 'R3C2', 'R2C2', 'R3C1', 'R4C1', 'R4C2', 'R5C1', 'R5C2', 'R6C2'],
].map(cells => new AllDifferent(...cells));

// Black (ratio 1:2) dot edges. Coordinates come from the puzzle's drawn
// black-filled edge markers, converted from pixel-space [row, col]
// centres to the cell pair each edge separates.
const blackDots = [
  ['R8C3', 'R9C3'],
  ['R7C3', 'R8C3'],
].map(cells => new BlackDot(...cells));

// White (consecutive) dot edges. Same source, white-filled markers.
const whiteDots = [
  ['R5C2', 'R5C3'],
  ['R5C3', 'R5C4'],
  ['R5C5', 'R6C5'],
  ['R8C4', 'R8C5'],
  ['R7C6', 'R8C6'],
  ['R7C7', 'R8C7'],
  ['R8C7', 'R9C7'],
  ['R7C8', 'R8C8'],
  ['R8C8', 'R9C8'],
  ['R7C8', 'R7C9'],
].map(cells => new WhiteDot(...cells));

return [
  new Shape('9x9'),
  cageWithTotal,
  ...noTotalCages,
  ...blackDots,
  ...whiteDots,
];
