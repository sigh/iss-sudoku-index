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

const constraints = [
  new Shape('9x9'),
  new Given('R2C2', 1),
  new Given('R3C6', 7),
  new Given('R4C4', 5),
  new Given('R5C6', 2),
  new Given('R7C4', 6),
  new Given('R9C5', 8),
  new Given('R9C9', 4),
];

for (const cell of graph.cells()) {
  constraints.push(new NFA(encodedHotspot, 'Hotspot', cell, ...graph.neighbours(cell)));
}

return constraints;
