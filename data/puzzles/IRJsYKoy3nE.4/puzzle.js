// Title: May 6, 2022: Full or Half
// Author: clover!
// Video: https://www.youtube.com/watch?v=IRJsYKoy3nE
// Source: https://tinyurl.com/5n6cz3d7
//
// Normal sudoku rules apply. Two marker shapes are drawn at 2x2 (four-cell)
// grid intersections: a square marker means the four cells hold exactly two
// even and two odd digits (in any arrangement); a circle marker means the
// four cells are all the same parity (all odd or all even). Each marker
// constrains only the four cells at its own intersection, independent of any
// other marker whose 2x2 block happens to overlap it.
//
// Each marker group is expressed as a disjunction over which of its four
// cells are restricted to the even digits {2,4,6,8} vs. the odd digits
// {1,3,5,7,9} in that branch: two branches (all-even / all-odd) for a circle,
// and one branch per 2-of-4 choice of which pair is even for a square.

const EVENS = [2, 4, 6, 8];
const ODDS = [1, 3, 5, 7, 9];

// Every 2-of-4 index choice, used to pick which pair of a square's four
// cells is even (the complementary pair is odd).
const TWO_OF_FOUR = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];

// Circle: all four cells at this 2x2 intersection are the same parity.
const sameParity = (...cells) => new Or([
  new And(cells.map(c => new Given(c, ...EVENS))),
  new And(cells.map(c => new Given(c, ...ODDS))),
]);

// Square: exactly two of the four cells at this 2x2 intersection are even,
// exactly two are odd (any arrangement).
const twoTwoParity = (...cells) => new Or(
  TWO_OF_FOUR.map(evenIdx => {
    const evenSet = new Set(evenIdx);
    return new And(cells.map((c, i) =>
      new Given(c, ...(evenSet.has(i) ? EVENS : ODDS))));
  })
);

// Circle marker cell blocks (drawn as round icons).
const circleGroups = [
  ['R3C1', 'R3C2', 'R4C1', 'R4C2'],
  ['R6C3', 'R6C4', 'R7C3', 'R7C4'],
  ['R6C7', 'R6C8', 'R7C7', 'R7C8'],
  ['R3C6', 'R3C7', 'R4C6', 'R4C7'],
];

// Square marker cell blocks (drawn as square icons, matching the rules
// text's "square" marker).
const squareGroups = [
  ['R3C2', 'R3C3', 'R4C2', 'R4C3'],
  ['R2C6', 'R2C7', 'R3C6', 'R3C7'],
  ['R4C3', 'R4C4', 'R5C3', 'R5C4'],
  ['R5C2', 'R5C3', 'R6C2', 'R6C3'],
  ['R7C3', 'R7C4', 'R8C3', 'R8C4'],
  ['R5C6', 'R5C7', 'R6C6', 'R6C7'],
  ['R4C7', 'R4C8', 'R5C7', 'R5C8'],
  ['R6C8', 'R6C9', 'R7C8', 'R7C9'],
];

return [
  new Shape('9x9'),

  // Givens: three diagonal 2x3 blocks of consecutive digits.
  new Given('R1C1', 1), new Given('R1C2', 2), new Given('R1C3', 3),
  new Given('R2C1', 4), new Given('R2C2', 5), new Given('R2C3', 6),
  new Given('R4C4', 1), new Given('R4C5', 2), new Given('R4C6', 3),
  new Given('R6C4', 7), new Given('R6C5', 8), new Given('R6C6', 9),
  new Given('R8C7', 4), new Given('R8C8', 5), new Given('R8C9', 6),
  new Given('R9C7', 7), new Given('R9C8', 8), new Given('R9C9', 9),

  ...circleGroups.map(cells => sameParity(...cells)),
  ...squareGroups.map(cells => twoTwoParity(...cells)),
];
