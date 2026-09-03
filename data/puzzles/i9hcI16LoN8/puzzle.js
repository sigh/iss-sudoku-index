// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=i9hcI16LoN8
// Source: https://cracking-the-cryptic.web.app/sudoku/4nFtJMN9Df

// Rules encoded below, in full; nothing is omitted.
//
//  - Normal Sudoku.
//  - Exactly four cells of every 3x3 box are shaded, and they form a T, L or S
//    tetromino (rotations and reflections allowed).
//  - Reading the boxes as a 3x3 arrangement, each band of three boxes and each
//    stack of three boxes holds one T box, one L box and one S box.
//  - The 36 shaded cells form a single orthogonally-connected group, that
//    group has no loops, and no 2x2 block of the grid is entirely shaded.
//  - The four shaded digits of each box sum to 20, and no two boxes hold the
//    same set of four shaded digits.
//
// Which cells are shaded is part of the answer, so the shading is a
// solver-discovered overlay VS over the grid. Three further Var groups carry
// the quantities the box and wall rules read: VT (each box's tetromino type),
// VC (each box's set of four shaded digits) and VE (each grid line's count of
// adjacent shaded pairs).

const SHADED = 1;
const UNSHADED = 2;

// Widened so VC can name each of the twelve four-digit sets summing to 20;
// grid cells are restricted back to 1-9 below.
const NUM_VALUES = 12;
const shape = new Shape('9x9', NUM_VALUES);
const graph = cellGraph(shape);
const shade = graph.makeOverlay('VS');

// Hand-transcribed from the drawn given digits.
const GIVENS = [
  ['R1C4', 1], ['R1C7', 9], ['R2C4', 2], ['R2C8', 6], ['R4C1', 4],
  ['R4C7', 1], ['R5C1', 6], ['R5C3', 5], ['R5C5', 8], ['R5C9', 2],
  ['R6C1', 2], ['R6C7', 8], ['R6C8', 4], ['R7C6', 3], ['R7C8', 9],
  ['R8C7', 2], ['R9C3', 2], ['R9C7', 3],
];

// Hand-transcribed from the sixteen drawn gold squares: the given shaded cells.
const GIVEN_SHADED = [
  'R1C1', 'R1C6', 'R1C8', 'R3C5', 'R3C8', 'R4C1', 'R4C4', 'R4C5',
  'R4C6', 'R5C2', 'R7C2', 'R7C8', 'R8C5', 'R8C8', 'R9C3', 'R9C6',
];

// The three allowed free tetrominoes, as cell offsets.
const TETROMINOES = [
  [[0, 0], [0, 1], [0, 2], [1, 1]],   // T -- VT value 1
  [[0, 0], [1, 0], [2, 0], [2, 1]],   // L -- VT value 2
  [[0, 1], [0, 2], [1, 0], [1, 1]],   // S -- VT value 3
];

// Every placement of one shape inside a 3x3 box under all rotations and
// reflections, as a 9-character mask over the box read row-major ('1' shaded).
// Counts: 8 for T, 16 for L, 8 for S.
const boxMasks = (offsets) => {
  const masks = new Set();
  let rotated = offsets;
  for (let i = 0; i < 4; i++) {
    rotated = rotated.map(([r, c]) => [c, -r]);
    for (const form of [rotated, rotated.map(([r, c]) => [r, -c])]) {
      const minRow = Math.min(...form.map(([r]) => r));
      const minCol = Math.min(...form.map(([, c]) => c));
      const cells = form.map(([r, c]) => [r - minRow, c - minCol]);
      const height = Math.max(...cells.map(([r]) => r)) + 1;
      const width = Math.max(...cells.map(([, c]) => c)) + 1;
      for (let dRow = 0; dRow + height <= 3; dRow++) {
        for (let dCol = 0; dCol + width <= 3; dCol++) {
          const mask = Array(9).fill('0');
          for (const [r, c] of cells) mask[(r + dRow) * 3 + (c + dCol)] = '1';
          masks.add(mask.join(''));
        }
      }
    }
  }
  return [...masks];
};
const MASKS = TETROMINOES.map(boxMasks);

// The twelve sets of four distinct digits from 1-9 that sum to 20. VC value v
// names COMBOS[v - 1], so "the shaded digits sum to 20" and "no combination is
// used twice" become the membership machine below plus one AllDifferent.
const COMBOS = [];
for (let a = 1; a <= 9; a++)
  for (let b = a + 1; b <= 9; b++)
    for (let c = b + 1; c <= 9; c++)
      for (let d = c + 1; d <= 9; d++)
        if (a + b + c + d === 20) COMBOS.push([a, b, c, d]);

// Box shape machine. Reads the box's VT cell, then the box's nine VS cells
// row-major. The state walks the shade mask one cell at a time and keeps only
// prefixes that still extend to a placement of the chosen type, so reaching
// the ninth cell means the box's shading is exactly one of them.
const tetrominoSpec = NFA.encodeSpec({
  startState: 'type',
  transition: (state, value) => {
    if (state === 'type') {
      return value <= TETROMINOES.length ? { type: value, mask: '' } : undefined;
    }
    if (value !== SHADED && value !== UNSHADED) return undefined;
    const mask = state.mask + (value === SHADED ? '1' : '0');
    return MASKS[state.type - 1].some(m => m.startsWith(mask))
      ? { type: state.type, mask } : undefined;
  },
  accept: (state) => state !== 'type' && state.mask.length === 9,
  maxDepth: 10,
}, shape);

// Box digit-set machine. Reads the box's VC cell, then the box's nine cells as
// (shade, digit) pairs. `left` is the bitmask of set members not yet matched:
// a shaded cell must take one of them, an unshaded cell's digit is skipped.
// Emptying `left` therefore means exactly four shaded cells holding exactly
// the four digits of the named set.
const comboSpec = NFA.encodeSpec({
  startState: 'combo',
  transition: (state, value) => {
    if (state === 'combo') {
      return value <= COMBOS.length
        ? { combo: value, left: 0b1111, next: 'shade' } : undefined;
    }
    const { combo, left, next } = state;
    if (next === 'shade') {
      if (value === SHADED) return { combo, left, next: 'digit' };
      if (value === UNSHADED) return { combo, left, next: 'skip' };
      return undefined;
    }
    if (next === 'skip') return { combo, left, next: 'shade' };
    const index = COMBOS[combo - 1].indexOf(value);
    if (index < 0 || !(left & (1 << index))) return undefined;
    return { combo, left: left & ~(1 << index), next: 'shade' };
  },
  accept: (state) =>
    state !== 'combo' && state.left === 0 && state.next === 'shade',
  maxDepth: 19,
}, shape);

// Line pair-count machine. Reads the line's VE cell, then the line's nine VS
// cells in order, counting adjacent shaded-shaded pairs along it. VE holds one
// more than that count so it stays inside the 1-12 value range; `prev` 0 is
// "no previous cell". Counting past the target can only fail, so it is cut.
const pairCountSpec = NFA.encodeSpec({
  startState: 'target',
  transition: (state, value) => {
    if (state === 'target') {
      return value <= 9 ? { target: value - 1, prev: 0, count: 0 } : undefined;
    }
    if (value !== SHADED && value !== UNSHADED) return undefined;
    const count = state.count
      + (value === SHADED && state.prev === SHADED ? 1 : 0);
    if (count > state.target) return undefined;
    return { target: state.target, prev: value, count };
  },
  accept: (state) => state !== 'target' && state.count === state.target,
  maxDepth: 10,
}, shape);

const types = new Var('T', 'box tetromino type', '3x3');
const combos = new Var('C', 'box shaded digit set', 9);
const pairCounts = new Var('E', 'shaded pairs per line', 18);

const boxes = graph.boxes();
const lines = [...graph.rows(), ...graph.columns()];

const boxRules = boxes.flatMap((box, i) => [
  new NFA(tetrominoSpec, 'tetromino', types.cell(i + 1), ...shade.at(box)),
  new NFA(comboSpec, 'sum20set', combos.cell(i + 1),
    ...box.flatMap(cell => [shade.at(cell), cell])),
]);

// One T, one L and one S in each band and each stack of boxes.
const typeBands = [1, 2, 3].map(
  row => new AllDifferent(...[1, 2, 3].map(col => types.cell(row, col))));
const typeStacks = [1, 2, 3].map(
  col => new AllDifferent(...[1, 2, 3].map(row => types.cell(row, col))));

const pairCountRules = lines.map(
  (line, i) => new NFA(pairCountSpec, 'shadedpairs',
    pairCounts.cell(i + 1), ...shade.at(line)));

const noShadedSquares = graph.cells()
  .map(cell => graph.block(cell, 2, 2))
  .filter(block => block !== null)
  .map(block => new ContainAtLeast(String(UNSHADED), ...shade.at(block)));

return [
  shape,
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),

  shade.toVar('shading'),
  shade.makeReplicate(new Given(shade.cells()[0], SHADED, UNSHADED)),
  ...GIVEN_SHADED.map(cell => new Given(shade.at(cell), SHADED)),

  types,
  ...types.cells().map(cell => new Given(cell, 1, 2, 3)),
  combos,
  pairCounts,
  ...pairCounts.cells().map(
    cell => new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8, 9)),

  ...boxRules,
  ...typeBands,
  ...typeStacks,
  new AllDifferent(...combos.cells()),

  // Four shaded cells in each of the nine boxes make 36 in all.
  new ConnectedValues('VS', SHADED, 36),

  // No loops: with the shaded cells connected, the wall is acyclic exactly
  // when its 36 cells span 35 adjacent shaded pairs (V - E = 1). Each VE cell
  // holds its line's count plus one, so the 18 lines total 35 + 18.
  ...pairCountRules,
  new Sum(53, ...pairCounts.cells()),

  ...noShadedSquares,
];
