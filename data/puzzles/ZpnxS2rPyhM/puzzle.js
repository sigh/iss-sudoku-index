// Title: Think Outside The Cage
// Author: Cris Moore
// Video: https://www.youtube.com/watch?v=ZpnxS2rPyhM
// Source: https://app.crackingthecryptic.com/sudoku/8ghL89BqQg

// Rules encoded here:
//  - Normal sudoku.
//  - Digits increase along the thermometer from its bulb.
//  - The sixty white cells are tiled by twelve pentominoes (five orthogonally
//    connected cells each), one of each of the twelve free pentomino types
//    (rotations and reflections are the same type).
//  - A pentomino containing a cell with a small corner clue sums to that clue.
//  - Digits may repeat within a pentomino, so a pentomino is a Sum, never a
//    Cage.
// Nothing is omitted.
//
// "The twelve possible pentominoes" is the twelve free pentominoes: there are
// twelve only when reflections count as the same piece (one-sided pentominoes
// number eighteen).
//
// Eleven clues, twelve pentominoes. Two readings fixed by the rules and the
// drawing, both checkable by hand:
//  - Each clue lies in a different pentomino. Two different clue values in one
//    pentomino would make it sum to both. The one repeated value, 21, is
//    printed at R9C3 and R5C7, eight orthogonal steps apart and so unable to
//    share five connected cells.
//  - So eleven pentominoes carry one clue each and the twelfth carries none;
//    its cells are white cells with no corner clue.

// 12 values, not 9: the Var layers below carry a pentomino label per white cell
// (twelve pentominoes) and a pentomino type per pentomino (twelve types). The
// playable grid is restricted back to 1-9.
const shape = new Shape('9x9', 12);
const graph = cellGraph(shape);
const gridCells = graph.cells();

// The drawn 1x1 grey squares: four 2x2 corner blocks and the centre plus.
const shadedCells = [
  'R1C1', 'R1C2', 'R2C1', 'R2C2',
  'R1C8', 'R1C9', 'R2C8', 'R2C9',
  'R8C1', 'R8C2', 'R9C1', 'R9C2',
  'R8C8', 'R8C9', 'R9C8', 'R9C9',
  'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5',
];

// The eleven small numbers drawn in a cell's top left corner, as [cell, total].
const clues = [
  ['R3C1', 23], ['R3C4', 7], ['R3C9', 41], ['R4C6', 24],
  ['R5C7', 21], ['R6C3', 29], ['R7C2', 35], ['R7C5', 9],
  ['R7C7', 32], ['R9C3', 21], ['R9C7', 39],
];

// The drawn grey thermometer, bulb first.
const thermo = ['R1C4', 'R1C5', 'R1C6'];

const shadedSet = new Set(shadedCells);
const whiteCells = gridCells.filter(cell => !shadedSet.has(cell));
const whiteSet = new Set(whiteCells);
const clueSet = new Set(clues.map(([cell]) => cell));
// Twelve pentominoes of five cells tile sixty cells exactly; the encoding below
// relies on that to get coverage for free, so check it rather than assume it.
if (whiteCells.length !== 60) throw new Error('white area is not sixty cells');
if (![...clueSet].every(cell => whiteSet.has(cell))) {
  throw new Error('a corner clue sits on a shaded cell');
}

// The twelve free pentominoes, as (row, col) offsets from an arbitrary origin.
// Their order fixes the type numbers 1-12 stamped on the type layer below.
const PENTOMINO_TYPES = [
  ['F', [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]]],
  ['I', [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]],
  ['L', [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]]],
  ['N', [[0, 1], [1, 1], [2, 0], [2, 1], [3, 0]]],
  ['P', [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]]],
  ['T', [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]]],
  ['U', [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]]],
  ['V', [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]]],
  ['W', [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]]],
  ['X', [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]]],
  ['Y', [[0, 1], [1, 0], [1, 1], [2, 1], [3, 1]]],
  ['Z', [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]]],
];

// A shape's identity as a free pentomino: the smallest of the eight
// rotation/reflection images, each translated to the origin. Two cell sets have
// the same key exactly when they are the same free pentomino type.
const shapeKey = (points) => {
  let best = null;
  for (let t = 0; t < 8; t++) {
    const mapped = points.map(([row, col]) => {
      const [a, b] = (t & 1) ? [col, row] : [row, col];
      return [(t & 2) ? -a : a, (t & 4) ? -b : b];
    });
    const minA = Math.min(...mapped.map(p => p[0]));
    const minB = Math.min(...mapped.map(p => p[1]));
    const key = mapped
      .map(([a, b]) => [a - minA, b - minB])
      .sort((p, q) => p[0] - q[0] || p[1] - q[1])
      .map(p => p.join(','))
      .join(' ');
    if (best === null || key < best) best = key;
  }
  return best;
};

const typeNumbers = new Map(
  PENTOMINO_TYPES.map(([, points], i) => [shapeKey(points), i + 1]));
if (typeNumbers.size !== 12) throw new Error('pentomino type table collides');

const typeNumberOf = (cells) =>
  typeNumbers.get(shapeKey(cells.map(cell => {
    const { row, col } = parseCellId(cell);
    return [row, col];
  })));

// Every five-cell orthogonally connected subset of `allowed` that contains one
// of `seeds` -- grown one neighbour at a time from each seed and deduplicated,
// so the list is exhaustive over the given cells.
const pentominoesOver = (allowed, seeds) => {
  const allowedSet = new Set(allowed);
  let sets = seeds.map(cell => [cell]);
  for (let size = 1; size < 5; size++) {
    const grown = new Map();
    for (const cells of sets) {
      for (const cell of cells) {
        for (const n of graph.neighbours(cell)) {
          if (!allowedSet.has(n) || cells.includes(n)) continue;
          const next = [...cells, n].sort();
          grown.set(next.join(' '), next);
        }
      }
    }
    sets = [...grown.values()];
  }
  return sets;
};

// The unclued pentomino's own candidates. It holds no clued cell (the eleven
// clues lie in the other eleven pentominoes), so its cells come from the white
// cells that carry no clue.
const unclued = whiteCells.filter(cell => !clueSet.has(cell));

// One label per white cell, naming which of the twelve pentominoes owns it, and
// one type number per pentomino. Labels 1-11 are the clued pentominoes in the
// order of `clues`; label 12 is the unclued one.
const label = graph.makeOverlay('VP', whiteCells);
const types = new Var('T', 'Pentomino type', 12);
const typeCells = types.cells();

// Each pentomino picks itself out of its candidate list. A branch stamps that
// pentomino's label on its five cells, records its free pentomino type, and --
// for a clued pentomino -- fixes its total.
//
// Two pentominoes can never claim the same cell, since that cell would need
// both their labels; twelve disjoint pentominoes of five cells exhaust the
// sixty white cells, so the choices tile the white area with no further
// constraint.
const pentominoChoice = (candidates, index, total) => new Or(
  candidates.map(cells => new And([
    ...(total === null ? [] : [new Sum(total, ...cells)]),
    ...cells.map(cell => new Given(label.at(cell), index + 1)),
    new Given(typeCells[index], typeNumberOf(cells)),
  ]))
);

return [
  shape,
  label.toVar('Pentomino'),
  types,
  // The grid holds digits; only the Var layers use values 10-12.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),

  new Thermo(...thermo),

  ...clues.map(([clue, total], i) =>
    pentominoChoice(pentominoesOver(whiteCells, [clue]), i, total)),
  pentominoChoice(pentominoesOver(unclued, unclued), 11, null),

  // One copy each of the twelve possible pentominoes.
  new AllDifferent(...typeCells),
];
