// Title: Searching High & Low
// Author: Daniel Hanson
// Video: https://www.youtube.com/watch?v=88Sl-ws7ifg
// Source: https://sudokupad.app/6ukcd457re

// Rules encoded:
// - Normal sudoku (default row/column/box all-different).
// - Anti-knight: cells a knight's move apart cannot repeat a digit.
// - A MAX cell is larger than all 8 orthogonal+diagonal neighbours it has; a
//   MIN cell is smaller than all of them. Which cells are MAX/MIN, and which
//   type each is, comes from the drawn wedge glyphs: on each side bordering
//   another cell, the wedge tip points away from the cell's centre for MAX
//   and toward it for MIN. Checked against all 12 marked cells: every one
//   agrees unanimously across its own wedges, so the classification below is
//   unambiguous.
// - A cell marked with a single-cell (no-total) cage is BIG or SMALL, chosen
//   by the solver: BIG needs every orthogonal neighbour smaller, but at
//   least one diagonal neighbour not smaller (so it isn't a full MAX); SMALL
//   is the mirror image against MIN.
// - "All possible MAX/MIN/BIG/SMALL cells are shown" is itself a rule: every
//   other cell must fail both the plain orthogonal-max and orthogonal-min
//   conditions (which is what MAX/BIG and MIN/SMALL share), since otherwise
//   it would qualify for one of the four labels without being marked.
// - Somewhere in the grid, not necessarily box-aligned, a contiguous 3x3
//   block holds 9 distinct digits forming a magic square (every row, column,
//   and both diagonals of the block share one sum). Encoded as a disjunction
//   over every 3x3 placement; AllDifferent is explicit because an
//   off-box block gets no implicit distinctness from the grid.

const N = 9;
const graph = cellGraph();

// a > b
const gtKey = Pair.fnToKey((a, b) => a > b, 9);
// a >= b
const geKey = Pair.fnToKey((a, b) => a >= b, 9);

const gt = (a, b, name) => new Pair(gtKey, name, a, b);
const ge = (a, b, name) => new Pair(geKey, name, a, b);

function orthoOf(cell) {
  return graph.neighbours(cell);
}
function diagOf(cell) {
  const ortho = new Set(orthoOf(cell));
  return graph.kingNeighbours(cell).filter(c => !ortho.has(c));
}

// Marked cells and their type, decoded from the drawn wedge glyphs and the
// single-cell cage markers.
const MAX_CELLS = ['R1C7', 'R1C9', 'R2C2', 'R5C1', 'R9C9'];
const MIN_CELLS = ['R1C1', 'R2C5', 'R3C2', 'R6C1', 'R7C9', 'R8C6', 'R9C2'];
const CAGE_CELLS = [
  'R1C4', 'R2C7', 'R3C8', 'R4C9', 'R4C7', 'R4C6', 'R3C5', 'R5C5', 'R6C5',
  'R7C5', 'R6C6', 'R6C4', 'R5C3', 'R6C2', 'R7C3', 'R8C4', 'R9C5', 'R9C4',
  'R9C3', 'R8C3', 'R8C2', 'R9C8', 'R8C8', 'R7C7', 'R6C8',
];

const markedSet = new Set([...MAX_CELLS, ...MIN_CELLS, ...CAGE_CELLS]);

const maxConstraints = MAX_CELLS.flatMap(
  cell => graph.kingNeighbours(cell).map(n => gt(cell, n, `MAX ${cell}`)));

const minConstraints = MIN_CELLS.flatMap(
  cell => graph.kingNeighbours(cell).map(n => gt(n, cell, `MIN ${cell}`)));

// Each cage cell is BIG (ortho-max but not diagonal-max) or SMALL (ortho-min
// but not diagonal-min); the solver decides which.
const bigSmallConstraints = CAGE_CELLS.map(cell => {
  const ortho = orthoOf(cell);
  const diag = diagOf(cell);
  const bigBranch = new And([
    ...ortho.map(o => gt(cell, o, 'BIG ortho')),
    new Or(diag.map(d => ge(d, cell, 'BIG diag not-max'))),
  ]);
  const smallBranch = new And([
    ...ortho.map(o => gt(o, cell, 'SMALL ortho')),
    new Or(diag.map(d => ge(cell, d, 'SMALL diag not-min'))),
  ]);
  return new Or([bigBranch, smallBranch]);
});

// Every unmarked cell must fail both the orthogonal-max and orthogonal-min
// conditions (the shared precondition of MAX/BIG and of MIN/SMALL), since
// "all possible MAX/MIN/BIG/SMALL cells are shown" rules it out of every
// label.
const ordinaryCells = graph.cells().filter(c => !markedSet.has(c));

const ordinaryConstraints = ordinaryCells.flatMap(cell => {
  const ortho = orthoOf(cell);
  return [
    new Or(ortho.map(o => ge(o, cell, 'not ortho-max'))),
    new Or(ortho.map(o => ge(cell, o, 'not ortho-min'))),
  ];
});

// Magic square: try every contiguous 3x3 placement in the grid (not just the
// 9 sudoku boxes). AllDifferent is explicit because an off-box block has no
// implicit distinctness; EqualSum over the 3 rows, 3 columns and 2 diagonals
// then forces the shared total once combined with AllDifferent.
const magicSquareBranches = [];
for (let r0 = 0; r0 <= N - 3; r0++) {
  for (let c0 = 0; c0 <= N - 3; c0++) {
    const block = [];
    for (let dr = 0; dr < 3; dr++) {
      const row = [];
      for (let dc = 0; dc < 3; dc++) row.push(makeCellId(r0 + dr + 1, c0 + dc + 1));
      block.push(row);
    }
    const cols = [0, 1, 2].map(c => block.map(row => row[c]));
    const diags = [
      [block[0][0], block[1][1], block[2][2]],
      [block[0][2], block[1][1], block[2][0]],
    ];
    magicSquareBranches.push(new And([
      new AllDifferent(...block.flat()),
      new EqualSum(...block, ...cols, ...diags),
    ]));
  }
}

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...maxConstraints,
  ...minConstraints,
  ...bigSmallConstraints,
  ...ordinaryConstraints,
  new Or(magicSquareBranches),
];
