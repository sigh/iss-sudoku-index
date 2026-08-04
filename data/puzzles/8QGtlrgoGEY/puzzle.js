// Title: Staurolite
// Author: Bellsita & Dumediat
// Video: https://www.youtube.com/watch?v=8QGtlrgoGEY
// Source: https://app.crackingthecryptic.com/sudoku/76PJ4T2JtF

// Normal sudoku rules apply. V-marked edges sum to 5 or 15 and X-marked
// edges sum to 10 or 15 (redefined from the usual 5/10). Not all possible
// V/X pairs are drawn, so an undrawn pair carries no constraint -- only the
// drawn edges below apply.
//
// Seven cages are "psycho look-and-say" cages: digits inside one cage
// cannot repeat, and a cage cell holding digit d "refers" to the cell
// inside box d (1-9, left-to-right/top-to-bottom) sitting at the same
// row/col offset within its box that the cage cell sits within its own box.
// This reading is fixed by the rules' own worked example: box 2's R1C5 = 4
// refers to box 4's R4C2, and box 2's R2C5 = 5 refers to box 5's R5C5 --
// `referredCell` below reproduces exactly those two cells. Each cage's
// 2-digit clue is a look-and-say pair (first digit = count, second =
// digit); every clue in this puzzle is exactly two digits, so no other
// reading applies. A referred cell may coincide with its own cage cell
// (when d equals the cage cell's own box number) -- the rules call this
// "self-referencing" and it still counts, which falls out for free below
// since the referred value is always read directly off the grid.

const graph = cellGraph('9x9');

// Referred cell for a cage cell at `cellId` if it holds digit `d`: same
// row/col offset within box `d` as `cellId` has within its own box.
function referredCell(cellId, d) {
  const { row, col } = parseCellId(cellId);
  const posInBoxRow = (row - 1) % 3;
  const posInBoxCol = (col - 1) % 3;
  const boxRow = Math.floor((d - 1) / 3);
  const boxCol = (d - 1) % 3;
  return makeCellId(boxRow * 3 + posInBoxRow + 1, boxCol * 3 + posInBoxCol + 1);
}

// Drawn X edges (sum 10 or 15) and V edges (sum 5 or 15). Provenance: the
// twelve "X"/"V" text overlays, each centred on one shared cell edge.
const xEdges = [
  ['R2C3', 'R3C3'], ['R3C7', 'R3C8'], ['R5C6', 'R5C7'],
  ['R7C7', 'R8C7'], ['R7C2', 'R7C3'], ['R6C5', 'R7C5'],
];
const vEdges = [
  ['R5C3', 'R5C4'], ['R7C3', 'R8C3'], ['R7C7', 'R7C8'],
  ['R2C7', 'R3C7'], ['R3C5', 'R4C5'], ['R3C2', 'R3C3'],
];
const xKey = Pair.fnToKey((a, b) => a + b === 10 || a + b === 15, 9);
const vKey = Pair.fnToKey((a, b) => a + b === 5 || a + b === 15, 9);

// Cages: cells (provenance: the `cages` array) and their look-and-say clue,
// decoded as (count, digit).
const cages = [
  { cells: ['R1C5', 'R2C5'], count: 1, digit: 2 },
  { cells: ['R2C3', 'R3C3', 'R3C2'], count: 3, digit: 9 },
  { cells: ['R2C7', 'R3C7', 'R3C8'], count: 3, digit: 4 },
  { cells: ['R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'], count: 2, digit: 5 },
  { cells: ['R7C2', 'R7C3', 'R8C3'], count: 3, digit: 3 },
  { cells: ['R7C7', 'R7C8', 'R8C7'], count: 3, digit: 2 },
  { cells: ['R8C5', 'R9C5'], count: 1, digit: 5 },
];

// For each cage cell, an off-grid Var (`refs`) holds the value of its
// referred cell. One `Or` of 9 branches per cage cell ties the Var to
// whichever of the 9 candidate referred cells actually applies, selected by
// that cell's own digit (`Given` picks the branch, `SameValues` copies the
// referred cell's value into the Var) -- the Var-selects-an-alternative
// pattern from data/scripts/rectangle_sums.js. The final `ContainExact`
// then reads the look-and-say count directly off those Vars.
const cageConstraints = cages.flatMap(({ cells, count, digit }, ci) => {
  // One upper-case letter per cage (A-G, 7 cages) -- Var prefixes must be
  // upper-case letters only.
  const prefix = String.fromCharCode(65 + ci);
  const refs = new Var(prefix, `cage ${ci} referred values`, cells.length);
  const links = cells.map((cell, i) => new Or(
    Array.from({ length: 9 }, (_, d0) => {
      const d = d0 + 1;
      return new And([
        new Given(cell, d),
        new SameValues(2, refs.cell(i + 1), referredCell(cell, d)),
      ]);
    })
  ));
  return [
    new AllDifferent(...cells),
    refs,
    ...links,
    new ContainExact(Array(count).fill(digit).join('_'), ...refs.cells()),
  ];
});

return [
  new Shape('9x9'),
  ...xEdges.map(e => new Pair(xKey, 'X (10 or 15)', ...e)),
  ...vEdges.map(e => new Pair(vKey, 'V (5 or 15)', ...e)),
  ...cageConstraints,
];
