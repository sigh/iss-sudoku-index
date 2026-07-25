// Title: Dutch Angles
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=LHm16UXAZxs
// Source: https://sudokupad.app/u3wm0t8ahm

// Normal sudoku rules apply: 9x9 grid, standard rows/columns/3x3 boxes.
//
// Dutch Whisper lines: Whisper(4, ...) enforces an adjacent-cell difference
// of at least 4 along each closed loop; each loop repeats its first cell at
// the end so the closing edge is also constrained. Every loop stays inside
// the grid except where it dips out to a Numbered Room cell (see below).
//
// Numbered Rooms: wherever a Dutch Whisper loop leaves the grid, the cell it
// enters just outside is a "room" that the solver must fill with a digit (14
// such cells; none is given). A room cell's digit must equal the interior
// grid digit at position N counting in from that side, where N is the digit
// in the interior cell nearest the room. Modelled as Vars tied in only via
// ValueIndexing; each room cell is also a normal point on its Whisper loop.

function rowCells(r) {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(r, c));
}
function colCells(c) {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, c));
}
const reversed = cells => cells.slice().reverse();

// The 14 room cells, named for the row/column and side they belong to.
const room = new Var('O', 'room', 14);
const [oT1, oL1, oL3, oL4, oL5, oL6, oL7, oR5, oR6, oR7, oB3, oB8, oB9, oR9] =
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(n => room.cell(n));

// roomCell's digit must equal cellsIntoGrid[N-1], where N is the digit in
// cellsIntoGrid[0] (the interior cell nearest the room).
function numberedRoom(roomCell, cellsIntoGrid) {
  return new ValueIndexing(roomCell, cellsIntoGrid[0], ...cellsIntoGrid);
}

const numberedRooms = [
  numberedRoom(oT1, colCells(1)),
  numberedRoom(oL1, rowCells(1)),
  numberedRoom(oL3, rowCells(3)),
  numberedRoom(oL4, rowCells(4)),
  numberedRoom(oL5, rowCells(5)),
  numberedRoom(oL6, rowCells(6)),
  numberedRoom(oL7, rowCells(7)),
  numberedRoom(oR5, reversed(rowCells(5))),
  numberedRoom(oR6, reversed(rowCells(6))),
  numberedRoom(oR7, reversed(rowCells(7))),
  numberedRoom(oB3, reversed(colCells(3))),
  numberedRoom(oB8, reversed(colCells(8))),
  numberedRoom(oB9, reversed(colCells(9))),
  numberedRoom(oR9, reversed(rowCells(9))),
];

// Dutch Whisper loops (orange), each closed by repeating its first cell.
// Provenance: the drawn line paths, translated to interior R#C# ids plus
// the room cell any loop happens to pass through.
const whisperLoops = [
  ['R2C5', 'R3C5', 'R4C5', 'R3C6', 'R2C5'],
  ['R3C2', 'R3C3', 'R3C4', 'R2C3', 'R3C2'],
  ['R9C8', oB8, 'R9C7', 'R8C6', 'R8C7', 'R8C8', 'R9C8'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3', oB3, 'R9C2', 'R8C1', oL7, 'R7C1'],
  ['R5C9', oR5, oR6, oR7, 'R6C9', 'R5C8', 'R5C9'],
  [oL3, oL4, oL5, oL6, 'R6C1', 'R6C2', 'R6C3', 'R5C2', 'R4C1', oL3],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R3C8', 'R2C7',
    'R1C6'],
  ['R9C9', oR9, oB9, 'R9C9'],
  [oT1, 'R1C1', oL1, oT1],
];

return [
  new Shape('9x9'),
  room,
  ...numberedRooms,
  ...whisperLoops.map(cells => new Whisper(4, ...cells)),
];
