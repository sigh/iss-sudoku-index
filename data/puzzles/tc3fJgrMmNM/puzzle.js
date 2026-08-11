// Title: Time To Think Outside The Box
// Author: ZegreS and JeremyDover
// Video: https://www.youtube.com/watch?v=tc3fJgrMmNM
// Source: https://app.crackingthecryptic.com/sudoku/rbjfJb33rn

// Normal Sudoku rules apply (standard rows/cols/3x3 boxes, no givens). Eight
// of the nine boxes carry a coloured line: gold ("entropic") lines require
// every three sequentially adjacent cells to hold one low (1-3), one mid
// (4-6) and one high (7-9) digit; purple ("renban") lines require their
// cells to hold a non-repeating set of consecutive digits in any order.
// White dots between orthogonally adjacent cells mark consecutive digits;
// black dots mark a 1:2 ratio. The rules state "not all dots are given", so
// unmarked adjacent pairs carry no constraint.
//
// Box 5's line cells are drawn only in the "box 5 revealed" companion source
// named in the video description (https://app.crackingthecryptic.com/sudoku/
// H4mRDP3J26); the primary source above never draws them. The companion
// still leaves the line's colour a neutral placeholder and its own rules
// text still reads "Solvers must determine the type of line in box 5
// (renban or entropic)", so the type is not decodable from either source.
// Per that stated ambiguity, box 5's cells are constrained to be entropic OR
// renban (never neither) rather than picking one reading or omitting the
// line outright.

// Entropic (gold, #EB7532) line cell paths, one per drawn stroke.
const entropicLines = [
  ['R1C3', 'R2C3', 'R3C3'],                                         // box 1
  ['R7C3', 'R8C3', 'R9C3'],                                         // box 7
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8', 'R3C7'],         // box 3
  ['R7C7', 'R7C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'],         // box 9
];

// Renban (purple, #D23BE7) line cell paths. Boxes 6 and 8 are drawn as
// closed loops (their wayPoints repeat the first cell); Renban is a
// set-based constraint so the repeated wrap-around cell is dropped.
const renbanLines = [
  ['R4C1', 'R4C2', 'R4C3', 'R5C3', 'R6C3'],                         // box 4
  ['R1C6', 'R1C5', 'R1C4', 'R2C4', 'R3C4', 'R3C5', 'R3C6'],         // box 2
  ['R4C9', 'R4C8', 'R4C7', 'R5C7', 'R6C7', 'R6C8', 'R6C9', 'R5C9'], // box 6, closed
  ['R7C6', 'R7C5', 'R7C4', 'R8C4', 'R9C4', 'R9C5', 'R9C6', 'R8C6'], // box 8, closed
];

// Box 5's line: cells only, type undetermined (see comment above). Path
// order matches the drawn stroke, needed for the Entropic reading's
// sequential-triples semantics.
const box5Cells = ['R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4'];

// White dots (consecutive), each a drawn edge overlay (background white).
const whiteDots = [
  ['R3C1', 'R4C1'],
  ['R2C3', 'R2C4'],
  ['R1C6', 'R1C7'],
  ['R3C7', 'R4C7'],
  ['R7C3', 'R7C4'],
];

// Black dots (1:2 ratio), each a drawn edge overlay (background black).
const blackDots = [
  ['R3C3', 'R4C3'],
  ['R5C3', 'R5C4'],
  ['R3C5', 'R4C5'],
  ['R5C6', 'R5C7'],
  ['R6C5', 'R7C5'],
];

return [
  new Shape('9x9'),
  ...entropicLines.map(cells => new Entropic(...cells)),
  ...renbanLines.map(cells => new Renban(...cells)),
  new Or([new Entropic(...box5Cells), new Renban(...box5Cells)]),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
