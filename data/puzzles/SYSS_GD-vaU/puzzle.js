// Title: Mozzarella
// Author: Perladel
// Video: https://www.youtube.com/watch?v=SYSS_GD-vaU
// Source: https://app.crackingthecryptic.com/sudoku/hhB3TGFtdR

// Normal sudoku rules (default row/column/box all-different).
// Black dot: adjacent cells in a 1:2 ratio -- BlackDot.
// Purple line: the line's digits form one consecutive, non-repeating set,
// order-independent -- Renban.
//
// Some purple lines have an endpoint on the grid's outer edge. Per the
// rules, such an endpoint might continue past the edge and join, into one
// longer line, whichever other line starts at the mirrored position on the
// opposite edge (row1<->row9 same column, col1<->col9 same row) -- or it
// might not join, leaving both lines independent. Six drawn line pairs have
// endpoints mirrored this way; each is encoded below as a choice between
// the two readings. The remaining edge-touching endpoints have no mirrored
// partner anywhere on the opposite edge, so they cannot wrap and are
// encoded as plain Renbans.

const given = new Given('R2C3', 5);

const dots = [
  new BlackDot('R2C5', 'R3C5'),
  new BlackDot('R1C7', 'R1C8'),
  new BlackDot('R1C8', 'R1C9'),
  new BlackDot('R7C1', 'R8C1'),
  new BlackDot('R7C2', 'R8C2'),
  new BlackDot('R8C7', 'R8C8'),
];

// Lines with no edge-touching endpoint, or whose edge-touching endpoint has
// no mirrored partner on the opposite edge -- always independent lines,
// never merged.
const plainLines = [
  new Renban('R3C4', 'R4C3', 'R5C3'),
  new Renban('R4C5', 'R4C4', 'R5C4', 'R6C4'),
  new Renban('R4C6', 'R5C6', 'R5C5', 'R6C5'),
  new Renban('R6C6', 'R7C6', 'R7C5', 'R7C4'),
  new Renban('R8C1', 'R8C2'),          // touches col1 (R8C1); no col9/row8 partner
  new Renban('R8C4', 'R9C4', 'R9C5'),  // touches row9 (R9C5); no row1/col5 partner
];

// Six mirrored-endpoint pairs. Each pair is Or(both lines independent, the
// two lines merged into one Renban over their combined cells).
const wrapPairs = [
  [['R1C2', 'R1C3', 'R2C4'], ['R9C2', 'R8C3']],
  [['R2C5', 'R2C6', 'R1C6'], ['R8C5', 'R8C6', 'R9C6']],
  [['R1C7', 'R2C8', 'R1C9'], ['R7C7', 'R8C7', 'R9C7']],
  [['R2C7', 'R3C7', 'R3C8', 'R3C9'], ['R3C1', 'R4C2']],
  [['R4C8', 'R5C8', 'R5C9', 'R4C9'], ['R4C1', 'R5C1', 'R6C1', 'R5C2', 'R6C3']],
  [['R6C9', 'R7C9'], ['R7C1', 'R7C2']],
];

const wrapConstraints = wrapPairs.map(([a, b]) => new Or([
  new And([new Renban(...a), new Renban(...b)]),
  new Renban(...a, ...b),
]));

return [
  new Shape('9x9'),
  given,
  ...dots,
  ...plainLines,
  ...wrapConstraints,
];
