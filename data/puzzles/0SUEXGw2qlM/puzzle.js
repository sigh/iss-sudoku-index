// Title: Quantum Entanglement
// Author: Scojo
// Video: https://www.youtube.com/watch?v=0SUEXGw2qlM
// Source: https://sudokupad.app/9ryz1zmsa7

// Rules encoded here:
//  - Normal sudoku: 1-9 once each per row, column and 3x3 box (ISS baseline).
//  - Entangled cages: every cage is paired with exactly one other cage of the
//    same colour; digits may not repeat within a pair of cages; the digits of
//    a pair sum to a concatenation of the two numbers printed in the cages'
//    top-left corners, in either order, with a leading 0 allowed. For corner
//    numbers a and b that total is 10*a + b or 10*b + a.
//  - Kropki: digits separated by a white dot are consecutive. The rules say
//    not all possible dots are shown, so there is no negative constraint to
//    encode and the plain (non-strict) dot class is what the rule asks for.
// Nothing is omitted.

// Drawn data: the 34 cage outlines, each with the colour it is drawn in and
// the number printed in its top-left corner. The corner number is a label for
// the entanglement rule, never the cage's own sum.
const CAGES = [
  { colour: 'red', label: 2, cells: ['R1C1', 'R2C1'] },
  { colour: 'red', label: 4, cells: ['R1C3', 'R2C3', 'R3C3'] },
  { colour: 'red', label: 0, cells: ['R2C2', 'R3C2'] },
  { colour: 'red', label: 6, cells: ['R5C1'] },
  { colour: 'red', label: 1, cells: ['R6C2'] },
  { colour: 'red', label: 8, cells: ['R4C3', 'R5C3'] },
  { colour: 'red', label: 9, cells: ['R6C3', 'R6C4'] },
  { colour: 'red', label: 3, cells: ['R4C7', 'R4C8', 'R4C9', 'R5C9', 'R6C7', 'R6C8', 'R6C9'] },
  { colour: 'red', label: 5, cells: ['R7C2', 'R7C3', 'R8C2', 'R8C3', 'R9C2', 'R9C3'] },
  { colour: 'red', label: 7, cells: ['R8C7'] },
  { colour: 'cyan', label: 9, cells: ['R3C1'] },
  { colour: 'cyan', label: 1, cells: ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5'] },
  { colour: 'cyan', label: 1, cells: ['R1C8', 'R1C9', 'R2C8', 'R2C9'] },
  { colour: 'cyan', label: 2, cells: ['R6C5', 'R7C5', 'R8C5', 'R9C5'] },
  { colour: 'cyan', label: 3, cells: ['R6C6'] },
  { colour: 'cyan', label: 8, cells: ['R5C7'] },
  { colour: 'green', label: 3, cells: ['R1C7', 'R2C7', 'R3C7'] },
  { colour: 'green', label: 2, cells: ['R3C8', 'R3C9'] },
  { colour: 'green', label: 9, cells: ['R7C1', 'R8C1', 'R9C1'] },
  { colour: 'green', label: 9, cells: ['R7C7', 'R7C8', 'R8C8', 'R9C7', 'R9C8'] },
  { colour: 'gold', label: 1, cells: ['R1C2'] },
  { colour: 'gold', label: 1, cells: ['R2C6'] },
  { colour: 'gold', label: 9, cells: ['R4C2', 'R5C2'] },
  { colour: 'gold', label: 1, cells: ['R5C8'] },
  { colour: 'gold', label: 2, cells: ['R7C9', 'R8C9'] },
  { colour: 'gold', label: 0, cells: ['R9C9'] },
  { colour: 'purple', label: 7, cells: ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4'] },
  { colour: 'purple', label: 1, cells: ['R1C6'] },
  { colour: 'purple', label: 3, cells: ['R3C6', 'R4C6', 'R5C6'] },
  { colour: 'purple', label: 3, cells: ['R4C1'] },
  { colour: 'purple', label: 0, cells: ['R6C1'] },
  { colour: 'purple', label: 2, cells: ['R7C4', 'R8C4', 'R9C4'] },
  { colour: 'purple', label: 4, cells: ['R7C6'] },
  { colour: 'purple', label: 0, cells: ['R8C6', 'R9C6'] },
];

// Drawn data: the four white Kropki dots, as the cell pair each sits between.
const WHITE_DOTS = [
  ['R1C2', 'R1C3'],
  ['R1C2', 'R2C2'],
  ['R2C7', 'R2C8'],
  ['R6C2', 'R7C2'],
];

const NUM_VALUES = 9;

// Every way of splitting a colour's cages into unordered pairs, i.e. every
// perfect matching of the group. Nothing in the drawing says which cage pairs
// with which, so the rule is the disjunction over all of them.
const perfectMatchings = (cages) => {
  if (cages.length === 0) return [[]];
  const [first, ...rest] = cages;
  return rest.flatMap((partner, i) =>
    perfectMatchings(rest.filter((_, j) => j !== i))
      .map(matching => [[first, partner], ...matching]));
};

// The totals a pair may take: the two concatenations of its corner numbers,
// restricted to those n distinct digits from 1-9 can actually reach. n distinct
// digits sum to at least 1+2+...+n and at most 9+8+..., and there is no such
// set at all for n > 9, so a total outside that window (or an over-sized pair)
// admits no assignment. Dropping those leaves the disjunction unchanged while
// cutting the red group from 945 matchings to 4 and the purple from 105 to 11.
const pairTotals = (a, b, n) => {
  if (n > NUM_VALUES) return [];
  const minTotal = n * (n + 1) / 2;
  const maxTotal = n * (2 * NUM_VALUES - n + 1) / 2;
  return [...new Set([10 * a + b, 10 * b + a])].filter(
    total => total >= minTotal && total <= maxTotal);
};

// One Or per colour over that colour's matchings; within a matching, each pair
// contributes a Cage over the union of its two cages -- Cage is exactly
// "all-different plus this sum", which is the pair's no-repeats clause plus its
// total -- disjoined over the pair's admissible totals.
const entangledCages = [...new Set(CAGES.map(cage => cage.colour))].map(colour => {
  const branches = perfectMatchings(CAGES.filter(cage => cage.colour === colour))
    .map(matching => matching.map(([x, y]) => {
      const cells = [...x.cells, ...y.cells];
      return pairTotals(x.label, y.label, cells.length).map(
        total => new Cage(total, ...cells));
    }))
    .filter(pairs => pairs.every(totals => totals.length > 0))
    .map(pairs => new And(pairs.map(
      totals => totals.length === 1 ? totals[0] : new Or(totals))));
  return new Or(branches);
});

return [
  new Shape('9x9'),
  ...entangledCages,
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
];
