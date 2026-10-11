// Title: Count Your Steps
// Author: masetab
// Video: https://www.youtube.com/watch?v=raTlPg5e1QA
// Source: https://sudokupad.app/dut384ki7t

// Normal sudoku, between lines, global counting circles, and the drawn inequalities.
const shape = new Shape('9x9');
// Each horizontal grey stroke, including its two circled endpoints.
const lines = [
  ['R1C1','R1C2','R1C3','R1C4'],
  ['R1C6','R1C7','R1C8','R1C9'],
  ['R2C2','R2C3','R2C4','R2C5'],
  ['R3C3','R3C4','R3C5','R3C6'],
  ['R4C4','R4C5','R4C6','R4C7'],
  ['R5C5','R5C6','R5C7','R5C8'],
  ['R6C6','R6C7','R6C8','R6C9'],
  ['R6C4','R6C3','R6C2','R6C1'],
  ['R7C2','R7C3','R7C4','R7C5'],
  ['R8C3','R8C4','R8C5','R8C6'],
  ['R9C4','R9C5','R9C6','R9C7'],
];
// Three unattached black circles supplement the 22 line endpoints.
const circles = [...lines.flatMap(cells => [cells[0], cells[cells.length - 1]]),
  'R9C1', 'R9C9', 'R2C8'];
// The northwest-pointing corner glyph joins the diagonal cells R7C8 and R8C9;
// Pair supports this diagonal relationship, where GreaterThan requires an edge.
const diagonal = new Pair(Pair.fnToKey((a, b) => a < b, shape), 'Less than', 'R7C8', 'R8C9');
return [
  shape,
  // The sole printed given.
  new Given('R7C9', 6),
  ...lines.map(cells => new Between(...cells)),
  new CountingCircles(...circles),
  // Inequality glyphs point down and left.
  new GreaterThan('R4C5', 'R5C5'),
  new GreaterThan('R6C5', 'R6C4'),
  diagonal,
];
