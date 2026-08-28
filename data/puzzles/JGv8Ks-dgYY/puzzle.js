// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=JGv8Ks-dgYY
// Source: https://cracking-the-cryptic.web.app/sudoku/7bN3dbRJ3R

// Normal sudoku rules apply (standard 3x3 boxes, 7 givens).
//
// Grey box: the central 5x5 block (rows 3-7, cols 3-7, all 25 cells shaded
// grey in the payload's underlays) -- the only rules text in the payload,
// spelled out as ten outside-clue overlay fragments, reads "Each five cell
// grey row&col has a sum of 20." Encoded as one Sum(20, ...) per row-segment
// and per column-segment of the block (5 + 5 = 10 groups of 5 cells each).
//
// Diagonals: both lines are drawn in the same colour/thickness (#34BBE6,
// th=2) corner-to-corner with no other adornment and no accompanying rules
// text -- this pipeline's recurring convention for that exact mark is the
// Sudoku X non-repeat diagonal (seen with identical waypoints/colour on
// other rows, e.g. 0PeCNkhiWTY, -Uj9xZPyzM4, 0a2sUvhl-I4). Encoded as
// Diagonal(1)/Diagonal(-1).

const greySums = [];
// Row-segments of the block: R{r}C3..R{r}C7, r = 3..7.
for (let r = 3; r <= 7; r++) {
  const cells = [];
  for (let c = 3; c <= 7; c++) cells.push(makeCellId(r, c));
  greySums.push(new Sum(20, ...cells));
}
// Column-segments of the block: R3C{c}..R7C{c}, c = 3..7.
for (let c = 3; c <= 7; c++) {
  const cells = [];
  for (let r = 3; r <= 7; r++) cells.push(makeCellId(r, c));
  greySums.push(new Sum(20, ...cells));
}

return [
  new Shape('9x9'),

  new Given('R1C4', 8),
  new Given('R2C9', 7),
  new Given('R3C1', 5),
  new Given('R3C6', 3),
  new Given('R5C2', 8),
  new Given('R7C3', 4),
  new Given('R9C5', 8),

  new Diagonal(1),
  new Diagonal(-1),

  ...greySums,
];
