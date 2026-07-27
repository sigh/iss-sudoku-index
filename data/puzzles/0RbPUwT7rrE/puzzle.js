// Title: Field Research
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=0RbPUwT7rrE
// Source: https://sudokupad.app/7n6wneuch2

// Standard sudoku (rows, columns, boxes) plus six Index Lines and three
// pairwise marks. Fog/reveal state is solving UI, not a final-grid rule, and
// is not encoded.
//
// Index Line rule: on a line of length N, read from its diamond end, the
// digit in the Kth cell gives the position along the line where digit K
// appears. Every value on the line must therefore be a valid position, i.e.
// in 1..N, and (for K in 1..N) the cell at that position holds K -- a
// self-inverse permutation of 1..N. That is enforced below as: restrict each
// line cell's candidates to 1..N (only needed when N < 9, the grid's own
// digit range), then for every pair of positions (i, j) on the line, the
// value at i equals j exactly when the value at j equals i.
function indexLine(cells) {
  const n = cells.length;
  const domainRestriction = n < 9
    ? cells.map(cell => new Given(cell, ...Array.from({length: n}, (_, k) => k + 1)))
    : [];
  const inversePairs = [];
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      const key = Pair.fnToKey((a, b) => (a === j) === (b === i), 9);
      inversePairs.push(new Pair(key, 'Index Line', cells[i - 1], cells[j - 1]));
    }
  }
  return [...domainRestriction, new AllDifferent(...cells), ...inversePairs];
}

// Index Line cells, diamond (start) cell first. Read from the turquoise line
// waypoints and their diamond-shaped start markers in the source geometry;
// three of the six are stored diamond-last and are reversed here.
const indexLines = [
  ['R9C7', 'R8C7', 'R7C7', 'R6C8', 'R7C8', 'R7C9', 'R8C9'],
  ['R5C8', 'R4C8', 'R3C8', 'R2C8'],
  ['R5C4', 'R5C5', 'R5C6', 'R6C6', 'R5C7', 'R4C7', 'R3C7', 'R2C7', 'R1C7'],
  ['R6C1', 'R5C1', 'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6'],
  ['R6C2', 'R7C3', 'R8C3', 'R9C3', 'R9C4', 'R8C4', 'R8C5'],
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C5', 'R2C6'],
];

return [
  new Shape('9x9'),
  // R6C6 > R6C7: the drawn sign renders as ">" (unrotated), whose point --
  // per the rules text, "Inequality signs point to the smaller of the two
  // digits" -- sits on the R6C7 side.
  new GreaterThan('R6C6', 'R6C7'),
  // White dot: consecutive digits.
  new WhiteDot('R6C4', 'R6C5'),
  // Black X: digits sum to 10.
  new X('R7C7', 'R8C7'),
  ...indexLines.flatMap(indexLine),
];
