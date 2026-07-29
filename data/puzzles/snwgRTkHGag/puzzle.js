// Title: Dutch Flat Mates (Numbered Rooms)
// Author: GoodCity
// Video: https://www.youtube.com/watch?v=snwgRTkHGag
// Source: https://app.crackingthecryptic.com/2z307pcbx5

// Standard Sudoku. Every 5 has a 1 above or a 9 below. Numbered Rooms clues
// select the Nth cell from their direction, with N taken from the first cell.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const room = (value, cells) => NumberedRoom.fromCells(value, cells, geometry);

return [
  new Shape('9x9'),
  new DutchFlatmates(),
  ...[2, 3, 4, 6, 7, 8].map(column => room(5, graph.column(column))),
  ...[2, 3, 6].map(row => room(5, graph.row(row))),
  room(5, [...graph.row(2)].reverse()),
  room(5, [...graph.row(3)].reverse()),
  room(1, [...graph.row(5)].reverse()),
  room(1, [...graph.row(7)].reverse()),
  ...[1, 2, 5, 7, 8, 9].map(column => room(1, [...graph.column(column)].reverse())),
];
