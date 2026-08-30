// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=oofasY5HEY8
// Source: https://cracking-the-cryptic.web.app/sudoku/LbmQmPRL34

// A Calcudoku (Kenken): standard row/column Latin-square rules apply (each
// digit 1-9 once per row and once per column), and there are no 3x3 boxes.
// The grid is divided into 29 cages; each carries an operation and a target.
// Digits combine under that operation to reach the target, and may repeat
// within a cage except where the row/column rule already forbids it (so
// cage cells are *not* all-different the way a killer cage would be).
// '-' and divide cages are always exactly 2 cells, per the convention: take
// the absolute difference, or the larger divided by the smaller.

// [op, target, cells] per drawn cage. Provenance: each cage's cells are one
// drawn `regions[]` polyomino paired with the nearest `overlays[]` text by
// cell containment. One entry in the raw payload's `regions` array in fact
// concatenates two disjoint cages' cell lists (the 'sum',7 and 'product',20
// cages below); the two were told apart by which overlay lands in which of
// the entry's two connected components.
const cages = [
  ['sum', 21, ['R1C1', 'R2C1', 'R3C1', 'R4C1']],
  ['sum', 7, ['R1C2', 'R1C3', 'R1C4', 'R2C2']],
  ['product', 80, ['R1C5', 'R1C6', 'R2C5']],
  ['product', 756, ['R1C7', 'R1C8', 'R1C9', 'R2C9']],
  ['sum', 14, ['R2C3', 'R2C4', 'R3C4']],
  ['product', 30, ['R2C6', 'R2C7']],
  ['product', 168, ['R2C8', 'R3C8', 'R4C7', 'R4C8']],
  ['product', 108, ['R3C2', 'R3C3', 'R4C2']],
  ['sum', 15, ['R3C5', 'R3C6']],
  ['product', 42, ['R3C9', 'R4C9']],
  ['product', 56, ['R4C3', 'R4C4', 'R5C4']],
  ['diff', 1, ['R4C5', 'R5C5']],
  ['product', 20, ['R4C6', 'R5C6']],
  ['sum', 17, ['R5C1', 'R6C1', 'R7C1', 'R8C1']],
  ['sum', 8, ['R5C2', 'R6C2']],
  ['product', 240, ['R5C3', 'R6C3', 'R7C3']],
  ['sum', 22, ['R5C7', 'R5C8', 'R5C9']],
  ['product', 504, ['R6C4', 'R6C5', 'R7C4', 'R7C5']],
  ['sum', 13, ['R6C6', 'R6C7', 'R7C6', 'R7C7']],
  ['sum', 9, ['R6C8', 'R7C8']],
  ['quot', 4, ['R6C9', 'R7C9']],
  ['sum', 15, ['R7C2', 'R8C2']],
  ['sum', 24, ['R8C3', 'R9C1', 'R9C2', 'R9C3']],
  ['diff', 3, ['R8C4', 'R9C4']],
  ['product', 189, ['R8C5', 'R8C6', 'R9C5', 'R9C6']],
  ['sum', 8, ['R8C7', 'R8C8']],
  ['quot', 4, ['R8C9', 'R9C9']],
  ['product', 20, ['R9C7', 'R9C8']],
];

// A 2-cell product cage is a plain pairwise relation (no NFA needed). A
// 3-or-4-cell one runs a running-product NFA: state is the product so far
// (pruned once it exceeds the target), accepting exactly when it lands on
// the target.
function productCage(target, cells) {
  if (cells.length === 2) {
    return new Pair(
      Pair.fnToKey((a, b) => a * b === target, 9),
      `product ${target}`, ...cells);
  }
  const spec = NFA.encodeSpec({
    startState: 1,
    transition: (state, value) => {
      const next = state * value;
      if (next > target) return;
      return next;
    },
    accept: state => state === target,
  }, 9);
  return new NFA(spec, `product cage (target ${target})`, ...cells);
}

return [
  new Shape('9x9'),
  new NoBoxes(),

  new Given('R3C7', 2),

  ...cages.flatMap(([op, target, cells]) => {
    switch (op) {
      case 'sum':
        // Repeats allowed within the cage; only Sum expresses that (Cage
        // would add an unwanted all-different over the whole cage).
        return [new Sum(target, ...cells)];
      case 'product':
        return [productCage(target, cells)];
      case 'diff': {
        const [a, b] = cells;
        // A difference-1 cage on two orthogonally adjacent cells is exactly
        // the Kropki white dot relation; use the native class.
        if (target === 1) return [new WhiteDot(a, b)];
        return [new Pair(
          Pair.fnToKey((x, y) => Math.abs(x - y) === target, 9),
          `diff ${target}`, a, b)];
      }
      case 'quot': {
        const [a, b] = cells;
        return [new Pair(
          Pair.fnToKey((x, y) => {
            const hi = Math.max(x, y), lo = Math.min(x, y);
            return hi % lo === 0 && hi / lo === target;
          }, 9),
          `quotient ${target}`, a, b)];
      }
    }
  }),
];
