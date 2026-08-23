// Title: July 25, 2021: SquareShapedBox
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Ccic3LUfnZs
// Source: https://tinyurl.com/edvrt976

// Normal sudoku rules apply. Seven cages are drawn with no printed total.
// Within each cage digits cannot repeat, and must increase left-to-right
// along each of the cage's own rows and top-to-bottom along each of its own
// columns, per a worked 3x3 example accompanying the rule. Three cages
// coincide with a full box; the other four are 2x2 blocks, two of which
// straddle a box boundary.

const cages = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R2C4', 'R2C5', 'R3C4', 'R3C5'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
  ['R4C2', 'R4C3', 'R5C2', 'R5C3'],
  ['R8C3', 'R8C4', 'R9C3', 'R9C4'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  ['R3C8', 'R3C9', 'R4C8', 'R4C9'],
]; // cell lists transcribed from the puzzle's own drawn cage geometry

// Derive the increasing-order chains from the cage cell lists themselves
// (never hand-enumerated): within a cage, group its cells by row (sorted by
// column) and by column (sorted by row); each group of >= 2 cells is a
// strictly-increasing Thermo chain in that order, giving the row/column
// ordering the rule requires.
const increasingChains = [];
for (const cells of cages) {
  const parsed = cells.map(id => Object.assign({ id }, parseCellId(id)));

  const byRow = new Map();
  const byCol = new Map();
  for (const c of parsed) {
    if (!byRow.has(c.row)) byRow.set(c.row, []);
    byRow.get(c.row).push(c);
    if (!byCol.has(c.col)) byCol.set(c.col, []);
    byCol.get(c.col).push(c);
  }

  for (const group of byRow.values()) {
    if (group.length < 2) continue;
    group.sort((a, b) => a.col - b.col);
    increasingChains.push(new Thermo(...group.map(c => c.id)));
  }
  for (const group of byCol.values()) {
    if (group.length < 2) continue;
    group.sort((a, b) => a.row - b.row);
    increasingChains.push(new Thermo(...group.map(c => c.id)));
  }
}

// Omit AllDifferent for a cage that is exactly one full box: the default
// box constraint already enforces it, so a duplicate would be a lint-flagged
// redundancy rather than a distinct fact about this cage.
const isFullBox = cells => {
  if (cells.length !== 9) return false;
  const boxOf = id => {
    const { row, col } = parseCellId(id);
    return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
  };
  const box = boxOf(cells[0]);
  return cells.every(id => boxOf(id) === box);
};
const cageAllDifferent = cages
  .filter(cells => !isFullBox(cells))
  .map(cells => new AllDifferent(...cells));

return [
  new Shape('9x9'),

  new Given('R1C6', 5),
  new Given('R1C9', 6),
  new Given('R2C4', 3),
  new Given('R4C2', 2),
  new Given('R4C9', 8),
  new Given('R5C5', 6),
  new Given('R6C1', 4),
  new Given('R6C8', 7),
  new Given('R8C6', 8),
  new Given('R9C1', 6),
  new Given('R9C4', 7),

  ...cageAllDifferent,
  ...increasingChains,
];
