// Title: That's 3 in the corners
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=nUmLfBXbB_c
// Source: https://sudokupad.app/jf0yny3xul

// Normal Sudoku rules apply. EqualSum groups every box-contained horizontal
// strip together, and likewise every box-contained vertical strip.
const boxes = cellGraph('9x9').boxes();
const horizontalStrips = boxes.flatMap(box =>
  [0, 1, 2].map(row => box.slice(3 * row, 3 * row + 3)));
const verticalStrips = boxes.flatMap(box =>
  [0, 1, 2].map(column => [box[column], box[column + 3], box[column + 6]]));

const boxCenters = boxes.map(box => box[4]);
const centerBounds = boxCenters.slice(0, 8).map((cell, index) =>
  new Given(cell, ...Array.from({length: index + 1}, (_, digit) => digit + 1)));

return [
  new Shape('9x9'),
  new AntiKing(),
  new EqualSum(...horizontalStrips),
  new EqualSum(...verticalStrips),
  ...centerBounds,
  new Sum(3, 'R1C1', 'R9C9'),
];
