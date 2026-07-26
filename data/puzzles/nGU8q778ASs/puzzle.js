// Title: Graded on a Curve
// Author: ChinStrap and sujoyku
// Video: https://www.youtube.com/watch?v=nGU8q778ASs
// Source: https://sudokupad.app/3i3xlin7gl

// Normal sudoku, plus:
// - Index Lines (turquoise): the digit in the Nth cell along the line
//   (starting from the diamond) gives the position along the line where
//   digit N appears.
// - Nabner Lines (yellow): no two cells anywhere on the line, not just
//   adjacent ones, hold consecutive or repeated digits.

// Index Line cells, in order starting from the diamond cell (drawn as a
// turquoise diamond underlay on one endpoint of each line).
const indexLines = [
  ['R6C7', 'R7C7', 'R7C6', 'R8C6', 'R8C5', 'R9C5'],
  ['R7C8', 'R8C8', 'R8C7', 'R9C7', 'R9C6'],
  ['R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R4C2'],
  ['R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R2C4'],
];

const nabnerLines = [
  ['R9C8', 'R9C9', 'R8C9'],
  ['R8C4', 'R7C4', 'R6C3', 'R6C2'],
  ['R2C6', 'R2C7', 'R3C7', 'R4C7', 'R4C6'],
  ['R4C3', 'R3C3', 'R3C2', 'R2C2', 'R1C1'],
];

// An Index Line of length k means: for every pair of positions (i, j) along
// the line (1-indexed from the diamond), the cell at position i holds j if
// and only if the cell at position j holds i. This is exactly the
// definition of an involution over the k positions, so it is built from two
// parts:
//  - each cell's value is restricted to 1..k (a value outside that range
//    could never satisfy "the position along the line where digit N
//    appears", since the line has no such position);
//  - for every pair of positions, a custom Pair constraint enforcing the
//    biconditional above. (No separate all-different is needed: a repeated
//    value at two positions always breaks one of these pairwise
//    biconditionals.)
function indexLineConstraints(cells) {
  const k = cells.length;
  const positions = Array.from({ length: k }, (_, i) => i + 1);
  // Skip the domain restriction when it would be the full 1-9 range
  // (a no-op Given the Shape already allows).
  const domainGivens = k < 9
    ? cells.map(cell => new Given(cell, ...positions))
    : [];

  const pairConstraints = [];
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const posI = i + 1;
      const posJ = j + 1;
      const key = Pair.fnToKey((a, b) => (a === posJ) === (b === posI), 9);
      pairConstraints.push(new Pair(key, 'IndexLine', cells[i], cells[j]));
    }
  }
  return [...domainGivens, ...pairConstraints];
}

const notConsecutiveKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);

return [
  new Shape('9x9'),

  ...indexLines.flatMap(indexLineConstraints),
  ...nabnerLines.map(cells => new PairX(notConsecutiveKey, 'Nabner', ...cells)),
];
