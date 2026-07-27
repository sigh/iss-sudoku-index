// Title: One Look Could Kill
// Author: yttrio
// Video: https://www.youtube.com/watch?v=qJhYQxSdffI
// Source: https://sudokupad.app/pmv1jze5n3

// Normal sudoku rules apply (standard rows/cols/boxes, from the default
// Shape('9x9')). Each of the 14 cages below carries no printed total; instead
// the cage's own digit sum S must be a two-digit number "AB" (tens digit A,
// units digit B) that is a valid "look-and-say" clue for the cage: the cage
// must contain exactly A cells equal to digit B, with the remaining cells
// holding any other digits (repeats allowed) so the whole cage sums to S.
// Digits may repeat within a cage -- required for e.g. "exactly two 1s".

// For a cage of size n, buildLookAndSay enumerates every two-digit S in
// [10, 9n] that is achievable: B = S % 10 must be a nonzero digit (S can't be
// a multiple of 10, since "0 copies of digit 0" is meaningless -- 0 is not a
// grid digit), A = floor(S / 10) copies of B must fit in the cage (A <= n),
// and the remaining (n - A) cells must be able to sum to S - A*B using
// digits 1-9 (bounds (n-A)*1 .. (n-A)*9). Each surviving (S, A, B) becomes one
// branch: Sum(S) pins the total, ContainExact(B x A) pins the exact count of
// B (and only B -- other digits are unconstrained by it). Exactly one branch
// is true in any valid completion, so Or over all branches is the rule.
const buildLookAndSay = (...cells) => {
  const n = cells.length;
  const branches = [];
  for (let sum = 10; sum <= 9 * n; sum++) {
    const a = Math.floor(sum / 10);
    const b = sum % 10;
    if (b === 0) continue;
    if (a > n) continue;
    const rest = sum - a * b;
    const restCells = n - a;
    if (rest < restCells * 1 || rest > restCells * 9) continue;
    branches.push(new And([
      new Sum(sum, ...cells),
      new ContainExact(Array(a).fill(b).join('_'), ...cells),
    ]));
  }
  return new Or(branches);
};

// Cages: drawn dashed regions (raw payload `cages[]`), none carry a total.
const cages = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'],
  ['R1C6', 'R1C7', 'R1C8', 'R2C6', 'R2C7', 'R3C7'],
  ['R1C9', 'R2C8', 'R2C9'],
  ['R2C1', 'R2C2', 'R3C1', 'R3C2'],
  ['R2C3', 'R3C3', 'R3C4'],
  ['R4C2', 'R5C2', 'R6C2', 'R7C2', 'R7C3'],
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4'],
  ['R8C3', 'R8C4', 'R8C5', 'R8C6', 'R9C5', 'R9C6'],
  ['R4C3', 'R5C3', 'R5C4', 'R6C3', 'R6C4'],
  ['R4C6', 'R4C7', 'R5C6'],
  ['R5C7', 'R6C7', 'R7C7', 'R8C7'],
  ['R8C9', 'R9C7', 'R9C8', 'R9C9'],
  ['R5C8', 'R5C9', 'R6C8', 'R7C8', 'R8C8'],
];

return [
  new Shape('9x9'),
  ...cages.map(cells => buildLookAndSay(...cells)),
];
