// Title: Japanese Sums With Pentominoes
// Author: Uhu
// Video: https://www.youtube.com/watch?v=oeYbtN8wGDQ
// Source: https://cracking-the-cryptic.web.app/sudoku/4RBQDTHFfn

// The playable board is the 12x12 block walled off inside the drawn 16x17
// canvas (canvas rows 5-16, columns 6-17); all coordinates below are the
// playable board's own. It has no givens -- every valued cell in the source
// sits in the margin and prints an outside-clue digit.
//
// Rules encoded here:
//  - Some cells are blackened; every other cell holds a digit 1-9.
//  - No digit occurs more than once in a row or column. Blackened cells are
//    not digits and may repeat, so the board is a Raw grid stating its own
//    row/column rule rather than a Sudoku grid.
//  - The numbers outside the grid give, in order, the sums of the maximal runs
//    of consecutive digit cells in that row or column.
//  - Clue digits 2, 3, 5 and 8 are printed outright; every other clue digit is
//    printed as a dot standing for one of 0, 1, 4, 6, 7, 9, and a two-digit
//    sum's leading digit is not 0.
//  - The blackened cells form twelve pentominoes, one congruent (under
//    rotation and reflection) to each of F I L N P T U V W X Y Z, and no two
//    of them touch, even diagonally.
//
// Two readings the drawing does not settle are encoded as disjunctions rather
// than resolved; both are described where they are built. Nothing is omitted.

const BLACK = 10;   // a blackened board cell
const EMPTY = 13;   // a piece-overlay cell whose board cell is not blackened
                    // (1..12 name the twelve pentominoes, in PIECES order)

// 13 values are needed for the piece overlay; board cells are restricted to
// 1..10 below. Raw because a row of 12 cells holds at most 9 digits plus
// repeatable blackened cells, so no implicit latin rule applies.
const shape = new Shape('12x12', '1-13', 'Raw');
const graph = cellGraph(shape);
const piece = graph.makeOverlay('VP');
const pieceVar = piece.toVar('Piece');

// The outside clues as drawn, one entry per margin cell, listed in drawn order
// (left to right beside a row, top to bottom above a column). '.' is a dot
// placeholder; a two-character entry is a two-digit sum.
const ROW_CLUES = [
  ['2', '.', '.'],
  ['.', '..', '.3', '.'],
  ['3', '.', '25', '5'],
  ['.', '.', '33'],
  ['22', '.', '2'],
  ['.2', '..', '..'],
  ['5', '.', '33'],
  ['.', '5', '25'],
  ['..', '2.'],
  ['.', '38'],
  ['.', '8', '3', '2', '..'],
  ['2', '.', '.5', '.2'],
];
const COL_CLUES = [
  ['2.', '3'],
  ['3.', '5'],
  ['.', '28'],
  ['.8', '..'],
  ['..', '.3', '3', '8'],
  ['.2', '2', '8', '.'],
  ['.5', '.3', '..'],
  ['3.'],
  ['22', '22'],
  ['.', '5', '.2', '.'],
  ['3', '..', '2.'],
  ['3.', '.2'],
];

// Above column 8 a second dot is drawn at the same horizontal offset as the
// dot of "3." but a third of a cell lower -- the only mark on the canvas off a
// margin-cell centre line. It reads as a mispositioned copy of that dot, but a
// second clue of its own is equally drawable, so column 8 takes both readings.
const COL8_ALTERNATIVE = ['3.', '.'];

const MAX_SUM = 45;              // 9+8+...+1, the largest possible block sum
const DOT_DIGITS = [0, 1, 4, 6, 7, 9];
const digitsOf = (ch) => ch === '.' ? DOT_DIGITS : [Number(ch)];

// The sums a printed clue can stand for.
const clueValues = (clue) => {
  if (clue.length === 1) {
    return digitsOf(clue).filter(v => v >= 1 && v <= MAX_SUM);
  }
  const values = [];
  for (const tens of digitsOf(clue[0])) {
    if (tens === 0) continue;    // "a two-digit sum cannot begin with a 0"
    for (const units of digitsOf(clue[1])) {
      const value = 10 * tens + units;
      if (value <= MAX_SUM) values.push(value);
    }
  }
  return values;
};

// Scans one line and matches its runs of digit cells against the clue list.
// State: `done` runs already closed and accepted, `sum` the running total of
// the run in progress (0 between runs). A run closes at the next blackened
// cell, or at the end of the line via accept(). The running total is bounded
// by the largest sum the current clue allows, which keeps the state count to
// roughly 45 per clue.
const sumsSpec = (clues) => {
  const allowed = clues.map(clue => new Set(clueValues(clue)));
  const largest = allowed.map(values => Math.max(...values));
  const numClues = clues.length;
  return NFA.encodeSpec({
    startState: { done: 0, sum: 0 },
    transition: ({ done, sum }, value) => {
      if (value > BLACK) return undefined;      // overlay-only values
      if (value === BLACK) {
        if (sum === 0) return { done, sum: 0 };
        return allowed[done].has(sum) ? { done: done + 1, sum: 0 } : undefined;
      }
      if (done >= numClues) return undefined;   // a run beyond the last clue
      const next = sum + value;
      return next <= largest[done] ? { done, sum: next } : undefined;
    },
    accept: ({ done, sum }) => sum === 0
      ? done === numClues
      : done === numClues - 1 && allowed[done].has(sum),
  }, shape);
};

// The rules say the outside numbers are given "in the correct order", but
// nothing drawn says which end of a clue stack is the first block: the stacks
// are packed against the grid under either order. So each line takes the
// disjunction of the two block orders, applied by reversing the cells rather
// than the clue list. A palindromic clue list needs only one branch.
const lineConstraints = (clueReadings, cells, name) => {
  const branches = [];
  const seen = new Set();
  for (const clues of clueReadings) {
    for (const order of [cells, [...cells].reverse()]) {
      const key = `${clues.join('|')}@${order[0]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      branches.push(new NFA(sumsSpec(clues), name, ...order));
    }
  }
  return branches.length === 1 ? branches[0] : new Or(branches);
};

// Two board cells in the same row or column may share a value only when both
// are blackened.
const distinctKey = Pair.fnToKey((a, b) => a !== b || a === BLACK, shape);
// A board cell is blackened exactly when its overlay cell names a pentomino.
const linkKey = Pair.fnToKey((a, b) => (a === BLACK) === (b <= 12), shape);
// Two king-adjacent overlay cells may not name different pentominoes: pieces
// do not touch, even diagonally. Applied to orthogonal neighbours too, it also
// makes each piece's cells one orthogonally connected group.
const noTouchKey = Pair.fnToKey(
  (a, b) => a === EMPTY || b === EMPTY || a === b, shape);

// The twelve free pentominoes, each as one orientation's [row, col] offsets.
const PIECES = {
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

const normalize = (offsets) => {
  const top = Math.min(...offsets.map(o => o[0]));
  const left = Math.min(...offsets.map(o => o[1]));
  return offsets.map(([r, c]) => [r - top, c - left])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
};

// The distinct images of a piece under the eight rotations and reflections.
const orientations = (offsets) => {
  const distinct = new Map();
  for (const reflected of [offsets, offsets.map(([r, c]) => [r, -c])]) {
    let image = reflected;
    for (let turn = 0; turn < 4; turn++) {
      image = image.map(([r, c]) => [c, -r]);
      const canonical = normalize(image);
      distinct.set(JSON.stringify(canonical), canonical);
    }
  }
  return [...distinct.values()];
};

// Every way one piece can sit on the board: its shape and size make the
// candidate set finite (6388 placements over all twelve), which is what lets
// "this region is congruent to that shape" be stated at all.
const placements = (offsets) => {
  const cellSets = [];
  for (const image of orientations(offsets)) {
    const height = Math.max(...image.map(o => o[0])) + 1;
    const width = Math.max(...image.map(o => o[1])) + 1;
    for (let top = 1; top + height - 1 <= 12; top++) {
      for (let left = 1; left + width - 1 <= 12; left++) {
        cellSets.push(
          image.map(([r, c]) => makeCellId(top + r, left + c)));
      }
    }
  }
  return cellSets;
};

const pieceNames = Object.keys(PIECES);
const overlayCells = piece.at(graph.cells());

// Replicate targets: cells for which the shifted template stays on the board.
const gridCells = graph.cells();
const upTo = (maxRow, maxCol) => gridCells.filter(
  cell => parseCellId(cell).row <= maxRow && parseCellId(cell).col <= maxCol);
const noTouchTemplate = (aRow, aCol, bRow, bCol) => new Pair(
  noTouchKey, 'notouch',
  pieceVar.cell(aRow, aCol), pieceVar.cell(bRow, bCol));

return [
  shape,
  pieceVar,

  // Board cells hold a digit or the blackened marker; 11-13 are overlay-only.
  graph.makeReplicate(
    new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),

  ...graph.rows().map(
    (cells, i) => new PairX(distinctKey, `row${i + 1}`, ...cells)),
  ...graph.columns().map(
    (cells, i) => new PairX(distinctKey, `col${i + 1}`, ...cells)),

  ...ROW_CLUES.map((clues, i) => lineConstraints(
    [clues], graph.row(i + 1), `rowsum${i + 1}`)),
  ...COL_CLUES.map((clues, i) => lineConstraints(
    i === 7 ? [clues, COL8_ALTERNATIVE] : [clues],
    graph.column(i + 1), `colsum${i + 1}`)),

  ...gridCells.map(cell => new Pair(linkKey, 'black', cell, piece.at(cell))),

  piece.makeReplicate(noTouchTemplate(1, 1, 1, 2), piece.at(upTo(12, 11))),
  piece.makeReplicate(noTouchTemplate(1, 1, 2, 1), piece.at(upTo(11, 12))),
  piece.makeReplicate(noTouchTemplate(1, 1, 2, 2), piece.at(upTo(11, 11))),
  piece.makeReplicate(noTouchTemplate(1, 2, 2, 1), piece.at(upTo(11, 11))),

  // Exactly five cells carry each piece's label, so no stray cell can also
  // claim it once the placement below has pinned that piece's five.
  ...pieceNames.map((name, i) => new ContainExact(
    Array(5).fill(i + 1).join('_'), ...overlayCells)),

  // Each piece occupies one of its placements.
  ...pieceNames.map((name, i) => new Or(
    placements(PIECES[name]).map(cells => new And(
      cells.map(cell => new Given(piece.at(cell), i + 1)))))),
];
