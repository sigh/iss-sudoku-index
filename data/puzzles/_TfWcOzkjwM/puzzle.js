// Title: Equal Sudoku - An Apology
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=_TfWcOzkjwM
// Source: https://cracking-the-cryptic.web.app/sudoku/g7q2mFfLp7

// Normal sudoku rules apply (default row/col/box AllDifferent). In each
// coloured region, the sum of the odd digits equals the sum of the even
// digits, and digits cannot repeat in the region.
//
// The 4 drawn colours are not single regions: each colour's cells split into
// several orthogonally-disconnected clusters, and a full colour's cell count
// (up to 23) exceeds the 1-9 digit range, so "digits cannot repeat" can only
// hold per orthogonally-connected same-coloured cluster -- the whole-colour
// reading is unsatisfiable on its own arithmetic. This encodes "coloured
// region" as one connected cluster; REGIONS below lists the 17 clusters
// (5 uncoloured cells fall under no such rule). Clusters and the given below
// are transcribed from the drawn cell fill colours.
const REGIONS = [
  // blue
  ['R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6'],
  ['R6C1', 'R7C1', 'R7C2', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2'],
  ['R9C7', 'R9C8', 'R9C9'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C6', 'R2C7'],
  // red/pink
  ['R2C2', 'R3C1', 'R3C2', 'R4C1'],
  ['R5C4', 'R6C4', 'R7C3', 'R7C4', 'R8C4', 'R9C3', 'R9C4'],
  ['R5C7', 'R5C8', 'R6C7'],
  ['R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C9'],
  // gold/yellow
  ['R5C1', 'R5C2', 'R5C3', 'R6C2'],
  ['R1C1', 'R1C2', 'R2C1'],
  ['R2C4', 'R2C5', 'R3C5', 'R3C6'],
  ['R4C9', 'R5C9', 'R6C8', 'R6C9'],
  ['R8C6', 'R8C7', 'R9C6'],
  // yellowgreen
  ['R7C7', 'R7C8', 'R7C9', 'R8C8', 'R8C9'],
  ['R3C7', 'R3C8', 'R4C8'],
  ['R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R2C3', 'R3C3', 'R4C2', 'R4C3'],
];

// "Sum of odd digits = sum of even digits" is not a fixed-coefficient linear
// sum (each digit's sign depends on its own parity), so it is read as a
// regular language over the region's cells in an arbitrary fixed order (the
// condition is order-independent): track the running signed value
// diff = (sum of odd digits so far) - (sum of even digits so far), accept
// when diff is back to 0 after every cell. maxDepth caps compile-time state
// growth at the largest region's cell count (8); without it the automaton has
// no bound on scan length and the state search never terminates.
const MAX_REGION_SIZE = Math.max(...REGIONS.map((cells) => cells.length));
const oddEvenEqualSpec = NFA.encodeSpec({
  startState: 0,
  transition: (diff, v) => diff + (v % 2 === 1 ? v : -v),
  accept: (diff) => diff === 0,
  maxDepth: MAX_REGION_SIZE,
}, 9);

return [
  new Shape('9x9'),
  new Given('R3C5', 7),
  ...REGIONS.map((cells) => new AllDifferent(...cells)),
  ...REGIONS.map((cells) => new NFA(oddEvenEqualSpec, 'odd=even sum', ...cells)),
];
