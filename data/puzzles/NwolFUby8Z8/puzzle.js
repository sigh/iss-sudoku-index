// Title: Tannenbaumino
// Author: Cris Moore
// Video: https://www.youtube.com/watch?v=NwolFUby8Z8
// Source: https://sudokupad.app/omtjde4f3k

// Rules encoded here:
//  - Normal sudoku.
//  - The 45 green tree cells divide into pentominoes: orthogonally connected
//    groups of five cells, so nine pieces.
//  - No two pentominoes have the same shape, even when rotated or reflected.
//  - Digits may not repeat in a pentomino.
//  - A pentomino containing a green dot is a Germanimo: adjacent pairs of
//    digits inside it differ by at least 5.
//  - A pentomino containing a red dot is a Renbanimo: it holds five consecutive
//    digits.
//  - A black, white or silver dot sits on the boundary between two pentominoes:
//    black, their totals are in a 1:2 ratio; white, their totals differ by one;
//    silver, their totals are equal.
//  - Digits increase along each candle (thermometer) from the bulb.
// Nothing is omitted.
//
// Two readings the encoding commits to:
//  - A Germanimo's "adjacent pairs of digits inside it" are the orthogonally
//    adjacent cell pairs within the piece. The rules give the pentomino no
//    ordering, so no other adjacency is defined for it.
//  - Every ornament lies in a pentomino of its own, so eight of the nine pieces
//    are anchored by an ornament and the ninth carries none. Two ornaments of
//    the same colour never fit in one pentomino (asserted below against the
//    enumerated five-cell connected sets), and a piece holding a green and a red
//    dot would be a Germanimo and a Renbanimo at once: five consecutive digits
//    span a range of 4, whereas a Germanimo needs at least 5 across every
//    orthogonally adjacent pair inside the piece, and every pentomino has one.

// 12 values, not 9: the type layer below names one of the twelve free
// pentominoes. The playable grid is restricted back to 1-9.
const shape = new Shape('9x9', 12);
const graph = cellGraph(shape);
const gridCells = graph.cells();

// The drawn palegreen cells: the tree.
const treeCells = [
  'R1C5',
  'R2C4', 'R2C5', 'R2C6',
  'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7',
  'R4C4', 'R4C5', 'R4C6',
  'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7',
  'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8',
  'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7',
  'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8',
  'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9',
];

// The drawn circles. Eight are centred on one cell (the ornaments); three are
// centred on the edge between two cells (the boundary dots).
const greenDots = ['R1C5', 'R5C3', 'R6C8', 'R9C4'];
const redDots = ['R3C3', 'R5C7', 'R6C2', 'R8C5'];
const borderDots = [
  ['R4C4', 'R5C4', 'black'],
  ['R7C3', 'R7C4', 'silver'],
  ['R2C6', 'R3C6', 'white'],
];

// The two candles, bulb first.
const thermos = [
  ['R3C1', 'R2C1', 'R1C1'],
  ['R3C9', 'R2C9', 'R1C9'],
];

const ornaments = [...greenDots, ...redDots];
const treeSet = new Set(treeCells);
if (treeCells.length !== 45) throw new Error('the tree is not 45 cells');

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

// A cell set's identity as a free pentomino: the smallest of its eight
// rotation/reflection images, each translated to the origin. Two sets share a
// key exactly when they are the same free pentomino.
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

// Every five-cell orthogonally connected set of tree cells, grown one
// neighbour at a time from each cell and deduplicated, so the list is
// exhaustive: 1103 sets.
const allPieces = (() => {
  let sets = treeCells.map(cell => [cell]);
  for (let size = 1; size < 5; size++) {
    const grown = new Map();
    for (const cells of sets) {
      for (const cell of cells) {
        for (const n of graph.neighbours(cell)) {
          if (!treeSet.has(n) || cells.includes(n)) continue;
          const next = [...cells, n].sort();
          grown.set(next.join(' '), next);
        }
      }
    }
    sets = [...grown.values()];
  }
  return sets;
})();

// The same-colour half of the one-ornament-per-piece argument, checked against
// the enumeration rather than asserted.
const countIn = (cells, marks) => cells.filter(c => marks.includes(c)).length;
if (allPieces.some(cells => countIn(cells, greenDots) > 1
  || countIn(cells, redDots) > 1)) {
  throw new Error('two ornaments of one colour fit in a pentomino');
}

// A candidate piece holds at most one ornament, and never both cells of a
// boundary dot, which the rules place in different pentominoes.
const candidates = allPieces.filter(cells =>
  countIn(cells, ornaments) <= 1
  && !borderDots.some(([a, b]) => cells.includes(a) && cells.includes(b)));

// Piece i (0-7) is the one holding ornament i; piece 8 holds no ornament.
const candidatesFor = (i) => i < ornaments.length
  ? candidates.filter(cells => cells.includes(ornaments[i]))
  : candidates.filter(cells => countIn(cells, ornaments) === 0);

// The orthogonally adjacent cell pairs inside a piece.
const innerEdges = (cells) => cells.flatMap(
  cell => graph.neighbours(cell)
    .filter(n => cells.includes(n) && cell < n)
    .map(n => [cell, n]));

// One label per tree cell, naming which of the nine pieces owns it.
const label = graph.makeOverlay('VP', treeCells);
// One free-pentomino type number per piece.
const types = new Var('T', 'Pentomino type', 9);
const typeCells = types.cells();
// Five digit copies per boundary-dot cell, holding the digits of the pentomino
// that cell belongs to. A dot compares two pentomino totals, but which cells
// those pentominoes hold is only known inside an Or branch, so each branch that
// covers a dot cell copies its own five digits onto these fixed cells; the dot
// relations are then plain sums over them.
const dotCells = borderDots.flatMap(([a, b]) => [a, b]);
const dotDigits = new Var('D', 'Boundary dot pentomino digits', dotCells.length * 5);
const dotDigitCells = dotCells.map(
  (cell, k) => dotDigits.cells().slice(k * 5, k * 5 + 5));

// One Or branch: this piece is exactly these five cells.
const branch = (cells, piece) => new And([
  // Digits may not repeat in a pentomino; a Renbanimo strengthens that to five
  // consecutive digits.
  countIn(cells, redDots) === 1
    ? new Renban(...cells)
    : new AllDifferent(...cells),
  // A Germanimo, over each orthogonally adjacent pair inside the piece.
  ...(countIn(cells, greenDots) === 1
    ? innerEdges(cells).map(([a, b]) => new Whisper(5, a, b))
    : []),
  ...cells.map(cell => new Given(label.at(cell), piece + 1)),
  new Given(typeCells[piece], typeNumberOf(cells)),
  ...dotCells.flatMap((dotCell, k) => cells.includes(dotCell)
    ? cells.map((cell, j) => new SameValues(2, cell, dotDigitCells[k][j]))
    : []),
]);

// A dot's two pentomino totals, as sums over the copied digits.
const dotRelation = ([, , kind], i) => {
  const first = dotDigitCells[2 * i];
  const second = dotDigitCells[2 * i + 1];
  const minus = (cells, factor) => cells.map(cell => [cell, factor]);
  switch (kind) {
    case 'silver':
      return new Sum(0, ...first, ...minus(second, -1));
    case 'white':
      return new Or([
        new Sum(1, ...first, ...minus(second, -1)),
        new Sum(1, ...second, ...minus(first, -1)),
      ]);
    default:  // black: 1:2, either way round.
      return new Or([
        new Sum(0, ...first, ...minus(second, -2)),
        new Sum(0, ...second, ...minus(first, -2)),
      ]);
  }
};

return [
  shape,
  label.toVar('Pentomino'),
  types,
  dotDigits,
  // The grid holds digits; only the type layer uses values 10-12.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),

  ...thermos.map(cells => new Thermo(...cells)),

  // Each piece picks its own five cells. Two pieces can never claim the same
  // cell, since that cell would need two labels; nine pairwise disjoint
  // five-cell pieces are 45 cells, which is the whole tree, so the choices
  // divide the tree with no coverage constraint.
  ...[...ornaments, null].map(
    (_, piece) => new Or(candidatesFor(piece).map(cells => branch(cells, piece)))),
  // No two pentominoes share a shape: nine pieces, nine distinct type numbers.
  new AllDifferent(...typeCells),

  ...borderDots.map(dotRelation),
];
