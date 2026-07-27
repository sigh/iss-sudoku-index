// Title: Archipelago
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=aQm-Ew0MG2Y
// Source: https://sudokupad.app/uy0r96nw2i

// Rules encoded, in full:
//   Normal sudoku. Every cell is either island or water. All water cells form
//   one orthogonally connected region. Every 2x2 block holds at least one cell
//   of each terrain. Each island holds exactly one clue, whose value is the
//   island's size multiplied by the sum of its digits. Digits within an island
//   do not repeat. Islands never touch, orthogonally or diagonally. A digit in
//   a circle equals the size of its island; not every such circle is drawn, so
//   the circles carry no negative constraint.
// Nothing is omitted.
//
// Terrain lives on the VL overlay, one Var per grid cell, holding either WATER
// or 1 + the index of the clue whose island the cell belongs to. Labelling
// islands by their clue is what makes "each island contains exactly one clue"
// structural: every island cell names a clue, and one ConnectedValues per
// label forces that label's cells into a single orthogonally connected region,
// so no island can be clueless, split, or hold two clues.

const WATER = 1;

// Clue totals, read from the number printed in the top-left corner of the
// cell that carries it.
const CLUES = [
  ['R7C1', 14], ['R7C3', 6], ['R9C6', 24], ['R4C4', 104],
  ['R2C1', 64], ['R9C1', 40], ['R6C6', 34], ['R1C4', 18],
  ['R5C8', 28], ['R2C6', 100], ['R3C8', 22], ['R9C9', 100],
];
// Cells carrying a drawn circle.
const CIRCLES = ['R6C1', 'R9C8', 'R4C1', 'R1C3', 'R5C4', 'R1C7'];

// The alphabet must hold WATER plus one label per island, so the value range is
// widened past the 9 digits and the grid cells are pinned back to 1-9 below.
const shape = new Shape('9x9', 1 + CLUES.length);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const terrain = graph.makeOverlay('VL');
const labelOf = (index) => index + 2;

// VZ<i> carries island i's size, which is what the circles read.
const sizeVar = new Var('Z', 'island size', CLUES.length);

// A clue is size x sum over `size` non-repeating digits, so `size` divides the
// clue and the quotient lies between the smallest and largest sums of that
// many distinct digits from 1-9.
const splitsOf = (clue) => {
  const splits = [];
  for (let size = 1; size <= 9; size++) {
    const sum = clue / size;
    if (!Number.isInteger(sum)) continue;
    if (sum < size * (size + 1) / 2) continue;
    if (sum > size * (19 - size) / 2) continue;
    splits.push({ size, sum });
  }
  return splits;
};

// An island is orthogonally connected and contains its clue cell, so a size-s
// island reaches no further than s-1 orthogonal steps from that clue. Every
// island rule below is scanned over this window only, which is sound only
// because the terrain domains further down forbid the label outside it.
const withinSteps = (fromCell, steps) => {
  const from = parseCellId(fromCell);
  return gridCells.filter(cell => {
    const to = parseCellId(cell);
    return Math.abs(from.row - to.row) + Math.abs(from.col - to.col) <= steps;
  });
};

const islands = CLUES.map(([clueCell, clue], index) => {
  const splits = splitsOf(clue);
  const maxSize = Math.max(...splits.map(s => s.size));
  return {
    clueCell, clue, splits,
    label: labelOf(index),
    sizeCell: sizeVar.cell(index + 1),
    window: withinSteps(clueCell, maxSize - 1),
  };
});

// Grid cells hold digits, not terrain labels.
const digitRange = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Each cell is water, or belongs to one of the islands that can reach it.
const terrainDomains = gridCells.map(cell => new Given(
  terrain.at(cell), WATER,
  ...islands.filter(i => i.window.includes(cell)).map(i => i.label)));

const cluePins = islands.map(
  island => new Given(terrain.at(island.clueCell), island.label));

// Islands do not touch: two adjacent cells are either the same island, or at
// least one of them is water. Applied along every row, column and diagonal, so
// that consecutive pairs cover all orthogonal and diagonal adjacencies.
const noTouchKey = Pair.fnToKey(
  (a, b) => a === WATER || b === WATER || a === b, geometry.numValues);
const diagonalStarts = [
  ...graph.row(1), ...graph.column(1).slice(1), ...graph.column(9).slice(1)];
const adjacencyLines = [
  ...graph.rows(),
  ...graph.columns(),
  ...diagonalStarts.map(cell => graph.ray(cell, 1, 1)),
  ...diagonalStarts.map(cell => graph.ray(cell, 1, -1)),
].filter(cells => cells.length > 1);
const noTouch = adjacencyLines.map(
  cells => new Pair(noTouchKey, 'islands do not touch', ...terrain.at(cells)));

// Every 2x2 block sees both terrains: count the four labels and require at
// least one WATER and at least one island label.
const mixedBlockMachine = NFA.encodeSpec({
  startState: { seen: 0, water: false, island: false },
  transition: ({ seen, water, island }, value) => (seen === 4 ? undefined : {
    seen: seen + 1,
    water: water || value === WATER,
    island: island || value !== WATER,
  }),
  accept: ({ seen, water, island }) => seen === 4 && water && island,
}, geometry.numValues);
const mixedBlocks = terrain.makeReplicate(
  new NFA(mixedBlockMachine, 'both terrains in every 2x2',
    ...terrain.at(graph.block(gridCells[0], 2, 2))),
  terrain.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// One machine per island per candidate size, scanning the island's window as
// alternating (terrain label, digit) pairs. This island's own label marks the
// following digit for collection; any other label makes the machine skip it.
// The collected digits must be distinct and must end at exactly the branch's
// cell count and digit total, which is the clue product and the no-repeat rule
// in one pass. `reading` tracks which half of a pair the machine is on: labels
// and digits share one alphabet, so the phase cannot be read off the value.
const islandMachine = (label, size, sum) => NFA.encodeSpec({
  startState: { digits: [], reading: 'label', mine: false },
  transition: ({ digits, reading, mine }, value) => {
    if (reading === 'label') {
      return { digits, reading: 'digit', mine: value === label };
    }
    if (!mine) return { digits, reading: 'label', mine: false };
    if (digits.includes(value)) return undefined;
    const next = [...digits, value].sort((a, b) => a - b);
    const total = next.reduce((a, b) => a + b, 0);
    if (next.length > size || total > sum) return undefined;
    return { digits: next, reading: 'label', mine: false };
  },
  accept: ({ digits, reading }) => reading === 'label'
    && digits.length === size
    && digits.reduce((a, b) => a + b, 0) === sum,
}, geometry.numValues);

const islandBranch = (island, { size, sum }) => new And([
  new Given(island.sizeCell, size),
  new NFA(islandMachine(island.label, size, sum), `clue ${island.clue}`,
    ...island.window.flatMap(cell => [terrain.at(cell), cell])),
]);
const islandClues = islands.map(island => (
  island.splits.length === 1
    ? islandBranch(island, island.splits[0])
    : new Or(island.splits.map(split => islandBranch(island, split)))));

// A circled digit equals the size of "the island" it lies in, which presumes
// the circled cell is an island cell rather than water. One branch per island
// that can reach the circle, per size that island can take.
const circleClues = CIRCLES.map(cell => new Or(
  islands.filter(island => island.window.includes(cell)).flatMap(
    island => island.splits.map(({ size }) => new And([
      new Given(terrain.at(cell), island.label),
      new Given(cell, size),
      new Given(island.sizeCell, size),
    ])))));

return [
  shape,
  terrain.toVar('terrain'),
  sizeVar,
  digitRange,
  ...terrainDomains,
  ...cluePins,
  ...noTouch,
  mixedBlocks,
  new ConnectedValues('VL', WATER),
  ...islands.map(island => new ConnectedValues('VL', island.label)),
  ...islandClues,
  ...circleClues,
];
