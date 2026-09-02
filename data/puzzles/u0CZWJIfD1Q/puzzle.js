// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=u0CZWJIfD1Q
// Source: https://cracking-the-cryptic.web.app/sudoku/4RBQDTHFfn

// Japanese Sums With Pentominos, by Uhu. A 12x12 board with no boxes and no
// givens; every clue is printed in the margin outside the board.
//
// Rules encoded here:
//  - Some cells are blackened; every other cell holds a digit from 1 to 9, and
//    no digit occurs more than once in a row or a column.
//  - The numbers outside a line give, in order, the sums of that line's blocks
//    of connected digits. The clue list is complete, so a line holds exactly as
//    many blocks as it has clues, and a block may be a single digit.
//  - Every 2, 3, 5 and 8 appearing in a clue is printed; a printed dot is any
//    other digit, 0 1 4 6 7 or 9. A two-digit clue may not begin with a 0.
//  - The blackened cells form exactly twelve pentominoes, one of each of the
//    twelve possible 5-cell shapes, and no two of them touch, even diagonally.
// Nothing is omitted.

const BOARD = 12;
const BLACK = 0;                 // the board value standing for a blackened cell
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const DOT_DIGITS = [0, 1, 4, 6, 7, 9];   // what a printed dot may be

// Values 0-12 on a Raw grid. The board needs 0 (blackened) plus 1-9, and a row
// or column is not an all-different group here because 0 repeats along it, so
// every line rule below is stated explicitly. The extra values 10-12 exist only
// so that the pentomino overlay can carry one label per 5-cell shape.
const shape = new Shape('12x12', '0-12', 'Raw');
const graph = cellGraph(shape);
const pent = graph.makeOverlay('VP');
const pentVar = pent.toVar('Pentomino');
const UNSHADED = 0;              // the overlay value for a cell with a digit

// The clues, transcribed from the margin marks. Row clues are the marks in the
// five margin columns left of the board, in left-to-right order; column clues
// are the marks in the four margin rows above it, in top-to-bottom order. Each
// entry is the clue exactly as printed, with '.' for a hidden digit.
const rowClues = [
  ['2', '.', '.'],                    // R1
  ['.', '..', '.3', '.'],             // R2
  ['3', '.', '25', '5'],              // R3
  ['.', '.', '33'],                   // R4
  ['22', '.', '2'],                   // R5
  ['.2', '..', '..'],                 // R6
  ['5', '.', '33'],                   // R7
  ['.', '5', '25'],                   // R8
  ['..', '2.'],                       // R9
  ['.', '38'],                        // R10
  ['.', '8', '3', '2', '..'],         // R11
  ['2', '.', '.5', '.2'],             // R12
];
const columnClues = [
  ['2.', '3'],                        // C1
  ['3.', '5'],                        // C2
  ['.', '28'],                        // C3
  ['.8', '..'],                       // C4
  ['..', '.3', '3', '8'],             // C5
  ['.2', '2', '8', '.'],              // C6
  ['.5', '.3', '..'],                 // C7
  ['3.'],                             // C8
  ['22', '22'],                       // C9
  ['.', '5', '.2', '.'],              // C10
  ['3', '..', '2.'],                  // C11
  ['3.', '.2'],                       // C12
];

// A printed clue stands for a set of sums: a dot is any of DOT_DIGITS, a printed
// digit is itself, and a two-character clue may not lead with 0.
const clueValues = (clue) => {
  const digitsFor = (ch) => (ch === '.' ? DOT_DIGITS : [Number(ch)]);
  if (clue.length === 1) return digitsFor(clue);
  const values = [];
  for (const tens of digitsFor(clue[0])) {
    if (tens === 0) continue;
    for (const ones of digitsFor(clue[1])) values.push(10 * tens + ones);
  }
  return values;
};

// One machine per line, rebuilding that line's block structure as it scans.
// State {done, sum}: `done` blocks have been closed and matched against the
// clues in order, and `sum` is the running total of the block currently open
// (0 when no block is open, which no real block can total). A blackened cell
// closes an open block, which must total one of clue `done`'s possible values;
// a digit extends the open block, and is rejected once the total passes the
// largest value that clue could be. Accepting only when every clue has been
// consumed is what makes the clue list complete rather than a prefix.
const lineSpec = (clues) => {
  const sums = clues.map(clue => new Set(clueValues(clue)));
  const caps = sums.map(values => Math.max(...values));
  return NFA.encodeSpec({
    startState: { done: 0, sum: 0 },
    transition: ({ done, sum }, value) => {
      if (value === BLACK) {
        if (sum === 0) return { done, sum };
        return sums[done].has(sum) ? { done: done + 1, sum: 0 } : undefined;
      }
      if (done >= clues.length) return undefined;   // more blocks than clues
      const total = sum + value;
      return total > caps[done] ? undefined : { done, sum: total };
    },
    accept: ({ done, sum }) => (
      sum === 0
        ? done === clues.length
        : done === clues.length - 1 && sums[done].has(sum)),
  }, shape);
};

// No digit repeats along a line, while blackened cells repeat freely. The state
// is the set of digits already seen, as a bitmask.
const distinctSpec = NFA.encodeSpec({
  startState: 0,
  transition: (seen, value) => {
    if (value === BLACK) return seen;
    const bit = 1 << (value - 1);
    return (seen & bit) ? undefined : (seen | bit);
  },
  accept: () => true,
}, shape);

// "The complete set of possible 5-cell shapes": grow every polyomino up to five
// orthogonally connected cells, then fold them together under the eight
// rotations and reflections. That leaves the twelve shapes the rules name as
// FILNPTUVWXYZ, and the script refuses to run if it does not.
const normalise = (cells) => {
  const top = Math.min(...cells.map(([r]) => r));
  const left = Math.min(...cells.map(([, c]) => c));
  return cells.map(([r, c]) => [r - top, c - left])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
};
const shapeKey = (cells) => JSON.stringify(normalise(cells));
const SYMMETRIES = [
  ([r, c]) => [r, c], ([r, c]) => [c, -r], ([r, c]) => [-r, -c], ([r, c]) => [-c, r],
  ([r, c]) => [r, -c], ([r, c]) => [-c, -r], ([r, c]) => [-r, c], ([r, c]) => [c, r],
];
const orientations = (cells) => {
  const distinct = new Map();
  for (const symmetry of SYMMETRIES) {
    const turned = normalise(cells.map(symmetry));
    distinct.set(shapeKey(turned), turned);
  }
  return [...distinct.values()];
};
const grow = (polyominoes) => {
  const grown = new Map();
  for (const cells of polyominoes) {
    for (const [r, c] of cells) {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (cells.some(([rr, cc]) => rr === r + dr && cc === c + dc)) continue;
        const bigger = normalise([...cells, [r + dr, c + dc]]);
        grown.set(shapeKey(bigger), bigger);
      }
    }
  }
  return [...grown.values()];
};
let polyominoes = [[[0, 0]]];
for (let size = 2; size <= 5; size++) polyominoes = grow(polyominoes);
const free = new Map();
for (const cells of polyominoes) {
  const canonical = orientations(cells).map(shapeKey).sort()[0];
  if (!free.has(canonical)) free.set(canonical, cells);
}
const pentominoes = [...free.values()];
if (pentominoes.length !== 12) {
  throw new Error(`expected 12 pentominoes, generated ${pentominoes.length}`);
}

// Every way one shape can sit on the board: each of its distinct orientations at
// each translation that fits. The shape and its cell count are fixed, so this
// candidate list is finite and short enough to disjoin over.
const placements = (cells) => orientations(cells).flatMap((oriented) => {
  const height = Math.max(...oriented.map(([r]) => r)) + 1;
  const width = Math.max(...oriented.map(([, c]) => c)) + 1;
  const spots = [];
  for (let top = 1; top + height <= BOARD + 1; top++) {
    for (let left = 1; left + width <= BOARD + 1; left++) {
      spots.push(oriented.map(([r, c]) => makeCellId(top + r, left + c)));
    }
  }
  return spots;
});

// A cell is blackened exactly when it carries a pentomino label.
const shadedKey = Pair.fnToKey(
  (value, label) => (value === BLACK) === (label !== UNSHADED), shape);
// Two labelled cells that touch, orthogonally or diagonally, must belong to the
// same pentomino -- which is "the pentominos may not touch, even diagonally".
const noTouchKey = Pair.fnToKey(
  (a, b) => a === UNSHADED || b === UNSHADED || a === b, shape);

// Each cell need only be compared with the neighbours below and to the right of
// it, so the no-touch rule is the same relation stamped out at four offsets.
// Every template is anchored at the overlay's first cell and replicated onto the
// cells where its shifted copy still lands on the board.
const at = (row, col) => pentVar.cell(row, col);
const targets = (rows, cols) => {
  const cells = [];
  for (let r = 1; r <= rows; r++) for (let c = 1; c <= cols; c++) cells.push(at(r, c));
  return cells;
};
const noTouchOffsets = [
  [at(1, 1), at(1, 2), BOARD, BOARD - 1],       // right
  [at(1, 1), at(2, 1), BOARD - 1, BOARD],       // below
  [at(1, 1), at(2, 2), BOARD - 1, BOARD - 1],   // below-right
  // Below-left, drawn as the other diagonal of the same 2x2 block so that the
  // template still sits at or right of its anchor.
  [at(1, 2), at(2, 1), BOARD - 1, BOARD - 1],
];

return [
  shape,
  pentVar,
  // The board's own cells hold only a blackened marker or a digit; 10-12 are
  // reserved for the overlay's labels.
  graph.makeReplicate(new Given(graph.cells()[0], BLACK, ...DIGITS)),

  ...graph.rows().map((cells, i) => new NFA(distinctSpec, `R${i + 1}Distinct`, cells)),
  ...graph.columns().map((cells, i) => new NFA(distinctSpec, `C${i + 1}Distinct`, cells)),
  ...graph.rows().map(
    (cells, i) => new NFA(lineSpec(rowClues[i]), `R${i + 1}Sums`, cells)),
  ...graph.columns().map(
    (cells, i) => new NFA(lineSpec(columnClues[i]), `C${i + 1}Sums`, cells)),

  ...graph.cells().map(
    cell => new Pair(shadedKey, 'Shaded', cell, pent.at(cell))),
  ...noTouchOffsets.map(([a, b, rows, cols]) => pent.makeReplicate(
    new Pair(noTouchKey, 'NoTouch', a, b), targets(rows, cols))),

  // Exactly five cells carry each label, so the five cells a branch below pins
  // are the whole of that pentomino and nothing else can join it.
  new ContainExact(
    pentominoes.flatMap((_, i) => Array(5).fill(i + 1)).join('_'),
    ...pent.cells()),
  // One shape per label, placed somewhere: with all twelve labels used, the
  // blackened cells are the complete set of twelve pentominoes.
  ...pentominoes.map((cells, i) => new Or(
    placements(cells).map(spot => new And(
      spot.map(cell => new Given(pent.at(cell), i + 1)))))),
];
