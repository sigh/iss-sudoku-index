// Title: Hotspots
// Author: Ryan W.
// Video: https://www.youtube.com/watch?v=KTu-Nu1gjjg
// Source: https://sudokupad.app/c2htj0grjc

// Normal sudoku rules apply. Each 9's orthogonal neighbours sum to 9.
//
// The neighbour-sum rule is a per-cell implication ("if this cell is 9, its
// orthogonal neighbours sum to 9"), not a fixed clue with pre-marked cells,
// so it is encoded with one small NFA per grid cell: the sequence
// [cell, ...orthogonal neighbours] is read, and the automaton accepts unless
// the cell holds 9 and its neighbours fail to sum to 9.

const graph = cellGraph('9x9');

const hotspotSpec = {
  // state.center is null until the first symbol (the cell itself) is read.
  startState: { center: null, sum: 0 },
  transition: (state, value) => {
    if (state.center === null) return { center: value, sum: 0 };
    return { center: state.center, sum: state.sum + value };
  },
  accept: (state) => state.center !== 9 || state.sum === 9,
  // No cell has more than 4 orthogonal neighbours, so no segment exceeds 5
  // symbols (the cell itself plus up to 4 neighbours). Bound the search so
  // the compiler does not keep expanding sums past what any segment reads.
  maxDepth: 5,
};
const encodedHotspot = NFA.encodeSpec(hotspotSpec, 9);

// The per-cell NFA's shape ([cell, ...neighbours] length and offsets) is
// fixed by which grid sides the cell touches, so cells sharing that shape
// are true uniform-offset copies: group by touched sides and let Replicate
// shift one template across each group. The 4 corners are unique shapes
// with only one member each, so Replicate would just wrap them without
// shortening anything; leave those as plain per-cell NFAs.
const sideGroups = new Map();
for (const cell of graph.cells()) {
  const { row, col } = parseCellId(cell);
  const key = [row === 1, row === 9, col === 1, col === 9].join(',');
  if (!sideGroups.has(key)) sideGroups.set(key, []);
  sideGroups.get(key).push(cell);
}

const hotspotConstraints = Array.from(sideGroups.values()).flatMap(cells => {
  if (cells.length === 1) {
    const cell = cells[0];
    return [new NFA(encodedHotspot, 'Hotspot', cell, ...graph.neighbours(cell))];
  }
  const origin = cells[0];
  return [new Replicate(
    [new NFA(encodedHotspot, 'Hotspot', origin, ...graph.neighbours(origin))],
    Replicate.encodeTargetCells(cells, origin, graph),
    origin,
  )];
});

return [
  new Shape('9x9'),
  new Given('R2C2', 1),
  new Given('R3C6', 7),
  new Given('R4C4', 5),
  new Given('R5C6', 2),
  new Given('R7C4', 6),
  new Given('R9C5', 8),
  new Given('R9C9', 4),
  ...hotspotConstraints,
];
