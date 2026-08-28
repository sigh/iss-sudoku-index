// Title: This World-Class Sudoku Has Just One Given Digit!
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=ygCqTawsmsM
// Source: https://cracking-the-cryptic.web.app/sudoku/N7mQjb6RHq

// Normal sudoku rules apply (default row/col/box AllDifferent). In each
// outlined region, the sum of the odd digits equals the sum of the even
// digits, and digits cannot repeat in the region.
//
// This board is the colourblind version of the puzzle: it draws no digit at
// all, so the encoding has no Given. Five cells lie outside every outlined
// region (R3C4, R4C7, R5C5, R6C3, R7C6) and carry only normal sudoku.
// REGIONS is transcribed from the 17 drawn region outlines, in the order they
// are drawn; the trailing letter matches the region map in the description.
const REGIONS = [
  ['R1C1', 'R1C2', 'R2C1'], // A
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C6', 'R2C7'], // B
  ['R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C9'], // C
  ['R3C7', 'R3C8', 'R4C8'], // D
  ['R4C9', 'R5C9', 'R6C8', 'R6C9'], // E
  ['R5C7', 'R5C8', 'R6C7'], // F
  ['R7C7', 'R7C8', 'R7C9', 'R8C8', 'R8C9'], // G
  ['R8C6', 'R8C7', 'R9C6'], // H
  ['R9C7', 'R9C8', 'R9C9'], // I
  ['R6C5', 'R7C5', 'R8C5', 'R9C5'], // J
  ['R5C4', 'R6C4', 'R7C3', 'R7C4', 'R8C4', 'R9C3', 'R9C4'], // K
  ['R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6'], // L
  ['R2C3', 'R3C3', 'R4C2', 'R4C3'], // M
  ['R2C2', 'R3C1', 'R3C2', 'R4C1'], // N
  ['R5C1', 'R5C2', 'R5C3', 'R6C2'], // O
  ['R6C1', 'R7C1', 'R7C2', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2'], // P
  ['R2C4', 'R2C5', 'R3C5', 'R3C6'], // Q
];

// "Sum of odd digits = sum of even digits" is not a fixed-coefficient linear
// sum (each digit's sign depends on its own parity), so it is read as a
// regular language over the region's cells in an arbitrary fixed order (the
// condition is order-independent): track the running signed value
// diff = (sum of odd digits so far) - (sum of even digits so far), and accept
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
  ...REGIONS.map((cells) => new AllDifferent(...cells)),
  ...REGIONS.map((cells) => new NFA(oddEvenEqualSpec, 'odd=even sum', ...cells)),
];
