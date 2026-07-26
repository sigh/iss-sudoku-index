// Title: Sigma or Pi
// Author: Sudokun
// Video: https://www.youtube.com/watch?v=oivGrYgKBM0
// Source: https://sudokupad.app/5kx4d90kcm

// Normal sudoku (default 3x3 boxes, matching the drawn regions). Every dashed
// cage forbids repeated digits, and is either a killer cage (digits sum to
// the corner total) or a product cage (digits multiply to it) -- the type is
// not given and must be deducible. Encoded per cage as
// Or(killer reading, product reading), so the solver is free to satisfy
// either.

// Cage cell lists and totals, transcribed from the drawn cage outlines and
// their corner totals (SudokuPad payload).
const cages = [
  [30, 'R4C4', 'R4C5', 'R4C6', 'R5C4'],
  [30, 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
  [10, 'R1C1', 'R1C2'],
  [10, 'R2C1', 'R2C2'],
  [10, 'R3C1', 'R3C2', 'R3C3'],
  [12, 'R8C1', 'R9C1'],
  [12, 'R9C2', 'R9C3'],
  [15, 'R7C7', 'R7C8'],
  [15, 'R3C7', 'R3C8'],
  [16, 'R1C7', 'R1C8'],
  [16, 'R9C7', 'R9C8'],
  [14, 'R8C9', 'R9C9'],
  [12, 'R1C9', 'R2C9'],
  [20, 'R4C7', 'R5C7', 'R6C7'],
  [24, 'R5C1', 'R5C2', 'R5C3'],
  [12, 'R7C1', 'R7C2', 'R7C3'],
  [12, 'R8C2', 'R8C3'],
  [12, 'R8C4', 'R9C4'],
  [10, 'R1C3', 'R1C4'],
  [10, 'R2C3', 'R2C4'],
  [6, 'R6C8', 'R6C9'],
  [6, 'R4C1', 'R4C2'],
];

// Product-cage reading (3+ cells): accepts a cage's digits iff their product
// equals `target`. Every digit is >= 1, so the running product never
// decreases; pruning any partial product once it exceeds `target` keeps the
// machine small regardless of cage size.
function productCageNFA(target) {
  return NFA.encodeSpec({
    startState: 1,
    transition: (product, value) => {
      const next = product * value;
      if (next > target) return undefined;
      return next;
    },
    accept: product => product === target,
  }, 9);
}

// Product-cage reading for a 2-cell cage: a single binary predicate covers
// both "different digits" and "product == target".
function productPairKey(target) {
  return Pair.fnToKey((a, b) => a !== b && a * b === target, 9);
}

const productReading = (target, cells) => cells.length === 2
  ? new Pair(productPairKey(target), `product pair (${target})`, ...cells)
  : new And([
    new AllDifferent(...cells),
    new NFA(productCageNFA(target), `product cage (${target})`, ...cells),
  ]);

return [
  new Shape('9x9'),
  ...cages.map(([target, ...cells]) => new Or([
    // Killer reading: digits sum to target, all different.
    new Cage(target, ...cells),
    // Product reading: digits multiply to target, all different.
    productReading(target, cells),
  ])),
];
