// Title: So You Think You've Got Problems? By Alex Bellos
// Author: Unknown
// Video: https://www.youtube.com/watch?v=6w2c-myAxm4
// Source: https://cracking-the-cryptic.web.app/sudoku/3Lrn2M7TGp

// Rules, from the panel the video keeps beside the board (the board itself is
// a blank 8x8 chessboard with no givens or drawn clues):
//   "Place five stones (or ones) on the chessboard so that each 3x3 square
//    contains exactly one."
// Each cell is a 0/1 flag (1 = stone) on a Raw grid with no implicit rules, so
// a Sum over a set of cells counts the stones in it. "Each 3x3 square" is every
// 3x3 block of cells on the board: 36 of them, top-left corners R1-6 x C1-6.
//
// Symmetry break, not a rule: nothing on the blank board or in the rules fixes
// an orientation, so the 8 rotations and reflections of any placement satisfy
// the rules equally. The lex-leader machines at the end keep one representative
// per orbit: the placement that, read row-major, is lexicographically no later
// than each of its seven images.

const N = 8;
const shape = new Shape('8x8', '0-1', 'Raw');
const graph = cellGraph(shape);
const at = (r, c) => makeCellId(r, c);
const cells = graph.cells();

// Five stones on the whole board.
const fiveStones = new Sum(5, ...cells);

// Exactly one stone in every 3x3 block: one template at the top-left block,
// shifted to every top-left corner where the block stays on the board.
const block = [];
for (let r = 1; r <= 3; r++) {
  for (let c = 1; c <= 3; c++) block.push(at(r, c));
}
const corners = [];
for (let r = 1; r <= N - 2; r++) {
  for (let c = 1; c <= N - 2; c++) corners.push(at(r, c));
}
const oneStonePerBlock = new Replicate(
  [new Sum(1, ...block)],
  Replicate.encodeTargetCells(corners, at(1, 1), graph),
  at(1, 1));

// Lex-leader symmetry break. For each non-identity symmetry s of the square,
// scan the pairs (cell, s(cell)) in row-major order and require the grid to be
// lexicographically <= its image. States: 'eq' = all pairs so far equal, about
// to read a grid cell; 'x0' / 'x1' = read that grid cell (0 or 1), about to
// read its image cell; 'lt' = the grid is already smaller, everything after
// is irrelevant. Reading image 0 after grid 1 is grid > image: reject.
const lexLeqSpec = NFA.encodeSpec({
  startState: 'eq',
  transition: (state, value) => {
    if (state === 'lt') return 'lt';
    if (state === 'eq') return value === 0 ? 'x0' : 'x1';
    if (state === 'x0') return value === 0 ? 'eq' : 'lt';
    // state === 'x1'
    return value === 1 ? 'eq' : undefined;
  },
  accept: state => state === 'eq' || state === 'lt',
}, shape);

const symmetries = {
  'rotate 90': (r, c) => [c, N + 1 - r],
  'rotate 180': (r, c) => [N + 1 - r, N + 1 - c],
  'rotate 270': (r, c) => [N + 1 - c, r],
  'mirror rows': (r, c) => [N + 1 - r, c],
  'mirror columns': (r, c) => [r, N + 1 - c],
  'transpose': (r, c) => [c, r],
  'anti-transpose': (r, c) => [N + 1 - c, N + 1 - r],
};
const lexLeader = Object.entries(symmetries).map(([name, map]) => {
  const scan = [];
  for (const cell of cells) {
    const { row, col } = parseCellId(cell);
    scan.push(cell, at(...map(row, col)));
  }
  return new NFA(lexLeqSpec, `lex-leader ${name}`, scan);
});

return [
  shape,
  fiveStones,
  oneStonePerBlock,
  ...lexLeader,
];
