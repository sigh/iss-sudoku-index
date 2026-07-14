// Title: Sabatoge
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=FEazwvvoy7E
// Source: https://sudokupad.app/81upsnpdbs

// Standard 6x6 sudoku: rows, columns, and the default 2x3 boxes.
//
// Purple lines: "digits on a purple line must be consecutive" is Renban's
// exact semantics (consecutive set, any order, non-repeating). Renban has
// no adjacency requirement, unlike WhiteDot -- needed because one purple
// line (R2C1-R3C2) is drawn diagonally, not orthogonally.
//
// Turquoise lines: "any set of three digits along the line has one from
// each of (1,4), (2,5), (3,6)" is exactly Modular(3, ...)'s semantics on a
// 1-6 grid (every window of 3 consecutive cells holds one digit from each
// residue class mod 3: {3,6}->0, {1,4}->1, {2,5}->2). Only the 4-cell path
// is long enough to contain a 3-cell window; the 2-cell line is too short
// for this clause to bite. The path's two endpoints (R2C3, R2C4) are
// orthogonally adjacent, but the drawn line is a single open four-cell
// path (start R2C3, end R2C4), not a closed loop back to its start.
//
// Every one of the five numbered rules is prefixed by the same global
// clause: cells belonging to separate instances of that rule's constraint
// type may not repeat a digit anywhere in the puzzle (only within-instance
// repeats are barred by the instance's own rule, e.g. Renban/Modular
// above). So each type gets one extra AllDifferent over the union of all
// its cells across every instance of that type. Black dot has only one
// instance, so its cross-instance clause is vacuous and adds nothing.

const purpleLines = [
  ['R5C1', 'R5C2'],
  ['R5C5', 'R5C6'],
  ['R2C1', 'R3C2'],
];
const turquoiseLines = [
  ['R5C3', 'R5C4'],
  ['R2C3', 'R1C3', 'R1C4', 'R2C4'],
];

const vPairs = [
  ['R2C5', 'R2C6'],
  ['R6C4', 'R6C5'],
];
const blackDots = [
  ['R3C3', 'R3C4'],
];
const evenCells = ['R4C1', 'R3C6'];

return [
  new Shape('6x6'),

  ...purpleLines.map(cells => new Renban(...cells)),
  new AllDifferent(...purpleLines.flat()),

  ...turquoiseLines.map(cells => new Modular(3, ...cells)),
  new AllDifferent(...turquoiseLines.flat()),

  ...vPairs.map(cells => new V(...cells)),
  new AllDifferent(...vPairs.flat()),

  ...blackDots.map(cells => new BlackDot(...cells)),

  ...evenCells.map(cell => new Given(cell, 2, 4, 6)),
  new AllDifferent(...evenCells),
];
