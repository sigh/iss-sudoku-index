// Title: Read Between the Lines
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=a6JtlKc9cvM
// Source: https://app.crackingthecryptic.com/sudoku/23rLgH2f6b

// Normal sudoku rules apply (standard 3x3 boxes, from the grid's regions).
// Green lines: Whisper(5), adjacent cells on the line differ by >= 5.
// Purple lines: Renban, the line's cells are a consecutive set in any order.
// Black dots: cells are in the ratio 1:4 -- no built-in class has this ratio
// (BlackDot is fixed at 2:1), so each dot is a Pair with a custom predicate.

// Green lines (colour #A3E048), read from lines[] wayPoints. Each hexagon is
// drawn as two stroke entries sharing both endpoints; together the 8 entries
// below cover every edge of each hexagon exactly once, so no extra
// wrap-around edge is needed.
const whispers = [
  ['R4C4', 'R5C3', 'R6C2', 'R7C3'],
  ['R4C4', 'R5C5', 'R6C4', 'R7C3'],
  ['R3C1', 'R4C2', 'R3C3', 'R2C4', 'R1C3'],
  ['R1C3', 'R2C2', 'R3C1'],
  ['R3C5', 'R2C6', 'R3C7', 'R4C8', 'R5C7'],
  ['R3C5', 'R4C6', 'R5C7'],
  ['R8C5', 'R7C6', 'R6C7', 'R7C8'],
  ['R7C8', 'R8C7', 'R9C6', 'R8C5'],
].map(cells => new Whisper(5, ...cells));

// Purple lines (colour #D23BE7), read from lines[] wayPoints.
const renbans = [
  ['R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
].map(cells => new Renban(...cells));

// Black dots (edge overlays labelled "4"), read from overlays[] centers.
// Predicate: one cell is exactly 4x the other. Within 1-9 this only ever
// admits {1,4} or {2,8}.
const ratioKey = Pair.fnToKey((a, b) => a === b * 4 || b === a * 4, 9);
const ratioDots = [
  ['R9C3', 'R9C4'],
  ['R6C4', 'R7C4'],
  ['R5C3', 'R5C4'],
  ['R3C2', 'R4C2'],
  ['R2C8', 'R2C9'],
].map(cells => new Pair(ratioKey, '', ...cells));

return [
  new Shape('9x9'),
  ...whispers,
  ...renbans,
  ...ratioDots,
];
