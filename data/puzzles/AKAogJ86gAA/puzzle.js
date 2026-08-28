// Title: Streamlined
// Author: Rangsk, Subtitle, zetamath, et al.
// Video: https://www.youtube.com/watch?v=AKAogJ86gAA
// Source: https://tinyurl.com/y9wbdmal

// Normal sudoku rules apply (default row/column/box AllDifferent from
// Shape('9x9'); no regions are drawn in the payload).
//
// Indexing Arrows: each diamond-marked bulb cell heads one or two arrow
// lines. Digits along a line sum to the bulb's own value (Arrow, whose
// first cell is the sum target). If a line runs horizontally, the bulb's
// value V says where its own column number C appears in its row: cell
// (R, V) holds C. That is exactly the built-in Indexing('C', ...) rule
// ("for a cell in column C, its value V places C at column V of that
// row"). If a line runs vertically, symmetrically the bulb's value V says
// where its own row number R appears in its column: cell (V, C) holds R --
// Indexing('R', ...). A bulb with lines in both directions gets both
// rules, per the ruleset's "follows both rules" clause. The payload's
// `rectangle` entries (a 45-degree square on each bulb cell) draw the
// diamond shape itself and name no separate rule.

// Bulb cells and their line(s), transcribed from the payload's `arrow`
// array (each line starts at the bulb, `cells[0]`).
const arrows = [
  [['R2C2', 'R2C3', 'R2C4', 'R2C5'], ['R2C2', 'R3C2', 'R4C2', 'R5C2']],
  [['R1C1', 'R1C2', 'R1C3'], ['R1C1', 'R2C1', 'R3C1']],
  [['R3C5', 'R3C4', 'R3C3'], ['R3C5', 'R4C5', 'R5C5']],
  [['R7C2', 'R7C3', 'R7C4']],
  [['R8C7', 'R7C7', 'R6C7']],
  [['R9C5', 'R8C5', 'R7C5'], ['R9C5', 'R9C4', 'R9C3']],
  [['R2C7', 'R3C7', 'R4C7']],
  [['R4C8', 'R4C7', 'R4C6']],
];

const parseCell = id => ({
  row: +id.slice(1, id.indexOf('C')),
  col: +id.slice(id.indexOf('C') + 1),
});

const arrowConstraints = [];
const colIndexBulbs = []; // horizontal line (row fixed) -> column indexing
const rowIndexBulbs = []; // vertical line (col fixed) -> row indexing

for (const lines of arrows) {
  for (const line of lines) {
    arrowConstraints.push(new Arrow(...line));

    const coords = line.map(parseCell);
    const horizontal = coords.every(c => c.row === coords[0].row);
    (horizontal ? colIndexBulbs : rowIndexBulbs).push(line[0]);
  }
}

return [
  new Shape('9x9'),
  ...arrowConstraints,
  new Indexing('C', ...colIndexBulbs),
  new Indexing('R', ...rowIndexBulbs),
];
