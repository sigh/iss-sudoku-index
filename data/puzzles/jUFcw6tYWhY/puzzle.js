// Title: Pie Are Squared
// Author: Nathan Gilbert
// Video: https://www.youtube.com/watch?v=jUFcw6tYWhY
// Source: https://cracking-the-cryptic.web.app/sudoku/2DgHftDF3D

// Normal 9x9 sudoku: each row, each column and each of the nine 3x3 boxes
// holds 1-9 once. The board carries no given digits.
//
// Nine bare numerals are printed outside the grid, above columns 1, 3, 5, 7, 9
// and to the left of rows 2, 4, 6, 8. They are encoded as sandwich sums: in
// that row or column the digits lying strictly between the 1 and the 9 add to
// the printed number. Grounds for the reading, the source carrying no rules
// text: the clues have no arrow head or comparison sign, so they address the
// whole lane they face rather than a diagonal, and they appear only on the top
// and left edges -- the placement a sandwich clue is restricted to. The video
// whose description links this source calls the puzzle a sandwich sudoku.
//
// Omitted rules. The source publishes no rules text of any kind, and none of
// the 23 dashed cages prints a total, so whatever rule the cages state cannot
// be recovered from the board. Only the standard cage convention is encoded
// here -- the digits of a cage are all different, written as a cage of total 0
// -- so the further cage rule implied by the video's word "hybrid" is left
// out, and so is the meaning of the flat grey, blue and green fill on three of
// the cages, which nothing drawn or written explains.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Cage outlines in the order the source draws them, none carrying a total.
// The 23 cages cover 80 cells; R7C9 lies outside every one of them.
const cages = [
  ['R1C1'],
  ['R1C2', 'R1C3', 'R1C4'],
  ['R1C5', 'R1C6', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6'],
  ['R2C7'],
  ['R3C7'],
  ['R1C7', 'R1C8', 'R2C8', 'R3C8'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3', 'R4C1'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C5', 'R6C4', 'R6C5', 'R6C6'],
  ['R6C7', 'R6C8', 'R6C9', 'R7C7', 'R7C8', 'R8C7', 'R8C8', 'R8C9'],
  ['R4C9', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R4C7', 'R4C8'],
  ['R4C2'],
  ['R4C3', 'R5C2', 'R5C3', 'R5C4', 'R6C2', 'R7C2'],
  ['R5C1', 'R6C1'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R8C2', 'R8C3', 'R9C2', 'R9C3'],
  ['R6C3', 'R7C3', 'R7C4', 'R7C5', 'R8C4', 'R9C4'],
  ['R8C5', 'R8C6', 'R9C5'],
  ['R7C6'],
  ['R9C6', 'R9C7'],
  ['R9C8'],
  ['R9C9'],
];

// Seven of the cages hold a single cell, where "all different" says nothing,
// so only the multi-cell outlines are emitted.
const multiCellCages = cages.filter(cells => cells.length > 1);

// Sandwich clues exactly as printed: [lane index, sum].
const columnClues = [[1, 3], [3, 14], [5, 15], [7, 9], [9, 27]];
const rowClues = [[2, 27], [4, 18], [6, 28], [8, 18]];

return [
  new Shape('9x9'),

  ...multiCellCages.map(cells => new Cage(0, ...cells)),

  ...columnClues.map(
    ([col, sum]) => Sandwich.fromCells(sum, graph.column(col), geometry)),
  ...rowClues.map(
    ([row, sum]) => Sandwich.fromCells(sum, graph.row(row), geometry)),
];
