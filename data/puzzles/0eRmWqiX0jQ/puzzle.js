// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=0eRmWqiX0jQ
// Source: https://cracking-the-cryptic.web.app/sudoku/LhBdm9D7Nf

// Rules encoded below, in full; nothing is omitted.
//
//  - Normal Sudoku rules apply. There are no given digits.
//  - Clues outside the grid give the sum of the first X digits seen in that row
//    or column, where X is the first digit seen from the clue (X-Sums).
//  - The grid is divided into shapes. The shaded cells are the given shapes:
//    five tetrominoes and one lone cell. The remaining sixty cells are divided
//    into the twelve different pentominoes, one of each, rotations and
//    reflections allowed.
//  - Every pentomino crosses a box boundary.
//  - The three drawn bars are shape boundaries: the two cells a bar separates
//    lie in different shapes.
//  - Digits do not repeat within a shape. A pentomino's digits sum to an odd
//    number; a tetromino's digits sum to an even number. The lone shaded cell
//    R5C9 is a one-cell shape, which no sum rule names.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);

// Drawn data: the shaded cells, split into shapes by the two fills used in the
// source art. The column-1 run and the lone cell carry the second fill; the
// column-1 run is the group that touches another shaded shape (the T below).
const TETROMINOES = [
  ['R1C6', 'R1C7', 'R1C8', 'R2C8'],  // J/L
  ['R2C2', 'R3C2', 'R3C3', 'R4C2'],  // T
  ['R3C1', 'R4C1', 'R5C1', 'R6C1'],  // I
  ['R6C4', 'R7C3', 'R7C4', 'R8C3'],  // S/Z
  ['R6C7', 'R6C8', 'R7C7', 'R7C8'],  // O
];
const LONE_CELL = 'R5C9';

// Drawn data: the three bars, each as the pair of cells it separates.
const BARS = [
  ['R2C4', 'R2C5'],
  ['R5C7', 'R5C8'],
  ['R8C8', 'R9C8'],
];

// Drawn data: the outside clues, each as its value and the ray of grid cells
// it reads, starting at the cell nearest the clue and running inward.
const XSUM_CLUES = [
  { value: 17, cells: graph.ray('R1C1', 1, 0) },    // above column 1, reading down
  { value: 10, cells: graph.ray('R1C9', 1, 0) },    // above column 9, reading down
  { value: 34, cells: graph.ray('R9C2', -1, 0) },   // below column 2, reading up
  { value: 29, cells: graph.ray('R9C3', -1, 0) },   // below column 3, reading up
  { value: 8, cells: graph.ray('R9C8', -1, 0) },    // below column 8, reading up
  { value: 20, cells: graph.ray('R1C1', 0, 1) },    // left of row 1, reading right
  { value: 21, cells: graph.ray('R2C1', 0, 1) },    // left of row 2, reading right
  { value: 7, cells: graph.ray('R4C1', 0, 1) },     // left of row 4, reading right
  { value: 12, cells: graph.ray('R1C9', 0, -1) },   // right of row 1, reading left
  { value: 36, cells: graph.ray('R5C9', 0, -1) },   // right of row 5, reading left
  { value: 6, cells: graph.ray('R6C9', 0, -1) },    // right of row 6, reading left
  { value: 12, cells: graph.ray('R9C9', 0, -1) },   // right of row 9, reading left
];

// The twelve free pentominoes named by the rules, one orientation each; the
// rotations and reflections the rules allow are generated below.
const PENTOMINOES = {
  F: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]],
  I: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  L: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]],
  N: [[0, 1], [1, 1], [2, 0], [2, 1], [3, 0]],
  P: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]],
  T: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]],
  U: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]],
  V: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
  W: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]],
  X: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
  Y: [[0, 1], [1, 0], [1, 1], [2, 1], [3, 1]],
  Z: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]],
};

const shadedCells = new Set([...TETROMINOES.flat(), LONE_CELL]);
const openCells = [];
for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 9; col++) {
    const cell = makeCellId(row, col);
    if (!shadedCells.has(cell)) openCells.push(cell);
  }
}

// Normalize an offset list to its top-left corner so orientations that coincide
// (the X pentomino has one, the I two) are counted once.
const normalize = (offsets) => {
  const minRow = Math.min(...offsets.map(([r]) => r));
  const minCol = Math.min(...offsets.map(([, c]) => c));
  return offsets
    .map(([r, c]) => [r - minRow, c - minCol])
    .sort(([ar, ac], [br, bc]) => ar - br || ac - bc);
};

const orientationsOf = (offsets) => {
  const seen = new Map();
  for (const mirrored of [offsets, offsets.map(([r, c]) => [r, -c])]) {
    let current = mirrored;
    for (let turn = 0; turn < 4; turn++) {
      current = current.map(([r, c]) => [c, -r]);  // quarter turn
      const canonical = normalize(current);
      seen.set(JSON.stringify(canonical), canonical);
    }
  }
  return [...seen.values()];
};

const boxOf = (row, col) => Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
const openCellSet = new Set(openCells);
const barPairs = BARS.map((pair) => new Set(pair));

// Every way each pentomino can sit on the board under the rules: on unshaded
// cells only, crossing a box boundary, and not swallowing a bar.
const placements = Object.entries(PENTOMINOES).flatMap(([name, offsets]) =>
  orientationsOf(offsets).flatMap((orientation) => {
    const height = Math.max(...orientation.map(([r]) => r)) + 1;
    const width = Math.max(...orientation.map(([, c]) => c)) + 1;
    const positions = [];
    for (let row = 1; row + height - 1 <= 9; row++) {
      for (let col = 1; col + width - 1 <= 9; col++) {
        const coords = orientation.map(([r, c]) => [row + r, col + c]);
        const cells = coords.map(([r, c]) => makeCellId(r, c));
        if (!cells.every((cell) => openCellSet.has(cell))) continue;
        if (new Set(coords.map(([r, c]) => boxOf(r, c))).size === 1) continue;
        const cellSet = new Set(cells);
        if (barPairs.some((bar) => [...bar].every((cell) => cellSet.has(cell)))) continue;
        positions.push({ name, cells });
      }
    }
    return positions;
  }));

// One flag per placement: 2 means the piece sits there, 1 means it does not.
// The flags are held to those two values by the cover sums below (a set of
// cells each at least 1 totalling one more than its size has exactly one 2)
// and again by the shape machine, which reads no other flag value.
const flags = new Var('P', 'pentomino placements', String(placements.length));
const flagCells = flags.cells();

// Exactly one of a set of 1/2 flags is chosen when they total (count + 1),
// since every flag contributes at least 1 and the single 2 adds the surplus.
const chooseOne = (cells) => new Sum(cells.length + 1, ...cells);

const coveringFlags = new Map(openCells.map((cell) => [cell, []]));
placements.forEach((placement, index) => {
  for (const cell of placement.cells) coveringFlags.get(cell).push(flagCells[index]);
});

const flagsByPentomino = new Map(Object.keys(PENTOMINOES).map((name) => [name, []]));
placements.forEach((placement, index) => {
  flagsByPentomino.get(placement.name).push(flagCells[index]);
});

// Reads a placement's flag, then the five digits it would cover. When the flag
// is 1 the placement is unused and the digits are free; when it is 2 the digits
// must be five different values whose total is odd. The state carries a bitmask
// of the digits seen so far, which is all the accept test needs: its bit count
// is the length and its bits give the total.
const pentominoShapeRule = NFA.encodeSpec({
  startState: { phase: 'flag' },
  transition: (state, value) => {
    if (state.phase === 'flag') {
      if (value === 1) return { phase: 'unused', read: 0 };
      if (value === 2) return { phase: 'used', seen: 0 };
      return undefined;  // flags hold only 1 and 2
    }
    if (state.phase === 'unused') {
      return state.read < 5 ? { phase: 'unused', read: state.read + 1 } : undefined;
    }
    const bit = 1 << (value - 1);
    if (state.seen & bit) return undefined;  // digits do not repeat in a shape
    return { phase: 'used', seen: state.seen | bit };
  },
  accept: (state) => {
    if (state.phase === 'unused') return state.read === 5;
    if (state.phase !== 'used') return false;
    let count = 0;
    let total = 0;
    for (let value = 1; value <= 9; value++) {
      if (state.seen & (1 << (value - 1))) { count++; total += value; }
    }
    return count === 5 && total % 2 === 1;
  },
  maxDepth: 6,
}, shape);

// A tetromino's four digits total an even number; the running parity is the
// whole state, and the digits' distinctness is the AllDifferent beside it.
const evenTotal = NFA.encodeSpec({
  startState: { parity: 0 },
  transition: (state, value) => ({ parity: (state.parity + value) % 2 }),
  accept: (state) => state.parity === 0,
  maxDepth: 4,
}, shape);

return [
  shape,
  flags,

  // Each unshaded cell lies in exactly one pentomino, and each of the twelve
  // pentominoes is placed exactly once.
  ...openCells.map((cell) => chooseOne(coveringFlags.get(cell))),
  ...[...flagsByPentomino.values()].map(chooseOne),

  ...placements.map((placement, index) => new NFA(
    pentominoShapeRule, `pentomino ${placement.name}`,
    flagCells[index], ...placement.cells)),

  ...TETROMINOES.map((cells) => new AllDifferent(...cells)),
  ...TETROMINOES.map((cells) => new NFA(evenTotal, 'tetromino total', ...cells)),

  ...XSUM_CLUES.map(({ value, cells }) => XSum.fromCells(value, cells, geometry)),
];
