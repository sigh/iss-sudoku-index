// Title: Restricted? Where?
// Author: Fenners
// Video: https://www.youtube.com/watch?v=23P00bU3jrg
// Source: https://sudokupad.app/fl0kwpnejm

// Normal Sudoku rules, plus anti-knight, one region-sum line, and Kropki dots.
// Not all Kropki dots are given, so absence of a dot carries no information
// (no negative/StrictKropki constraint).
//
// Line cells transcribed from the drawn line's cell-by-cell path. Dot cells
// and colours transcribed from the four drawn dot marks: white background +
// black border = white dot (consecutive); black background = black dot
// (1:2 ratio).
const regionSumLine = [
  'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3',
  'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C8',
  'R3C8', 'R3C7', 'R4C7', 'R4C6', 'R4C5',
];

const whiteDots = [
  ['R8C7', 'R8C8'],
  ['R3C4', 'R3C5'],
  ['R4C3', 'R5C3'],
];

const blackDots = [
  ['R8C7', 'R9C7'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  new RegionSumLine(...regionSumLine),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
