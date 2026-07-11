// Title: Entropic Ternary
// Author: Cassinii
// Video: https://www.youtube.com/watch?v=7iuxM-Xtsxw
// Source: https://sudokupad.app/7gyocv8k7m

// Normal sudoku rules apply.
//
// Coordinate cages: the two digits X and Y in a cage, reading left to
// right, point to the cell at row X, column Y. Each digit's entropic
// set gives a base-3 digit ({1,2,3}=0, {4,5,6}=1, {7,8,9}=2); the base-3
// number formed by X then Y, converted to base 10, is placed at r(X)c(Y).
// No two cages may point at the same cell.
//
// One cage (R9C8-R9C9) is an ordinary killer cage summing to 15 instead.
//
// Negative diagonal (R1C1-R9C9): digits do not repeat.
// German whisper (R3C8-R3C9): adjacent digits differ by at least 5.
// Dutch whisper (R4C1-R4C2): adjacent digits differ by at least 4.
// White dot (R5C5-R5C6): digits are consecutive.
// Black dot (R8C5-R8C6): one digit is double the other.
// V (R1C4-R1C5): digits sum to 5.
// X (R7C2-R7C3): digits sum to 10.
// Grey squares (R7C7, R7C8): the digit is even.

const ENTROPY = v => (v <= 3) ? 0 : (v <= 6) ? 1 : 2;
const pointerValue = (x, y) => ENTROPY(x) * 3 + ENTROPY(y);

// Each entry is [X-cell, Y-cell]; the cage reads left to right as X then Y.
const pointerCages = [
  ['R1C4', 'R1C5'],
  ['R4C1', 'R4C2'],
  ['R7C2', 'R7C3'],
  ['R5C5', 'R5C6'],
  ['R7C7', 'R7C8'],
  ['R8C5', 'R8C6'],
  ['R3C8', 'R3C9'],
];

const pointerConstraints = pointerCages.map(([a, b]) => {
  const branches = [];
  for (let x = 1; x <= 9; x++) {
    for (let y = 1; y <= 9; y++) {
      const v = pointerValue(x, y);
      if (v < 1 || v > 9) continue;
      const target = makeCellId(x, y);
      const givens = [new Given(a, x), new Given(b, y)];
      if (target === a) {
        if (x !== v) continue;
      } else if (target === b) {
        if (y !== v) continue;
      } else {
        givens.push(new Given(target, v));
      }
      branches.push(new And(givens));
    }
  }
  return new Or(branches);
});

// No two cages may point at the same cell: for every pair of cages, their
// (X, Y) coordinate pairs must differ in the row cell or the column cell.
const neqKey = Pair.fnToKey((a, b) => a !== b, 9);
const distinctTargets = [];
for (let i = 0; i < pointerCages.length; i++) {
  for (let j = i + 1; j < pointerCages.length; j++) {
    const [ai, bi] = pointerCages[i];
    const [aj, bj] = pointerCages[j];
    distinctTargets.push(new Or([
      new Pair(neqKey, 'diffRow', ai, aj),
      new Pair(neqKey, 'diffCol', bi, bj),
    ]));
  }
}

return [
  new Shape('9x9'),
  new Given('R3C1', 6),

  new Diagonal(-1),
  new Whisper(5, 'R3C8', 'R3C9'),
  new Whisper(4, 'R4C1', 'R4C2'),
  new WhiteDot('R5C5', 'R5C6'),
  new BlackDot('R8C5', 'R8C6'),
  new V('R1C4', 'R1C5'),
  new X('R7C2', 'R7C3'),
  new Given('R7C7', 2, 4, 6, 8),
  new Given('R7C8', 2, 4, 6, 8),
  new Cage(15, 'R9C8', 'R9C9'),

  ...pointerConstraints,
  ...distinctTargets,
];
