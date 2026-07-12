// Title: Bates Motel
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=tKGjkTJj9lU
// Source: https://sudokupad.app/zyxp8ylq4g

// Normal 6x6 sudoku rules apply: rows, columns and the six 2x3 boxes are
// all-different (the default for Shape('6x6')).
//
// "Digits may not repeat in a cage": six 6-cell cages. Each cage mixes
// interior grid cells with 1-2 "room" cells that sit outside the grid (the
// same cells the Numbered Rooms clues below fill in). Since the domain is
// 1-6 and every cage has exactly 6 cells, all-different over a cage forces
// it to hold each digit 1-6 exactly once.
//
// Numbered Rooms: a digit must be entered in each outside room cell used by
// a clue. That digit must equal the digit in the Nth cell looking into the
// grid in that row/column, where N is the digit in the first (nearest to
// the clue) cell of that row/column. The outside room cells are not part of
// the grid's own row/column/box logic -- modelled as 1-6 Vars tied in only
// via their cage and via ValueIndexing (value cell = room digit, control
// cell = first interior cell, indexed cells = the ordered row/column).

function rowCells(r) {
  return [1, 2, 3, 4, 5, 6].map(c => makeCellId(r, c));
}
function colCells(c) {
  return [1, 2, 3, 4, 5, 6].map(r => makeCellId(r, c));
}

// Room cell per clue, named for the row/column and side it belongs to.
const room = new Var('O', 'room', 8);
const [oC3top, oR1left, oR1right, oR2left, oR2right, oC2bot, oC5bot, oC6bot] =
  [1, 2, 3, 4, 5, 6, 7, 8].map(n => room.cell(n));

// cellsIntoGrid[0] must be nearest the clue; ValueIndexing's control cell
// (the index-supplying cell) is that same first cell.
function numberedRoom(outsideCell, cellsIntoGrid) {
  return new ValueIndexing(outsideCell, cellsIntoGrid[0], ...cellsIntoGrid);
}

const cages = [
  [oC3top, oR1left, 'R1C1', 'R1C2', 'R1C3', 'R2C3'],
  [oR2left, 'R2C1', 'R2C2', 'R3C2', 'R3C3', 'R4C3'],
  [oR1right, oR2right, 'R1C4', 'R1C5', 'R1C6', 'R2C6'],
  ['R2C4', 'R2C5', 'R3C5', 'R4C4', 'R4C5', 'R4C6'],
  ['R4C2', 'R5C1', 'R5C2', 'R6C1', 'R6C2', oC2bot],
  ['R5C5', 'R5C6', 'R6C5', 'R6C6', oC5bot, oC6bot],
];

return [
  new Shape('6x6'),
  room,
  ...cages.map(cells => new AllDifferent(...cells)),
  numberedRoom(oC3top, colCells(3)),
  numberedRoom(oR1left, rowCells(1)),
  numberedRoom(oR1right, rowCells(1).slice().reverse()),
  numberedRoom(oR2left, rowCells(2)),
  numberedRoom(oR2right, rowCells(2).slice().reverse()),
  numberedRoom(oC2bot, colCells(2).slice().reverse()),
  numberedRoom(oC5bot, colCells(5).slice().reverse()),
  numberedRoom(oC6bot, colCells(6).slice().reverse()),
];
