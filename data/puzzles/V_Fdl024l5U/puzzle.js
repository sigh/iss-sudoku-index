// Title: Deja Vu
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=V_Fdl024l5U
// Source: https://sudokupad.app/thwkj8oc4q

// Normal sudoku rules apply. In every "positive diagonal" (row + col
// constant, running top-right to bottom-left, parallel to the blue marked
// diagonal), adjacent digits differ by 4 or 5. Along the blue marked
// diagonal itself, all digits are also distinct.
//
// The blue diagonal runs R1C9-R2C8-...-R9C1 (drawn top-right corner to
// bottom-left corner), which is row + col === 8 in 0-indexed coordinates.
// `Diagonal(1)` walks exactly that cell set, so it both draws the blue
// diagonal and supplies its all-different rule.

// Every row+col-constant run of length >= 2 is a positive diagonal; runs of
// length 1 (the two grid corners) have no adjacent pair to constrain.
const positiveDiagonals = [];
for (let k = 0; k <= 16; k++) {
  const cells = [];
  for (let r = 0; r < 9; r++) {
    const c = k - r;
    if (c >= 0 && c < 9) cells.push(makeCellId(r + 1, c + 1));
  }
  if (cells.length >= 2) positiveDiagonals.push(cells);
}

// Adjacent-pair predicate: |a - b| in {4, 5}.
const diffIs4Or5Key = Pair.fnToKey((a, b) => {
  const d = Math.abs(a - b);
  return d === 4 || d === 5;
}, 9);

const positiveDiagonalDifferences = positiveDiagonals.map(
  cells => new Pair(diffIs4Or5Key, '', ...cells));

return [
  new Shape('9x9'),
  new Given('R9C1', 1),
  new Given('R9C3', 2),
  new Diagonal(1),
  ...positiveDiagonalDifferences,
];
