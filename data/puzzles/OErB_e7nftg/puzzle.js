// Title: Overkill
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=OErB_e7nftg
// Source: https://app.crackingthecryptic.com/sudoku/qbGThhnqM9

// Normal sudoku rules. Nine cells -- one per row/column/box -- are Doublers.
// VD is a parallel flag layer: 1 means an ordinary cell, 2 means a Doubler.
// Every cage-sum reads digit * flag as the cell's effective value.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const cells = graph.cells();
const flag = cell => flags.at(cell);
const interleave = clueCells => clueCells.flatMap(cell => [cell, flag(cell)]);

// Exactly one Doubler per digit: scans every grid cell's digit/flag pair and
// accepts iff digit `d` is seen under a flag of 2 exactly once.
const doubledDigitSpec = digit => NFA.encodeSpec({
  startState: { phase: 'digit', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value, count: state.count };
    }
    if (value !== 1 && value !== 2) return undefined;
    const count = state.count + (state.digit === digit && value === 2 ? 1 : 0);
    if (count > 1) return undefined;
    return { phase: 'digit', count };
  },
  accept: state => state.phase === 'digit' && state.count === 1,
}, 9);

// Cage sum over effective values: scans a cage's digit/flag pairs and
// accepts iff the running sum of digit*flag equals `total` after all cells.
const cageSumSpec = (total, size) => NFA.encodeSpec({
  startState: { phase: 'digit', sum: 0, count: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value, sum: state.sum, count: state.count };
    }
    if (value !== 1 && value !== 2) return undefined;
    const sum = state.sum + state.digit * value;
    if (sum > total) return undefined;
    return { phase: 'digit', sum, count: state.count + 1 };
  },
  accept: state => state.phase === 'digit' && state.count === size && state.sum === total,
  maxDepth: size * 2,
}, 9);

// Cages (cells, total): transcribed from the puzzle's drawn cage geometry.
const cages = [
  { total: 16, cells: ['R7C1', 'R8C1', 'R8C2', 'R9C2', 'R9C3'] },
  { total: 52, cells: ['R7C2', 'R7C3', 'R6C3', 'R7C4', 'R7C5', 'R6C5', 'R8C4', 'R9C4'] },
  { total: 53, cells: ['R5C4', 'R5C3', 'R4C3', 'R4C2', 'R4C1', 'R3C3', 'R2C3', 'R3C4'] },
  { total: 30, cells: ['R3C1', 'R2C1', 'R2C2', 'R1C2', 'R1C3'] },
  { total: 60, cells: ['R1C6', 'R2C6', 'R3C6', 'R3C5', 'R4C5', 'R3C7', 'R4C7', 'R3C8'] },
  { total: 34, cells: ['R1C7', 'R1C8', 'R2C8', 'R2C9', 'R3C9'] },
  { total: 55, cells: ['R5C6', 'R5C7', 'R6C7', 'R7C7', 'R7C6', 'R8C7', 'R6C8', 'R6C9'] },
  { total: 33, cells: ['R7C9', 'R8C9', 'R8C8', 'R9C8', 'R9C7'] },
];

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flag(cells[0]), 1, 2), flags.at(cells)),

  // Nine flags sum to 10 exactly when one cell in the group is doubled
  // (eight ordinary flags of 1 plus one Doubler flag of 2).
  ...graph.rows().map(row => new Sum(10, ...flags.at(row))),
  ...graph.columns().map(column => new Sum(10, ...flags.at(column))),
  ...graph.boxes().map(box => new Sum(10, ...flags.at(box))),

  // Each digit appears in exactly one Doubler cell.
  ...Array.from({ length: 9 }, (_, i) => new NFA(
    doubledDigitSpec(i + 1), `doubled digit ${i + 1}`, ...interleave(cells))),

  // Cages: digits do not repeat (raw digit), and sum to the total using
  // doubled effective values.
  ...cages.map(cage => new AllDifferent(...cage.cells)),
  ...cages.map(cage => new NFA(
    cageSumSpec(cage.total, cage.cells.length),
    `cage sum ${cage.total}`,
    ...interleave(cage.cells),
  )),
];
