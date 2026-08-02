// Title: Dense Fog
// Author: Bruce Svare
// Video: https://www.youtube.com/watch?v=yLFQ2OcgkYo
// Source: https://app.crackingthecryptic.com/sudoku/gDbhTN8rq8

// Rules encoded: normal Sudoku; anti-knight; the two diagonal outside sums;
// marked white/black Kropki dots (the rules say dots are not exhaustive); and
// the known entries of the five sorted quads. Question-mark quad entries are
// unspecified values, so add no constraint beyond the displayed numerals.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Drawn white and black dot edges.
const whiteDots = [
  ['R1C4', 'R1C5'],
  ['R5C3', 'R5C4'],
  ['R5C2', 'R6C2'],
];
const blackDots = [
  ['R3C5', 'R4C5'],
  ['R5C8', 'R6C8'],
];

// The displayed known numerals in the five drawn 2x2 corner circles.
const quads = [
  ['R3C5', 6],
  ['R4C4', 9],
  ['R4C3', 3],
  ['R5C5', 5],
  ['R5C6', 8],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  LittleKiller.fromCells(70, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R9C1', -1, 1), geometry),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...quads.map(([topLeft, digit]) => new Quad(topLeft, digit)),
];
