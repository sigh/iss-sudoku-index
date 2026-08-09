// Title: Difference Ratio Sudoku
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=tSRzvfVUpdE
// Source: https://tinyurl.com/4hc4wb7m

// Normal sudoku rules apply. A black dot between two cells carries a printed
// number X: the two digits have ratio 1:X (one is X times the other). A white
// dot between two cells carries a printed number N: the two digits differ by
// N. Every dot is drawn with its own value, so this is not the fixed 1:2 /
// consecutive Kropki reading -- each edge below is encoded with its own drawn
// value.

// Drawn white (difference) dot edges and their printed values.
const differenceDots = [
  ['R1C2', 'R2C2', 6],
  ['R2C2', 'R2C3', 2],
  ['R3C2', 'R2C2', 3],
  ['R2C1', 'R2C2', 5],
  ['R8C8', 'R7C8', 7],
  ['R9C8', 'R8C8', 1],
  ['R8C9', 'R8C8', 6],
  ['R8C8', 'R8C7', 5],
  ['R8C5', 'R8C4', 5],
  ['R9C5', 'R8C5', 1],
  ['R5C1', 'R5C2', 6],
  ['R6C6', 'R6C5', 3],
  ['R6C4', 'R5C4', 4],
  ['R4C5', 'R4C4', 4],
  ['R4C6', 'R5C6', 3],
  ['R5C2', 'R4C2', 1],
  ['R6C8', 'R5C8', 3],
  ['R5C9', 'R5C8', 1],
  ['R1C5', 'R2C5', 1],
  ['R2C6', 'R2C5', 2],
];

// Drawn black (ratio) dot edges and their printed values.
const ratioDots = [
  ['R1C8', 'R2C8', 6],
  ['R2C9', 'R2C8', 7],
  ['R2C8', 'R3C8', 8],
  ['R2C8', 'R2C7', 9],
  ['R4C5', 'R5C5', 4],
  ['R5C5', 'R5C6', 5],
  ['R5C5', 'R6C5', 6],
  ['R5C5', 'R5C4', 7],
  ['R7C2', 'R8C2', 2],
  ['R8C3', 'R8C2', 3],
  ['R8C2', 'R9C2', 4],
  ['R8C1', 'R8C2', 5],
];

// A printed value of 1 (difference) or 2 (ratio) is exactly Kropki white/black
// dot semantics, so that whole same-value group uses the native class instead
// of a hand-keyed Pair.
const nativeDifference = new Set([1]);
const nativeRatio = new Set([2]);

// One Pair key per distinct printed value (other than the native groups
// above), shared by every edge that carries that value.
const differenceKeys = new Map();
for (const [, , n] of differenceDots) {
  if (nativeDifference.has(n) || differenceKeys.has(n)) continue;
  differenceKeys.set(n, Pair.fnToKey((a, b) => Math.abs(a - b) === n, 9));
}
const ratioKeys = new Map();
for (const [, , x] of ratioDots) {
  if (nativeRatio.has(x) || ratioKeys.has(x)) continue;
  // Ratio 1:X means one digit is X times the other; the dot carries no
  // direction, so both orders satisfy it.
  ratioKeys.set(x, Pair.fnToKey((a, b) => a === x * b || b === x * a, 9));
}

const differences = differenceDots.map(([a, b, n]) => (
  nativeDifference.has(n)
    ? new WhiteDot(a, b)
    : new Pair(differenceKeys.get(n), `Difference ${n}`, a, b)));
const ratios = ratioDots.map(([a, b, x]) => (
  nativeRatio.has(x)
    ? new BlackDot(a, b)
    : new Pair(ratioKeys.get(x), `Ratio 1:${x}`, a, b)));

return [
  new Shape('9x9'),
  ...differences,
  ...ratios,
];
