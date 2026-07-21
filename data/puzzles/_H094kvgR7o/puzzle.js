// Title: Indexpennant Day
// Author: rockratzero
// Video: https://www.youtube.com/watch?v=_H094kvgR7o
// Source: https://sudokupad.app/fgtl60ohu1

const columnIndexers = [
  'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3',
  'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5',
  'R2C7', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7',
];

const rowIndexers = [
  'R1C2',
  'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4',
  'R4C6', 'R6C6', 'R7C6', 'R8C6',
];

const oddStars = [
  'R1C3', 'R1C5', 'R1C7', 'R2C4',
  'R2C6', 'R3C5', 'R9C2', 'R9C8',
];

return [
  new Shape('9x9'),
  new Given('R2C1', 1),
  new Given('R2C8', 7),
  new Given('R3C2', 7),
  new Given('R3C9', 6),

  // Box borders split this path into three equal-sum segments.
  new RegionSumLine(
    'R1C2', 'R1C3', 'R2C4', 'R3C5', 'R2C6', 'R1C7', 'R1C8'
  ),

  new Indexing(Indexing.COL_INDEXING, ...columnIndexers),
  new Indexing(Indexing.ROW_INDEXING, ...rowIndexers),
  ...oddStars.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
];
