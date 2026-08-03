// Title: PrimeChip
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=mPB8EnkIbhw
// Source: https://app.crackingthecryptic.com/sudoku/3pdBTNdnjB

// Normal sudoku rules apply (default row/column/box all-different).
// "Every grey line that connects two cells shows a prime number, read from
// left-to-right, top-to-bottom or bottom-left-to-top-right." Each drawn grey
// line is a chain of straight segments (some lines are closed loops around a
// 2x2 block, some are open or branching paths, some are a single segment);
// every individual segment "connects two cells", so each is graded as its
// own independent two-digit prime, regardless of which line it belongs to.
// The reading direction is fixed by the segment's own orientation, not by
// the order the source drew the path in: horizontal -> left cell is the tens
// digit; vertical -> top cell is the tens digit; diagonal -> the
// bottom-left cell is the tens digit (every diagonal segment drawn here runs
// bottom-left to top-right, the only diagonal direction the rules name).

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

// Shared relation for every prime-domino edge: tens digit `a`, units digit
// `b`, in the direction-ordered (a, b) cell pairs below.
const primeDominoKey = Pair.fnToKey((a, b) => isPrime(10 * a + b), 9);
const primeDomino = (a, b) => new Pair(primeDominoKey, 'Prime', a, b);

// Each edge below is [tensDigitCell, unitsDigitCell], grouped by the
// lines[] entry it was drawn as (lines[13] has no way-points and resolves to
// no cell path, so it contributes nothing).

// lines[0]: closed loop R1C2-R1C1-R2C1-R2C2-R1C2 (top-left corner square).
const line0 = [
  ['R1C1', 'R1C2'], ['R1C1', 'R2C1'], ['R2C1', 'R2C2'], ['R1C2', 'R2C2'],
];
// lines[1]: closed loop R1C8-R2C8-R2C9-R1C9-R1C8 (top-right corner square).
const line1 = [
  ['R1C8', 'R2C8'], ['R2C8', 'R2C9'], ['R1C9', 'R2C9'], ['R1C8', 'R1C9'],
];
// lines[2]: closed loop R8C1-R9C1-R9C2-R8C2-R8C1 (bottom-left corner square).
const line2 = [
  ['R8C1', 'R9C1'], ['R9C1', 'R9C2'], ['R8C2', 'R9C2'], ['R8C1', 'R8C2'],
];
// lines[3]: closed loop R8C8-R9C8-R9C9-R8C9-R8C8 (bottom-right corner square).
const line3 = [
  ['R8C8', 'R9C8'], ['R9C8', 'R9C9'], ['R8C9', 'R9C9'], ['R8C8', 'R8C9'],
];
// lines[4]: R8C6-R7C6-R6C7-R6C8. The middle edge (R7C6-R6C7) is the
// puzzle's diagonal case: row 7->6 (up), column 6->7 (right), i.e.
// bottom-left R7C6 to top-right R6C7.
const line4 = [
  ['R7C6', 'R8C6'], ['R7C6', 'R6C7'], ['R6C7', 'R6C8'],
];
// lines[5]: R6C7-R5C7-R4C7-R3C7-R2C8. Final edge (R3C7-R2C8) is again
// bottom-left (R3C7) to top-right (R2C8).
const line5 = [
  ['R5C7', 'R6C7'], ['R4C7', 'R5C7'], ['R3C7', 'R4C7'], ['R3C7', 'R2C8'],
];
// lines[6]: R3C7-R3C6-R3C5-R3C4-R3C3-R4C3-R5C3-R6C3-R7C3-R7C4-R7C5-R7C6,
// the chip-body outline around the centre box; every edge is orthogonal.
const line6 = [
  ['R3C6', 'R3C7'], ['R3C5', 'R3C6'], ['R3C4', 'R3C5'], ['R3C3', 'R3C4'],
  ['R3C3', 'R4C3'], ['R4C3', 'R5C3'], ['R5C3', 'R6C3'], ['R6C3', 'R7C3'],
  ['R7C3', 'R7C4'], ['R7C4', 'R7C5'], ['R7C5', 'R7C6'],
];
// lines[7]-[12]: six single-edge "pin" stubs off the chip body.
const pins = [
  ['R4C2', 'R4C3'], // lines[7]
  ['R5C2', 'R5C3'], // lines[8]
  ['R6C2', 'R6C3'], // lines[9]
  ['R2C4', 'R3C4'], // lines[10]
  ['R2C5', 'R3C5'], // lines[11]
  ['R2C6', 'R3C6'], // lines[12]
];

const primeEdges = [
  ...line0, ...line1, ...line2, ...line3,
  ...line4, ...line5, ...line6, ...pins,
];

return [
  new Shape('9x9'),
  new Given('R6C4', 2),
  new Given('R8C5', 4),
  new Given('R9C5', 5),
  ...primeEdges.map(([a, b]) => primeDomino(a, b)),
];
