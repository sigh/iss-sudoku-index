// Title: Full Rank Tessellation
// Author: ThePedallingPianist & Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=KOMpPzh89es
// Source: https://sudokupad.app/q83v6obrdn

// TESSELLATION
// - Fill each cell (octagon or square) with a digit 1-9.
// - Cells sharing a drawn edge cannot repeat a digit.
// - Each horizontal row and vertical column holds a non-repeating consecutive
//   run of digits (e.g. 2345678), in any order, however long that row/column
//   is.
//
// FULL RANK
// - Two families of five-cell diagonals exist (see below). Read as a 5-digit
//   number from the direction an arrow points, each of the 20 possible
//   (diagonal, direction) readings has a rank from lowest (1) to highest (20).
//   A clue at the arrow's tail gives that one reading's rank.
// - A tie shares the lower rank (both readings would report the same value).
//
// The drawn board is a diamond of 41 cells, |row-5|+|col-5| <= 4, alternating
// octagon/square by (row+col) parity; every other cell of the 9x9 canvas is
// unused. Each octagon also touches its 4 diagonal octagon neighbours (its
// chamfered corners meet theirs) besides its 4 orthogonal neighbours -- the
// source of the non-orthogonal "shares an edge" pairs; squares only touch
// orthogonally. The lone given (R4C4=8) sits on an octagon, and the
// row/column lengths this diamond produces (1,3,5,7,9,7,5,3,1) match the
// rules text's own worked example of a 7-digit consecutive run.
//
// The two arrows both start at the diamond's top cell R1C5: one runs
// down-right R1C5-R2C6-R3C7-R4C8-R5C9 (clue "14"), the other down-left
// R1C5-R2C4-R3C3-R4C2-R5C1 (clue "7"). The third clue ("11") sits outside the
// board beyond R6C8, reading the ray R6C8-R5C7-R4C6-R3C5-R2C4 -- the same
// 5-cell diagonal family as the first arrow, one step in from the corner,
// read from its own (bottom-right) end.

const shape = new Shape('9x9', '0-9', 'Raw');

// -- Board geometry (derived, not hand-enumerated) --------------------------

const isReal = (r, c) => Math.abs(r - 5) + Math.abs(c - 5) <= 4;
const isOctagon = (r, c) => (r + c) % 2 === 0;

const realCells = [];
const padCells = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    (isReal(r, c) ? realCells : padCells).push({ r, c, id: makeCellId(r, c) });
  }
}

const givens = [
  // Cells outside the drawn diamond are not part of the puzzle: pin them off
  // the playable 1-9 range so they contribute no free Latin square.
  ...padCells.map(({ id }) => new Given(id, 0)),
  ...realCells
    .filter(({ r, c }) => !(r === 4 && c === 4))
    .map(({ id }) => new Given(id, 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  new Given('R4C4', 8),
];

// -- Tessellation adjacency: orthogonal (all real cells) plus the diagonal
// octagon-to-octagon edges the chamfered corners add. -----------------------

const adjacencyPairs = [];
const seenEdges = new Set();
const addEdge = (a, b) => {
  const key = a < b ? `${a}|${b}` : `${b}|${a}`;
  if (seenEdges.has(key)) return;
  seenEdges.add(key);
  adjacencyPairs.push(new AllDifferent(a, b));
};
for (const { r, c, id } of realCells) {
  if (isReal(r, c + 1)) addEdge(id, makeCellId(r, c + 1));
  if (isReal(r + 1, c)) addEdge(id, makeCellId(r + 1, c));
  if (isOctagon(r, c)) {
    for (const [dr, dc] of [[1, 1], [1, -1]]) {
      const [nr, nc] = [r + dr, c + dc];
      if (isReal(nr, nc) && isOctagon(nr, nc)) addEdge(id, makeCellId(nr, nc));
    }
  }
}

// -- Rows/columns: each is a Renban (consecutive, non-repeating) run over the
// real cells only, whatever that row/column's length. ------------------------

const lineGroups = [];
for (let r = 1; r <= 9; r++) {
  const cells = realCells.filter(cell => cell.r === r).map(cell => cell.id);
  if (cells.length >= 2) lineGroups.push(new Renban(...cells));
}
for (let c = 1; c <= 9; c++) {
  const cells = realCells.filter(cell => cell.c === c).map(cell => cell.id);
  if (cells.length >= 2) lineGroups.push(new Renban(...cells));
}

// -- Full Rank: the 10 length-5 diagonals (5 per direction), each readable
// forwards or backwards, are the 20 "rows or columns" the rules rank. --------

const diagonalFamilies = [];
for (const d of [-4, -2, 0, 2, 4]) {
  // backslash: row - col == d, walked in increasing row (down-right).
  const cells = [];
  for (let r = 1; r <= 9; r++) {
    const c = r - d;
    if (c >= 1 && c <= 9 && isReal(r, c)) cells.push(makeCellId(r, c));
  }
  diagonalFamilies.push(cells);
}
for (const s of [6, 8, 10, 12, 14]) {
  // forward slash: row + col == s, walked in increasing row (down-left).
  const cells = [];
  for (let r = 1; r <= 9; r++) {
    const c = s - r;
    if (c >= 1 && c <= 9 && isReal(r, c)) cells.push(makeCellId(r, c));
  }
  diagonalFamilies.push(cells);
}
// Every one of the 10 families is exactly 5 cells long on this diamond.
for (const cells of diagonalFamilies) {
  if (cells.length !== 5) throw new Error('expected a 5-cell diagonal');
}

// The 20 ranked entries: each family read forwards, and read backwards.
const entries = [];
for (const cells of diagonalFamilies) {
  entries.push(cells);
  entries.push([...cells].reverse());
}

const sameEntry = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const findEntry = (cells) => entries.findIndex(e => sameEntry(e, cells));

const clues = [
  { cells: ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'], rank: 14 },
  { cells: ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'], rank: 7 },
  { cells: ['R6C8', 'R5C7', 'R4C6', 'R3C5', 'R2C4'], rank: 11 },
];

// Comparator NFA: interleaved [y1,x1,y2,x2,...,y5,x5, outVar]. Tracks whether
// the y-reading is still tied with the x-reading, or already decided less/
// greater; once decided, later digit pairs are consumed without changing the
// verdict. The trailing outVar cell must then match 1 (y < x) or 0 (not).
// State is {pos, cmp, pendingY}: pos counts symbols read (0..11, so no
// unbounded field), cmp in {'T','L','G'}, pendingY holds a remembered
// y-digit only while awaiting its paired x-digit.
const comparatorSpec = NFA.encodeSpec({
  startState: { pos: 0, cmp: 'T', pendingY: null },
  transition: ({ pos, cmp, pendingY }, value) => {
    if (pos < 10) {
      const isYDigit = (pos % 2) === 0;
      if (cmp !== 'T') return { pos: pos + 1, cmp, pendingY: null };
      if (isYDigit) return { pos: pos + 1, cmp, pendingY: value };
      const next = value > pendingY ? 'L' : (value < pendingY ? 'G' : 'T');
      return { pos: pos + 1, cmp: next, pendingY: null };
    }
    // pos === 10: this is the trailing outVar read.
    return { pos: pos + 1, cmp, pendingY: null, outVar: value };
  },
  accept: ({ pos, cmp, outVar }) =>
    pos === 11 && ((cmp === 'L') === (outVar === 1)),
  maxDepth: 11,
}, shape);

// One comparator output per (clue, other entry) pair: 3 clues x 19 others.
const cmpVarCount = clues.length * (entries.length - 1);
const cmpVars = new Var('C', 'fullRankCmp', cmpVarCount);
// Every comparator output has the same {0, 1} domain; stamp it once instead
// of one Given per cell, via a Replicate over a locator graph sized to the
// group (the Var group is not grid-paired, so it needs its own locator).
const cmpVarsLocator = cellGraph('6x10'); // 60 >= 57 cells, dims within limit
const cmpVarsDomain = cmpVarsLocator
  .makeOverlay('VC', cmpVarsLocator.cells().slice(0, cmpVarCount))
  .makeReplicate(new Given(cmpVars.cell(1), 0, 1));
let cmpVarIndex = 0;
const cmpConstraints = [];
const rankSums = [];

for (const clue of clues) {
  const xIndex = findEntry(clue.cells);
  if (xIndex < 0) throw new Error('clue diagonal not among the 20 entries');
  const outVars = [];
  for (let i = 0; i < entries.length; i++) {
    if (i === xIndex) continue;
    const yCells = entries[i];
    cmpVarIndex++;
    const outVarId = cmpVars.cell(cmpVarIndex);
    const interleaved = [];
    for (let k = 0; k < 5; k++) {
      interleaved.push(yCells[k]);
      interleaved.push(clue.cells[k]);
    }
    cmpConstraints.push(
      new NFA(comparatorSpec, 'fullRankLess', [...interleaved, outVarId]));
    outVars.push(outVarId);
  }
  rankSums.push(new Sum(clue.rank - 1, ...outVars));
}

return [
  shape,
  cmpVars,
  ...givens,
  ...adjacencyPairs,
  ...lineGroups,
  cmpVarsDomain,
  ...cmpConstraints,
  ...rankSums,
];
