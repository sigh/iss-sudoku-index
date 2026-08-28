// Title: Sandwich Arrow
// Author: Tom Fry
// Video: https://www.youtube.com/watch?v=Vq0ZAf-tvGg
// Source: https://cracking-the-cryptic.web.app/sudoku/2NQqJngDfr

// Normal Sudoku rules (rows/columns/3x3 boxes) apply via the default Shape.
// Sandwich: the listed outside clues give the sum of digits strictly between
// the 1 and the 9 in that row/column; unlisted rows/columns carry no clue.
// Arrow: the shaft digits of each arrow sum to the digit in its circle.
// Ascending shaft: "Digits along arrows ascend from the point and sum to the
// number in the circle" (video description) -- read from the arrowhead (the
// point) toward the circle, shaft digits strictly increase. Encoded below as
// one strict-less-than Pair per consecutive shaft edge, walked point-first.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const ascendKey = Pair.fnToKey((a, b) => a < b, 9);

// Cell paths for each arrow are read off the drawn diagonal shafts, bulb
// (circle) cell listed first for the Arrow sum, then point-first for the
// ascending Pair chain.
const arrows = [
  { bulb: 'R4C4', shaft: ['R3C3', 'R2C2'] },
  { bulb: 'R4C6', shaft: ['R3C7', 'R2C8', 'R1C9'] },
  { bulb: 'R6C4', shaft: ['R7C3', 'R8C2', 'R9C1'] },
  { bulb: 'R6C6', shaft: ['R7C7', 'R8C8', 'R9C9'] },
];

const arrowConstraints = arrows.flatMap(({ bulb, shaft }) => {
  const pointFirst = shaft.slice().reverse();
  return [
    new Arrow(bulb, ...shaft),
    new Pair(ascendKey, 'ascend', ...pointFirst),
  ];
});

const sandwiches = [
  Sandwich.fromCells(20, graph.row(1), geometry),
  Sandwich.fromCells(20, graph.row(4), geometry),
  Sandwich.fromCells(33, graph.row(5), geometry),
  Sandwich.fromCells(0, graph.row(7), geometry),
  Sandwich.fromCells(27, graph.column(4), geometry),
  Sandwich.fromCells(13, graph.column(6), geometry),
  Sandwich.fromCells(13, graph.column(9), geometry),
];

return [
  new Shape('9x9'),
  ...sandwiches,
  ...arrowConstraints,
];
