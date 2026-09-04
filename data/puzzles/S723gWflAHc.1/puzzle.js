// Title: Double Choco
// Author: Unknown
// Video: https://www.youtube.com/watch?v=S723gWflAHc
// Source: https://tinyurl.com/rk9jzxy

// Double Choco, 10x10, no digits. Rules encoded:
//  - Divide the grid into blocks (orthogonally connected groups of cells).
//  - Each block contains a white area and a grey area of the same size and
//    shape: one orthogonally connected group of white cells and one of grey
//    cells, congruent under any of the eight rotations/reflections.
//  - A number gives the number of cells of its own colour in its block. All
//    nine numbers stand on white cells, so each names its block's white count.
// Nothing is omitted.
//
// The grid is a block-label layer: each cell holds the label of its block.
// Labels 1-9 are the clued blocks, each labelled by its clue value. The nine
// values are distinct, so no two clues share a block (a block has one white
// count), the clued blocks hold 2*(1+...+9) = 90 cells, and 10 cells remain
// for unclued blocks of even size: at most five, labelled 10-14.
//
// Every block comes from a finite catalogue built from the drawn shading and
// clues alone: a white area is a connected set of white cells (n cells through
// its clue for a clued block, 1-5 plain white cells for an unclued one), and
// the grey area is a congruent connected set of grey cells touching it.

const shape = new Shape('10x10', 14, 'Raw');
const graph = cellGraph(shape);
const gridCells = graph.cells();

// Drawn shading, from the shaded-cell layer: '#' grey, '.' white, R1 first.
const SHADING = [
  '...#######',
  '...####.##',
  '........##',
  '###.......',
  '###..###..',
  '###..###..',
  '.####....#',
  '.#.##.####',
  '..........',
  '..########',
];

// Drawn numbers, as [row, col, value]; all on white cells.
const CLUES = [
  [1, 1, 9], [3, 4, 8], [3, 6, 7], [4, 9, 6], [7, 9, 5],
  [8, 3, 2], [9, 2, 1], [9, 6, 3], [9, 7, 4],
];

const SIZE = 10;
const FIRST_UNCLUED_LABEL = 10;
const MAX_UNCLUED_BLOCKS = 5;

const greyCells = new Set();
const whiteCells = new Set();
for (const cell of gridCells) {
  const { row, col } = parseCellId(cell);
  (SHADING[row - 1][col - 1] === '#' ? greyCells : whiteCells).add(cell);
}
if (greyCells.size !== 50 || whiteCells.size !== 50) {
  throw new Error('shading is not 50 grey / 50 white');
}
const clueCells = new Set(CLUES.map(([r, c]) => makeCellId(r, c)));
if (![...clueCells].every(cell => whiteCells.has(cell))) {
  throw new Error('a clue is not on a white cell');
}
// White cells that may belong to a block other than a clue's own.
const plainWhiteCells = new Set([...whiteCells].filter(c => !clueCells.has(c)));

// Every orthogonally connected set of `size` cells drawn from `allowed`
// (containing `must` when given), grown one neighbour at a time and
// deduplicated, so the list is exhaustive. Each set is a sorted cell array.
const connectedSets = (allowed, size, must) => {
  const starts = must ? [must] : [...allowed];
  const found = new Map();
  for (const start of starts) {
    let sets = [[start]];
    for (let n = 1; n < size; n++) {
      const grown = new Map();
      for (const cells of sets) {
        for (const cell of cells) {
          for (const nb of graph.neighbours(cell)) {
            if (!allowed.has(nb) || cells.includes(nb)) continue;
            const next = [...cells, nb].sort();
            grown.set(next.join(' '), next);
          }
        }
      }
      sets = [...grown.values()];
    }
    for (const cells of sets) found.set(cells.join(' '), cells);
  }
  return [...found.values()];
};

// The distinct images of a cell set under the eight rotations/reflections
// (swap axes, negate rows, negate columns), each translated so its smallest
// row and column are 0.
const images = (cells) => {
  const out = new Map();
  for (let t = 0; t < 8; t++) {
    const pts = cells.map(parseCellId).map(({ row, col }) => {
      const [a, b] = (t & 1) ? [col, row] : [row, col];
      return [(t & 2) ? -a : a, (t & 4) ? -b : b];
    });
    const minR = Math.min(...pts.map(p => p[0]));
    const minC = Math.min(...pts.map(p => p[1]));
    const norm = pts.map(([r, c]) => [r - minR, c - minC])
      .sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    out.set(norm.map(p => p.join(',')).join(' '), norm);
  }
  return [...out.values()];
};

// Every translation of an origin-normalised shape that lies within `allowed`.
const placements = (norm, allowed) => {
  const height = Math.max(...norm.map(p => p[0]));
  const width = Math.max(...norm.map(p => p[1]));
  const out = [];
  for (let dr = 1; dr + height <= SIZE; dr++) {
    for (let dc = 1; dc + width <= SIZE; dc++) {
      const cells = norm.map(([r, c]) => makeCellId(r + dr, c + dc));
      if (cells.every(cell => allowed.has(cell))) out.push(cells);
    }
  }
  return out;
};

const touches = (a, b) => {
  const bSet = new Set(b);
  return a.some(cell => graph.neighbours(cell).some(nb => bSet.has(nb)));
};

// All blocks whose white area is one of `whiteAreas`: the grey area is a
// congruent connected set of grey cells orthogonally touching the white one.
const blocksFor = (whiteAreas) => {
  const out = [];
  for (const white of whiteAreas) {
    for (const norm of images(white)) {
      for (const grey of placements(norm, greyCells)) {
        if (touches(white, grey)) out.push([...white, ...grey]);
      }
    }
  }
  return out;
};

// Candidate blocks per clue: the white area is a connected set of n white
// cells through the clue cell and no other clue cell.
const cluedBlocks = CLUES.map(([r, c, n]) => blocksFor(
  connectedSets(new Set([...plainWhiteCells, makeCellId(r, c)]), n,
    makeCellId(r, c))));

// Candidate unclued blocks: a white area of 1-5 plain white cells.
const uncluedBlocks = [];
for (let n = 1; n <= MAX_UNCLUED_BLOCKS; n++) {
  uncluedBlocks.push(...blocksFor(connectedSets(plainWhiteCells, n)));
}

const labelGivens = (block, label) =>
  block.map(cell => new Given(cell, label));

// One cell per possible unclued block holding that block's cell count plus
// one (1 when the label is unused), for the count machines below.
const sizeVars = new Var('S', 'Unclued block size + 1', MAX_UNCLUED_BLOCKS);
const sizeCells = sizeVars.cells();

// The cells labelled `label` number exactly (size cell - 1): the scan reads
// the size cell first, then counts down over the grid.
const countSpec = (label) => NFA.encodeSpec({
  startState: { left: null },
  transition: ({ left }, value) => {
    if (left === null) return { left: value - 1 };
    if (value !== label) return { left };
    return left > 0 ? { left: left - 1 } : undefined;
  },
  accept: ({ left }) => left === 0,
}, shape);

// Unclued labels are used in order of first appearance in reading order:
// label 10 is the unclued block holding the first unclued cell, and so on.
// `seen` is how many unclued labels have appeared so far.
const orderSpec = NFA.encodeSpec({
  startState: { seen: 0 },
  transition: ({ seen }, value) => {
    if (value < FIRST_UNCLUED_LABEL) return { seen };
    const index = value - FIRST_UNCLUED_LABEL;
    if (index < seen) return { seen };
    return index === seen ? { seen: seen + 1 } : undefined;
  },
  accept: () => true,
}, shape);

return [
  shape,
  sizeVars,

  // Each clue picks its block from its catalogue, stamping the clue value as
  // the label on every cell of the block; the block has 2n cells and no other
  // cell may carry that label.
  ...CLUES.map(([, , n], i) => new Or(
    cluedBlocks[i].map(block => new And(labelGivens(block, n))))),
  ...CLUES.map(([, , n]) => new ContainExact(
    new Array(2 * n).fill(n).join('_'), ...gridCells)),

  // Each unclued label is either unused or one block from the catalogue.
  ...sizeCells.map((sizeCell, j) => new Or([
    new Given(sizeCell, 1),
    ...uncluedBlocks.map(block => new And([
      ...labelGivens(block, FIRST_UNCLUED_LABEL + j),
      new Given(sizeCell, block.length + 1),
    ])),
  ])),
  ...sizeCells.map((sizeCell, j) => new NFA(
    countSpec(FIRST_UNCLUED_LABEL + j), `count${FIRST_UNCLUED_LABEL + j}`,
    sizeCell, ...gridCells)),

  new NFA(orderSpec, 'uncluedOrder', ...gridCells),
];
