// Title: Hidden Sandwiches
// Author: Secret Santa
// Video: https://www.youtube.com/watch?v=J5fl-_dCl7U
// Source: https://sudokupad.app/p21cjfonte

// Normal sudoku rules apply (9x9, standard rows/cols/boxes -- the solver's
// default baseline). Fog-of-war reveal state ("The grid is partially covered
// in fog...") is solving UI only and is not encoded.
//
// Ten single-cell cages each mark a row-sandwich (red) or column-sandwich
// (blue) clue -- colour read from the source payload's cage `outlineC` and
// matched to the rules' "red cage"/"blue cage" wording:
//   "The number in the top left corner of a red/blue cage (if given)
//   indicates the sum of the digits sandwiched between 1 and 9 in that
//   row/column." -- a standard Sandwich clue over the whole row/column,
//   applied only where a number is shown; two cages show "?" instead, so no
//   sum clue for those rows/columns.
//   "The digit in a cage indicates how many digits (including the crust of 1
//   and 9) the corresponding sandwich sum contains." -- each cage is a single
//   grid cell, so "the digit in [the] cage" is that cell's own solved digit:
//   it must equal the count of cells from the 1 to the 9 inclusive, in that
//   same row/column. This holds for all ten cages, including the two with no
//   sum given.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// crustCount(cageIdx): the digit at position `cageIdx` of a 9-cell row/column
// scan equals 2 + (number of cells strictly between the 1 and the 9) --
// i.e. |pos(9) - pos(1)| + 1. `idx` counts cells consumed so far; pos1/pos9
// latch the (only, by all-different) index where that value is seen;
// `captured` latches the digit seen at the fixed cage position.
function crustCount(cageIdx) {
  return NFA.encodeSpec({
    startState: { idx: 0, pos1: null, pos9: null, captured: null },
    transition: ({ idx, pos1, pos9, captured }, value) => ({
      idx: idx + 1,
      pos1: (value === 1 && pos1 === null) ? idx : pos1,
      pos9: (value === 9 && pos9 === null) ? idx : pos9,
      captured: (idx === cageIdx) ? value : captured,
    }),
    accept: ({ pos1, pos9, captured }) =>
      pos1 !== null && pos9 !== null && captured !== null &&
      captured === Math.abs(pos1 - pos9) + 1,
    // idx never exceeds an 9-cell row/column scan; bound compile-time state
    // growth to that (otherwise idx climbs unboundedly during compilation).
    maxDepth: 9,
  }, 9);
}

// Cage table: cell, row-or-column, and shown sum (null for the two "?"
// cages), transcribed from the puzzle's cage clues (colour red/blue, corner
// number, single cell).
const rowCages = [
  { row: 1, cell: 'R1C1', sum: 25 },
  { row: 2, cell: 'R2C1', sum: 12 },
  { row: 3, cell: 'R3C1', sum: 24 },
  { row: 5, cell: 'R5C9', sum: 20 },
  { row: 6, cell: 'R6C9', sum: null },
];
const colCages = [
  { col: 5, cell: 'R1C5', sum: 16 },
  { col: 6, cell: 'R1C6', sum: 17 },
  { col: 7, cell: 'R8C7', sum: 14 },
  { col: 8, cell: 'R8C8', sum: 22 },
  { col: 9, cell: 'R8C9', sum: null },
];

const rowConstraints = rowCages.flatMap(({ row, cell, sum }) => {
  const cells = graph.row(row);
  const cageIdx = cells.indexOf(cell);
  const out = [new NFA(crustCount(cageIdx), `crust-row${row}`, ...cells)];
  if (sum !== null) out.push(Sandwich.fromCells(sum, cells, geometry));
  return out;
});

const colConstraints = colCages.flatMap(({ col, cell, sum }) => {
  const cells = graph.column(col);
  const cageIdx = cells.indexOf(cell);
  const out = [new NFA(crustCount(cageIdx), `crust-col${col}`, ...cells)];
  if (sum !== null) out.push(Sandwich.fromCells(sum, cells, geometry));
  return out;
});

return [
  new Shape('9x9'),
  ...rowConstraints,
  ...colConstraints,
];
