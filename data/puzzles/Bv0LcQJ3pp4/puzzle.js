// Title: Untitled by Phistomefel
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=Bv0LcQJ3pp4
// Source: https://cracking-the-cryptic.web.app/sudoku/22L4D2GTDN

// Normal sudoku rules apply. Digits cannot repeat within cages, and the
// digits in each cage must sum to a multiple of 13. No cage prints a total.
// Cage() enforces AllDifferent plus one fixed total, so each cage is
// modelled as Or() over every multiple of 13 its size can actually reach:
// with k distinct digits from 1-9, the minimum possible sum is 1+2+...+k
// and the maximum is the k largest digits, (10-k)+...+9.
//   size 2: range 3-17  -> only 13 is reachable
//   size 3: range 6-24  -> only 13
//   size 4: range 10-30 -> 13 or 26
//   size 5: range 15-35 -> only 26
//   size 6: range 21-39 -> 26 or 39
const MULTIPLES_OF_13_BY_SIZE = {
  2: [13],
  3: [13],
  4: [13, 26],
  5: [26],
  6: [26, 39],
};

function multipleOf13Cage(cells) {
  const totals = MULTIPLES_OF_13_BY_SIZE[cells.length];
  if (!totals) throw new Error('unexpected cage size ' + cells.length);
  return new Or(totals.map(total => new Cage(total, ...cells)));
}

// Cage outlines transcribed from the puzzle's drawn cage borders; none
// carries a printed total. Ten grid cells are not enclosed by any cage and
// so carry no cage rule beyond normal sudoku.
const cages = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C3'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R7C2', 'R8C2'],
  ['R9C2', 'R9C3', 'R8C3', 'R7C3'],
  ['R6C2', 'R5C2', 'R4C2', 'R4C3', 'R5C3'],
  ['R6C3', 'R6C4'],
  ['R7C4', 'R8C4', 'R8C5', 'R9C5'],
  ['R7C5', 'R7C6', 'R6C5'],
  ['R8C6', 'R9C6'],
  ['R4C4', 'R5C4', 'R5C5', 'R4C5', 'R5C6', 'R4C6'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C5', 'R2C6', 'R3C6'],
  ['R2C7', 'R3C7'],
  ['R4C7', 'R5C7', 'R6C7', 'R6C6'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C8'],
  ['R3C9', 'R3C8', 'R4C8'],
  ['R6C9', 'R6C8', 'R7C8', 'R7C7'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'],
  ['R2C2', 'R3C2', 'R3C3'],
];

return [
  new Shape('9x9'),
  ...cages.map(multipleOf13Cage),
];
