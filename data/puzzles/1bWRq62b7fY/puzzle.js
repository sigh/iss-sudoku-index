// Title: Numbers in Cages in Regions in a 6x6
// Author: PeterJoe
// Video: https://www.youtube.com/watch?v=1bWRq62b7fY
// Source: https://app.crackingthecryptic.com/GhG9BQQfG2

// Rules: place 1-6 in each row, column and marked 3x2 box. Digits in cages sum
// to the clue in the top-left corner, if given. N represents a number that must
// be deduced. Build regions such that all regions from sizes 1 to N are present
// exactly once. Cage totals also indicate the size of the region in which the
// cage resides. Every cell is in a region. Orthogonally adjacent regions must
// have sizes of opposite parity. Orthogonally adjacent cells in different
// regions must be of opposite parity.
//
// N = 8. The regions cover every cell and hold each size 1..N exactly once, so
// N*(N+1)/2 = 36, the cell count; N = 8 is the only solution.
//
// The regions are carried on a size overlay: VS holds the size of the region
// its cell belongs to. Because the sizes 1..8 occur once each, a size names its
// region uniquely: two cells share a region exactly when their VS values are
// equal, and "the region of size k" is the set of VS cells holding k.
//
// The value range is widened to 8 so the overlay can hold sizes 7 and 8; the
// grid cells are restricted back to 1-6. Widening does not move the boxes, so
// the default 6x6 tiling (2 rows x 3 columns) is the marked box tiling.

const N = 8;
const shape = new Shape('6x6', N);
const graph = cellGraph(shape);
const sizes = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Cages, transcribed from the drawn cages; `total` is the clue in the cage's
// top-left corner, null where no clue is printed. The 8 is the cage clued "N".
const cages = [
  { cells: ['R1C2', 'R1C3', 'R1C4'], total: N },
  { cells: ['R3C5', 'R3C6', 'R4C6'], total: null },
  { cells: ['R4C3'], total: 1 },
  { cells: ['R5C1', 'R5C2', 'R6C1'], total: null },
  { cells: ['R5C4', 'R6C4'], total: null },
  { cells: ['R6C6'], total: null },
];

// Every cage has a total -- the sum of its digits -- and that total is the size
// of the region the cage resides in, whether or not the total is printed. Each
// cage therefore lies wholly inside one region (its cells hold one size), and
// its digits sum to that size; a printed clue pins that same total directly.
// The four unprinted cages carry no other rule, and the drawn single-cell cage
// R6C6 has nothing to say at all unless its digit is read as its region's size.
const cageRules = cages.flatMap(({ cells, total }) => {
  const sizeCells = sizes.at(cells);
  return [
    ...(cells.length > 1
      ? [new SameValues(sizeCells.length, ...sizeCells)] : []),
    new EqualSum(cells, [sizeCells[0]]),
    ...(total === null ? [] : [new Sum(total, ...cells)]),
  ];
});

// One region of each size 1..N: the cells holding size k are orthogonally
// connected and there are exactly k of them. The sizes total 36, so every cell
// lands in exactly one region.
const regions = Array.from(
  { length: N }, (_, i) => new ConnectedValues('VS', i + 1, i + 1));

// Read [sizeA, sizeB, digitA, digitB] for one orthogonally adjacent pair.
// Equal sizes mean one region, and the rules then say nothing about the pair:
// the two digits are consumed unconstrained. Different sizes mean two adjacent
// regions, which forces both parity rules -- sizes of opposite parity, and
// digits of opposite parity.
const adjacentPair = NFA.encodeSpec({
  startState: { phase: 'sizeA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'sizeA':
        return { phase: 'sizeB', sizeA: value };
      case 'sizeB':
        if (value === state.sizeA) return { phase: 'skipA' };
        if ((value + state.sizeA) % 2 === 0) return undefined;
        return { phase: 'digitA' };
      case 'skipA':
        return { phase: 'skipB' };
      case 'skipB':
        return { phase: 'done' };
      case 'digitA':
        return { phase: 'digitB', parityA: value % 2 };
      case 'digitB':
        return value % 2 === state.parityA ? undefined : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);

const adjacencyRules = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [right, down].filter(other => other).map(other => new NFA(
    adjacentPair, 'adjacent-regions',
    sizes.at(cell), sizes.at(other), cell, other));
});

return [
  shape,
  // The overlay shares the widened range, so the grid keeps the real digits.
  ...gridCells.map(cell => new Given(cell, 1, 2, 3, 4, 5, 6)),
  sizes.toVar('region size'),
  ...regions,
  ...cageRules,
  ...adjacencyRules,
];
