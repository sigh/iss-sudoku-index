// Title: You Don't Belong
// Author: Tambooch
// Video: https://www.youtube.com/watch?v=bb-vdnIlgIg
// Source: https://app.crackingthecryptic.com/sudoku/MQ6G6HmMbb

// Normal sudoku rules apply.
// For a digit X in a cell, look at the region of up to 9 cells immediately
// around and including that cell (the cell plus every in-grid king-move
// neighbour: 4 cells in a corner, 6 on an edge, 9 in the interior). Count how
// many cells in that region hold a digit of the same parity as X (the cell
// itself always counts, since it shares its own parity).
//   - count == X and X odd  -> a blue circle is given there
//   - count == X and X even -> a blue square is given there
// All circles/squares are given, so every other cell must NOT satisfy
// count == X. This is one NFA per grid cell below: `eqSpec` at a marked
// cell, `neqSpec` everywhere else.
// Every digit 1-9 also appears on at least one blue circle/square
// (`ContainAtLeast` at the end).

const graph = cellGraph();
const allCells = graph.cells();

// Marked cells, read from the payload's `overlays` (`rounded: true` =>
// circle, `rounded: false` => square; every overlay is the same blue,
// borderColor #34BBE6).
const circleCells = ['R2C6', 'R3C7', 'R4C8', 'R4C4', 'R9C1', 'R7C3', 'R5C5'];
const squareCells = ['R4C3', 'R6C6', 'R7C6', 'R8C2', 'R5C3', 'R7C5'];
const markers = new Map([
  ...circleCells.map(c => [c, 'circle']),
  ...squareCells.map(c => [c, 'square']),
]);

// NFA state: {target, count}. The first cell read (the region's own cell)
// sets `target` to its digit and starts `count` at 1 (a cell always matches
// its own parity). Each further region cell adds 1 to `count` when its
// parity matches `target`'s. `count` is clamped at target+1 once it can only
// ever mean "too many", keeping the compiled state space small (target in
// 1-9, count in 0..target+1).
function countSpec(requireEqual) {
  return NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      if (target === null) return { target: value, count: 1 };
      const sameParity = (value % 2) === (target % 2);
      return {
        target,
        count: Math.min(count + (sameParity ? 1 : 0), target + 1),
      };
    },
    accept: ({ target, count }) =>
      requireEqual ? count === target : count !== target,
  }, 9);
}
const eqSpec = countSpec(true);
const neqSpec = countSpec(false);

// One NFA per grid cell, scanning that cell's own region: itself plus its
// king-move neighbours on the grid.
const regionNFAs = allCells.map(cell => {
  const region = [cell, ...graph.kingNeighbours(cell)];
  const spec = markers.has(cell) ? eqSpec : neqSpec;
  return new NFA(spec, cell, ...region);
});

return [
  new Shape('9x9'),
  new Given('R1C9', 7),
  new Given('R4C6', 1),
  // A circle only ever marks an odd digit meeting the count, a square only
  // an even one -- restricted here as candidates (see rules above).
  ...circleCells.map(c => new Given(c, 1, 3, 5, 7, 9)),
  ...squareCells.map(c => new Given(c, 2, 4, 6, 8)),
  ...regionNFAs,
  new ContainAtLeast('1_2_3_4_5_6_7_8_9', ...circleCells, ...squareCells),
];
