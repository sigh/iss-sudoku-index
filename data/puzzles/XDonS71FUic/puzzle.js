// Title: Can of worms
// Author: bellal
// Video: https://www.youtube.com/watch?v=XDonS71FUic
// Source: https://sudokupad.app/4dszmln0se

// Normal sudoku rules apply: default Shape('9x9') gives rows, columns and
// the standard 3x3 boxes (raw regions confirmed standard).
//
// The four orange lines are each both an entropic line (Entropic below) and
// an index line. Numbering each line's 8 cells 1..8 from its diamond
// (position 1), the rule reads: the digit written at position N gives the
// position of digit N on the line. For an ordered pair of positions (i, j)
// this means value(cell_i) == j  <=>  value(cell_j) == i; taken over every
// pair of positions on the line this forces the line's 8 values to be a
// self-inverse permutation (an involution) of {1..8}. indexInvolution()
// below builds one Pair per unordered position pair encoding that
// iff-relationship. Because every position N only exists for N in 1..8, a
// line cell can never hold 9 (there is no "position 9" for it to name);
// Regex enforces that range.
//
// The single arrow has no line to a separate bulb: its two waypoints sit
// fractionally inside R6C5, near the shared edge with R5C5, with the
// second (arrowhead) waypoint deeper into R6C5 than the first -- read as a
// small arrowhead straddling the R5C5/R6C5 edge and pointing down into
// R6C5. So it occupies R5C5 and R6C5, and points at R6C5 as the smaller
// digit: R5C5 > R6C5.

const indexLines = [
  ['R1C1', 'R2C2', 'R3C3', 'R2C4', 'R1C5', 'R2C6', 'R2C7', 'R2C8'],
  ['R7C9', 'R8C8', 'R9C7', 'R8C6', 'R7C5', 'R8C4', 'R9C3', 'R9C2'],
  ['R8C1', 'R7C2', 'R6C3', 'R6C4', 'R5C3', 'R5C2', 'R5C1', 'R6C1'],
  ['R3C4', 'R3C5', 'R4C6', 'R5C6', 'R6C7', 'R5C8', 'R4C8', 'R4C9'],
];

const indexInvolution = (cells) => {
  const pairs = [];
  for (let i = 1; i <= cells.length; i++) {
    for (let j = i + 1; j <= cells.length; j++) {
      const key = Pair.fnToKey((a, b) => (a === j) === (b === i), 9);
      pairs.push(new Pair(key, `Index ${i}-${j}`, cells[i - 1], cells[j - 1]));
    }
  }
  return pairs;
};

return [
  new Shape('9x9'),

  ...indexLines.flatMap(cells => [
    new Entropic(...cells),
    new Regex('[1-8]{8}', ...cells),
    ...indexInvolution(cells),
  ]),

  new GreaterThan('R5C5', 'R6C5'),
];
