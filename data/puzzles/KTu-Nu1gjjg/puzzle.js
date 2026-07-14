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
const hotspotConstraints = [
  // Top edge: center R1C2 inside an R1C1-anchored 2x3 template.
  graph.makeReplicate(
    new NFA(encodedHotspot, 'Hotspot', 'R1C2', 'R1C1', 'R1C3', 'R2C2'),
    graph.row(1).slice(0, 7)),
  // Bottom edge: center R2C2 inside an R1C1-anchored 2x3 template.
  graph.makeReplicate(
    new NFA(encodedHotspot, 'Hotspot', 'R2C2', 'R2C1', 'R2C3', 'R1C2'),
    graph.row(8).slice(0, 7)),
  // Left and right edges use fixed 3x2 bounding templates.
  graph.makeReplicate(
    new NFA(encodedHotspot, 'Hotspot', 'R2C1', 'R2C2', 'R1C1', 'R3C1'),
    graph.column(1).slice(0, 7)),
  graph.makeReplicate(
    new NFA(encodedHotspot, 'Hotspot', 'R2C2', 'R2C1', 'R1C2', 'R3C2'),
    graph.column(8).slice(0, 7)),
  // Interior cells use the center and four neighbours of a fixed 3x3 box.
  graph.makeReplicate(
    new NFA(encodedHotspot, 'Hotspot', 'R2C2', 'R2C1', 'R2C3', 'R1C2', 'R3C2'),
    graph.block('R1C1', 7, 7)),
  // Corners are unique shapes, so keep their four direct NFAs.
  ...['R1C1', 'R1C9', 'R9C1', 'R9C9'].map(cell =>
    new NFA(encodedHotspot, 'Hotspot', cell, ...graph.neighbours(cell))),
];

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
