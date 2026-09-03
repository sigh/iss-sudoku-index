// Title: Pentomino Sudoku
// Author: Rodolfo Kurchan
// Video: https://www.youtube.com/watch?v=1vBDaAfooU4
// Source: https://app.crackingthecryptic.com/sudoku/Jfp7QJ8LFn

// Rules encoded here:
//  - Normal sudoku.
//  - The grid is divided into sixteen pentominoes (five orthogonally connected
//    cells each); the central cell R5C5 is in none of them.
//  - Each small corner number is the sum of the digits of the pentomino its
//    cell belongs to.
//  - The white cells are divided into exactly 12 pentominoes, one of each of
//    the 12 free pentomino types (rotations and reflections are the same type).
//  - Digits cannot repeat within a pentomino.
// Nothing is omitted.
//
// Two readings fixed by the rules and the drawing, both checkable by hand:
//  - No pentomino straddles the shading. The white cells are divided into 12
//    pentominoes on their own, so every white cell sits in an all-white
//    pentomino; the other four of the sixteen are therefore the twenty shaded
//    cells, which fall into four orthogonally separated groups of exactly five.
//    Each group is one pentomino and carries one shaded corner clue.
//  - Each white pentomino carries exactly one clue. Clues of different values
//    lie in different pentominoes; the only repeated value is 23, at R5C1 and
//    R1C6, nine orthogonal steps apart and so unable to share five connected
//    cells. So the twelve white clues lie in twelve distinct white pentominoes,
//    of which there are exactly twelve.

// 12 values, not 9: the Var layers below carry a pentomino label per white cell
// (12 white pentominoes) and a pentomino type per clue (12 types). The playable
// grid is restricted back to 1-9.
const shape = new Shape('9x9', 12);
const graph = cellGraph(shape);
const gridCells = graph.cells();

// The drawn 1x1 grey squares.
const shadedCells = [
  'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1',
  'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9',
  'R7C9', 'R8C9', 'R9C7', 'R9C8', 'R9C9',
  'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3',
  'R5C5',
];

// The sixteen corner numbers, as [cell, total]: four on shaded cells, twelve
// on white ones.
const shadedClues = [
  ['R1C1', 20], ['R1C9', 22], ['R9C1', 31], ['R9C9', 22],
];
const whiteClues = [
  ['R1C6', 23], ['R2C5', 30], ['R2C6', 35], ['R4C1', 22],
  ['R4C9', 27], ['R5C1', 23], ['R5C2', 24], ['R5C9', 19],
  ['R6C9', 33], ['R9C4', 34], ['R9C5', 18], ['R9C6', 15],
];

const givens = [
  ['R3C1', 3], ['R6C2', 9], ['R6C8', 6], ['R8C2', 4],
  ['R8C6', 1], ['R9C1', 7], ['R9C7', 8],
];

const shadedSet = new Set(shadedCells);
const whiteCells = gridCells.filter(cell => !shadedSet.has(cell));

// Split the shaded cells into orthogonally connected groups.
const shadedGroups = [];
const seen = new Set();
for (const start of shadedCells) {
  if (seen.has(start)) continue;
  const group = [start];
  seen.add(start);
  for (let i = 0; i < group.length; i++) {
    for (const n of graph.neighbours(group[i])) {
      if (shadedSet.has(n) && !seen.has(n)) {
        seen.add(n);
        group.push(n);
      }
    }
  }
  shadedGroups.push(group);
}

// One group per shaded clue, of five cells; plus the lone central cell, which
// carries no clue and belongs to no pentomino.
const shadedClueCells = new Set(shadedClues.map(([cell]) => cell));
const shadedPentominoes = shadedGroups.filter(group => group.length > 1);
const centre = shadedGroups.filter(group => group.length === 1).flat();
if (shadedPentominoes.length !== shadedClues.length
  || !shadedPentominoes.every(group => group.length === 5
    && group.filter(cell => shadedClueCells.has(cell)).length === 1)
  || centre.length !== 1 || shadedClueCells.has(centre[0])) {
  throw new Error('shaded cells are not four clued pentominoes plus the centre');
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
// the same key exactly when they are the same pentomino type.
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

// Every five-cell orthogonally connected set of white cells containing `anchor`
// -- the candidate pentominoes for the clue at `anchor`. Grown one neighbour at
// a time and deduplicated, so the list is exhaustive.
const whiteSet = new Set(whiteCells);
const candidates = (anchor) => {
  let sets = [[anchor]];
  for (let size = 1; size < 5; size++) {
    const grown = new Map();
    for (const cells of sets) {
      for (const cell of cells) {
        for (const n of graph.neighbours(cell)) {
          if (!whiteSet.has(n) || cells.includes(n)) continue;
          const next = [...cells, n].sort();
          grown.set(next.join(' '), next);
        }
      }
    }
    sets = [...grown.values()];
  }
  return sets;
};

// One label per white cell, naming which of the twelve clues owns it, and one
// type number per clue.
const label = graph.makeOverlay('VP', whiteCells);
const types = new Var('T', 'Pentomino type', whiteClues.length);
const typeCells = types.cells();

return [
  shape,
  label.toVar('Pentomino'),
  types,
  // The grid holds digits; only the Var layers use values 10-12.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),

  ...givens.map(([cell, value]) => new Given(cell, value)),

  // The four shaded pentominoes are drawn, so each is simply a cage.
  ...shadedClues.map(([clue, total]) => new Cage(
    total, ...shadedPentominoes.find(group => group.includes(clue)))),

  // Each white clue picks its own pentomino out of its candidate list. The
  // branch fixes that pentomino's total and distinctness, stamps the clue's
  // label on its five cells, and records its type.
  //
  // Two clues can never claim the same cell, since that cell would need both
  // their labels; twelve disjoint pentominoes of five cells exhaust the sixty
  // white cells, so the choices tile the white area with no further constraint.
  ...whiteClues.map(([clue, total], i) => new Or(
    candidates(clue).map(cells => new And([
      new Cage(total, ...cells),
      ...cells.map(cell => new Given(label.at(cell), i + 1)),
      new Given(typeCells[i], typeNumberOf(cells)),
    ]))
  )),
  // One of each pentomino type.
  new AllDifferent(...typeCells),
];
