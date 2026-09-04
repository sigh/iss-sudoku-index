// Title: Productivity Killer (BYOK+)
// Author: SeveNateNine
// Video: https://www.youtube.com/watch?v=6YjuZR7Hm6U
// Source: https://sudokupad.app/egdqy9d7al

// Rules encoded, all of them:
//  - Normal sudoku rules apply.
//  - A cage is a set of orthogonally connected cells with no repeated digit.
//    Cages do not overlap. The cages are not drawn: the solver places them.
//  - The digits in a cage sum to the product of all the individual
//    side-lengths of that cage, i.e. of every straight segment of the cage's
//    outline (a 2x3 cage totals 2*3*2*3 = 36, not its area 6).
//  - A circle marks a cell inside a cage whose digit is the number of cells in
//    that cage. A square marks a cell that is in no cage. All possible circles
//    and squares are given: every unmarked cell is in a cage, and no unmarked
//    caged cell holds its cage's size.
//
// Model. A cage has no repeated digit, so it has at most 9 cells, and every
// cage is one of the finitely many fixed polyominoes of up to 9 cells whose
// side-product can be written as a sum of that many distinct digits. Each
// cage is named by its ROOT, its first cell in reading order. Three overlays
// hold, per unmarked-or-circled cell, the row and column of its cage's root
// and the size of its cage. One Or per cell lists every legal cage rooted
// there (or lets the cell belong to a cage rooted elsewhere); a counting NFA
// per root makes exactly the chosen cage's cells name that root, which is what
// makes the cages disjoint and leaves no cell uncaged.

// Drawn marks, from the circle and rectangle entries of the source.
const CIRCLES = [
  'R1C1', 'R1C4', 'R2C6', 'R4C1', 'R4C2', 'R4C3', 'R4C7', 'R5C1', 'R5C3',
  'R6C1', 'R6C2', 'R6C3', 'R7C7', 'R8C9', 'R9C4',
];
const SQUARES = [
  'R1C9', 'R2C7', 'R3C3', 'R6C8', 'R6C9', 'R8C5', 'R9C1', 'R9C5', 'R9C7',
];

const MAX_CAGE = 9;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const circleSet = new Set(CIRCLES);
const squareSet = new Set(SQUARES);
const cagedCells = graph.cells().filter((cell) => !squareSet.has(cell));

const key = (cells) => JSON.stringify(cells);
const compareRC = (a, b) => a[0] - b[0] || a[1] - b[1];

// --- Cage shapes ----------------------------------------------------------
// Every fixed polyomino of 1..MAX_CAGE cells, translated so that its first
// cell in reading order is [0, 0].
const normalise = (cells) => {
  const sorted = cells.slice().sort(compareRC);
  const [r0, c0] = sorted[0];
  return sorted.map(([r, c]) => [r - r0, c - c0]);
};
const SHAPES = (() => {
  const all = [];
  let layer = [[[0, 0]]];
  for (let size = 1; size <= MAX_CAGE; size++) {
    all.push(...layer);
    const next = new Map();
    for (const shape of layer) {
      const inShape = new Set(shape.map(key));
      for (const [r, c] of shape) {
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const grown = [r + dr, c + dc];
          if (inShape.has(key(grown))) continue;
          const norm = normalise([...shape, grown]);
          next.set(key(norm), norm);
        }
      }
    }
    layer = [...next.values()];
  }
  return all;
})();

// The product of the cage's side-lengths. A side is a maximal straight run of
// the outline with the cage on one side of it. The outline's unit edges are
// grouped by which face of which row or column they lie on, so two collinear
// runs that meet at a pinch point (two cage cells touching only at a corner)
// count as two sides: the cage is on opposite sides of them. Under the other
// reading of a pinch, one side through the point, every pinched shape
// totals 108 or 144, beyond any 7 or 8 distinct digits, so that reading only
// removes cages: this one admits every cage either reading allows.
function sideProduct(shape) {
  const inShape = new Set(shape.map(key));
  const faces = new Map();
  const addEdge = (face, position) => {
    if (!faces.has(face)) faces.set(face, []);
    faces.get(face).push(position);
  };
  for (const [r, c] of shape) {
    if (!inShape.has(key([r - 1, c]))) addEdge(`top of row ${r}`, c);
    if (!inShape.has(key([r + 1, c]))) addEdge(`bottom of row ${r}`, c);
    if (!inShape.has(key([r, c - 1]))) addEdge(`left of column ${c}`, r);
    if (!inShape.has(key([r, c + 1]))) addEdge(`right of column ${c}`, r);
  }
  let product = 1;
  for (const positions of faces.values()) {
    positions.sort((a, b) => a - b);
    let run = 1;
    for (let i = 1; i < positions.length; i++) {
      if (positions[i] === positions[i - 1] + 1) {
        run++;
      } else {
        product *= run;
        run = 1;
      }
    }
    product *= run;
  }
  return product;
}

// digitSets[n][total] = which of {size in set, size not in set} a set of n
// distinct digits 1-9 summing to total can achieve. A cage with a circle holds
// its size as a digit; a cage without one does not (all circles are given).
const digitSets = Array.from({ length: MAX_CAGE + 1 }, () => new Map());
for (let mask = 1; mask < (1 << numValues); mask++) {
  const digits = [];
  for (let d = 1; d <= numValues; d++) if (mask & (1 << (d - 1))) digits.push(d);
  const n = digits.length;
  if (n > MAX_CAGE) continue;
  const total = digits.reduce((a, b) => a + b, 0);
  const entry = digitSets[n].get(total) || { withSize: false, withoutSize: false };
  if (digits.includes(n)) entry.withSize = true; else entry.withoutSize = true;
  digitSets[n].set(total, entry);
}

// --- Cage placements ------------------------------------------------------
// Every translation of every shape onto the grid that covers no square and
// at most one circle (two circles in one cage would repeat its size digit),
// and whose total can be made from that many distinct digits that include
// the size exactly when the cage holds a circle. Each placement is recorded
// under its root.
const placementsByRoot = new Map();
const rootsReaching = new Map();
for (const shape of SHAPES) {
  const product = sideProduct(shape);
  const sizes = digitSets[shape.length].get(product);
  if (!sizes) continue;
  for (const root of cagedCells) {
    const cells = shape.map(([dr, dc]) => graph.step(root, dr, dc));
    if (cells.some((cell) => cell === null || squareSet.has(cell))) continue;
    const circled = cells.filter((cell) => circleSet.has(cell)).length;
    if (circled > 1) continue;
    if (!(circled ? sizes.withSize : sizes.withoutSize)) continue;
    if (!placementsByRoot.has(root)) placementsByRoot.set(root, []);
    placementsByRoot.get(root).push({ cells, product });
    for (const cell of cells) {
      if (!rootsReaching.has(cell)) rootsReaching.set(cell, new Set());
      rootsReaching.get(cell).add(root);
    }
  }
}
for (const cell of cagedCells) {
  if (!rootsReaching.has(cell)) throw new Error(`${cell} is in no legal cage`);
}

// --- Overlays -------------------------------------------------------------
// Per cell that is not a square: VR and VC hold the row and column of the
// root of its cage, VN the number of cells in its cage.
const rootRow = graph.makeOverlay('VR', cagedCells);
const rootCol = graph.makeOverlay('VC', cagedCells);
const cageSize = graph.makeOverlay('VN', cagedCells);
const rowOf = (cell) => parseCellId(cell).row;
const colOf = (cell) => parseCellId(cell).col;
const allBut = (value) =>
  Array.from({ length: numValues }, (_, i) => i + 1).filter((v) => v !== value);

// A cage placed: its cells name the root and the size, and its digits are
// distinct and sum to the side-product. A one-cell cage is the digit 1.
const placementBranch = (root, { cells, product }) => new And([
  ...cells.map((cell) => new Given(rootRow.at(cell), rowOf(root))),
  ...cells.map((cell) => new Given(rootCol.at(cell), colOf(root))),
  ...cells.map((cell) => new Given(cageSize.at(cell), cells.length)),
  cells.length === 1 ? new Given(cells[0], product) : new Cage(product, ...cells),
]);

// Each cell is either not a root (its cage's root is some other cell) or the
// root of one of the cages listed for it.
const cageChoice = cagedCells.map((cell) => new Or([
  new Given(rootRow.at(cell), ...allBut(rowOf(cell))),
  new Given(rootCol.at(cell), ...allBut(colOf(cell))),
  ...(placementsByRoot.get(cell) || []).map(
    (placement) => placementBranch(cell, placement)),
]));

// A cell may only name a root whose listed cages include it. Applied to
// [VR, VC] of the cell.
const rootDomain = cagedCells.map((cell) => {
  const allowed = new Set([...rootsReaching.get(cell)].map(
    (root) => rowOf(root) * 16 + colOf(root)));
  return new Pair(
    Pair.fnToKey((r, c) => allowed.has(r * 16 + c), geometry),
    'root-in-reach', rootRow.at(cell), rootCol.at(cell));
});

// Exactly the cells of the cage rooted at a cell name it as their root. Reads
// [VR, VC, VN] of the root, then [VR, VC] of every other cell one of its cages
// could hold. If the root names itself its cage has VN cells, itself
// included, and that many cells must name it; otherwise none may.
const rootCountSpec = (root) => {
  const r = rowOf(root), c = colOf(root);
  return NFA.encodeSpec({
    startState: { phase: 'root-row' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'root-row':
          return { phase: 'root-col', hit: value === r };
        case 'root-col':
          return { phase: 'root-size', isRoot: state.hit && value === c };
        case 'root-size':
          return state.isRoot
            ? { phase: 'row', target: value, count: 1 }
            : { phase: 'row', target: 0, count: 0 };
        case 'row':
          return { ...state, phase: 'col', hit: value === r };
        case 'col': {
          const count = state.count + (state.hit && value === c ? 1 : 0);
          if (count > state.target) return undefined;
          return { phase: 'row', target: state.target, count };
        }
      }
    },
    accept: (state) => state.phase === 'row' && state.count === state.target,
  }, numValues);
};
const rootCount = [...placementsByRoot].map(([root, placements]) => {
  const reached = new Set(placements.flatMap(({ cells }) => cells));
  reached.delete(root);
  return new NFA(rootCountSpec(root), 'cage-cells-name-root',
    rootRow.at(root), rootCol.at(root), cageSize.at(root),
    ...[...reached].flatMap((cell) => [rootRow.at(cell), rootCol.at(cell)]));
});

// A circled cell's digit is its cage's size; any other caged cell's digit is
// not (all circles are given).
const circleRule = cagedCells.map((cell) => circleSet.has(cell)
  ? new SameValues(2, cell, cageSize.at(cell))
  : new AllDifferent(cell, cageSize.at(cell)));

return [
  new Shape('9x9'),
  rootRow.toVar('cage root row'),
  rootCol.toVar('cage root column'),
  cageSize.toVar('cage size'),
  ...cageChoice,
  ...rootDomain,
  ...rootCount,
  ...circleRule,
];
