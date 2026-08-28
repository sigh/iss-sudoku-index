// Title: Cage Fight Killer Sudoku
// Author: Scoriano
// Video: https://www.youtube.com/watch?v=CLeGuy7G9uY
// Source: https://cracking-the-cryptic.web.app/sudoku/LmGLhRTHj2

// Normal sudoku rules apply: standard rows, columns and 3x3 boxes each hold
// 1-9 once (default Shape regions, matching the payload's own `regions`).
//
// Cage rule: in each cage, the sum of every cell holding the cage's largest
// digit value equals the sum of the cage's other cells; digits may repeat
// within a cage, so no cage gets an AllDifferent.
//
// Diagonal rule: the outside "42" clue gives the sum of the marked diagonal;
// digits may repeat along it too.

// CageBalance NFA: state carries the running max digit seen in the cage
// (`max`), the sum of cells tied at that max (`sumAtMax`), and the running
// total (`sum`). On a new strictly-larger digit the old `sumAtMax` simply
// stops being tracked separately -- it is still present in `sum`, which is
// all `accept` needs -- so the final state is order-independent: after all
// cells are read, `max` is the cage's true largest digit, `sumAtMax` is the
// sum of its instances, and `sum` is the cage total. `accept` then checks
// sumAtMax * 2 === sum, i.e. sum of max-instances equals sum of the rest.
const cageBalanceSpec = {
  startState: { max: null, sumAtMax: 0, sum: 0 },
  transition: ({ max, sumAtMax, sum }, value) => {
    if (max === null) return { max: value, sumAtMax: value, sum: value };
    if (value > max) return { max: value, sumAtMax: value, sum: sum + value };
    if (value === max) return { max, sumAtMax: sumAtMax + value, sum: sum + value };
    return { max, sumAtMax, sum: sum + value };
  },
  accept: ({ max, sumAtMax, sum }) => max !== null && sumAtMax * 2 === sum,
  // Without a bound the compiler treats the tape as arbitrarily long and
  // `sum` never stops growing into new states; 12 is the largest cage size.
  maxDepth: 12,
};
const cageBalanceNFA = NFA.encodeSpec(cageBalanceSpec, /* numValues= */ 9);

// Cage cell lists transcribed from the payload's `cages` array (0-indexed
// [row, col] pairs converted to R#C#). Every grid cell is in exactly one
// cage except the given R5C5.
const cages = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C3'],
  ['R2C1', 'R2C2', 'R3C1', 'R4C1', 'R5C1'],
  ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C4', 'R2C5', 'R2C6', 'R3C2', 'R3C3', 'R3C4', 'R3C6', 'R4C2'],
  ['R5C2', 'R6C1', 'R6C2'],
  ['R7C1', 'R7C2', 'R8C1'],
  ['R8C2', 'R9C1', 'R9C2'],
  ['R8C3', 'R8C4', 'R9C3'],
  ['R5C3', 'R6C3', 'R7C3'],
  ['R7C5', 'R8C5', 'R9C4', 'R9C5'],
  ['R3C5', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C6', 'R5C7', 'R6C4', 'R6C5', 'R6C6', 'R7C4'],
  ['R2C7', 'R3C7', 'R4C7'],
  ['R1C8', 'R1C9', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C7', 'R6C8', 'R7C8'],
  ['R2C9', 'R3C9', 'R4C9', 'R5C9'],
  ['R6C9', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C9'],
  ['R7C6', 'R7C7', 'R8C6', 'R9C6', 'R9C7', 'R9C8'],
];

// Diagonal cells, from the outside "42" overlay + arrow: the arrow's near
// waypoint sits equidistant between R2C1/R3C1, resolved to R3C1 by the
// arrow's own drawn down-right direction (matching the diagonal it points
// along, not the alternative up-one-row start).
const diagonalCells = ['R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7'];

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  new Sum(42, ...diagonalCells),
  ...cages.map(cells => new NFA(cageBalanceNFA, 'CageFight', ...cells)),
];
