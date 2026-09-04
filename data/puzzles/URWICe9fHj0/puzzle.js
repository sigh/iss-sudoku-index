// Title: Unknown Sandwich
// Author: Martin Regan
// Video: https://www.youtube.com/watch?v=URWICe9fHj0
// Source: https://cracking-the-cryptic.web.app/sudoku/m9mRgtN2jh

// Rules (from the video's on-screen rules panel, no rules text in the
// payload): Normal sudoku rules apply. Outside numbers give the sum of
// cells strictly between digits A and B in that row/column; A and B are
// the same two (undisclosed) digits for every outside clue in the puzzle
// -- a Mystery Sandwich clue. No arrow or shaft is drawn on any outside
// clue in the payload, so each reads its own row/column. Two of the three
// shaded tetromino shapes contain the same set of four digits; the third's
// set of four digits differs from that shared pair.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Givens.
const givens = [
  new Given('R2C1', 7), new Given('R2C6', 2),
  new Given('R3C3', 3),
  new Given('R4C3', 1),
  new Given('R5C8', 8),
  new Given('R7C5', 7),
  new Given('R8C2', 5), new Given('R8C9', 1),
];

// Two shared Var cells, VX and VY, hold the puzzle-wide Mystery Sandwich
// bread digits A and B. Every outside-clue NFA below reads them first (in
// that order) and rejects unless the second is strictly greater than the
// first -- a canonical low/high ordering, since the rules never distinguish
// "A" from "B". It then scans that lane's cells, transitioning out of
// "before" the first time it meets either bread digit, accumulating a
// clamped running sum while "between" until it meets the other one, then
// ignoring the rest of the lane. `mode` picks the accept test: 'eq' for an
// exact total, 'gt' for the one clue printed as an inequality (row 5's
// ">32"), where the clamp sink at target+1 exactly means "sum > target".
const bx = new Var('VX', 'mystery sandwich low bread digit', 1);
const by = new Var('VY', 'mystery sandwich high bread digit', 1);
const VX = bx.cells()[0];
const VY = by.cells()[0];

function mysterySandwichSpec(targetSum, mode) {
  const cap = targetSum + 1;
  return NFA.encodeSpec({
    startState: { stage: 'readX' },
    transition: (state, value) => {
      if (state.stage === 'readX') {
        return { stage: 'readY', targetX: value };
      }
      if (state.stage === 'readY') {
        if (value <= state.targetX) return undefined; // enforce VX < VY
        return { stage: 'before', targetX: state.targetX, targetY: value, sum: 0 };
      }
      if (state.stage === 'before') {
        if (value === state.targetX || value === state.targetY) {
          return { stage: 'between', targetX: state.targetX, targetY: state.targetY, sum: 0 };
        }
        return state;
      }
      if (state.stage === 'between') {
        if (value === state.targetX || value === state.targetY) {
          return { stage: 'after', sum: state.sum };
        }
        return {
          stage: 'between', targetX: state.targetX, targetY: state.targetY,
          sum: Math.min(state.sum + value, cap),
        };
      }
      return state; // stage === 'after': rest of the lane is irrelevant.
    },
    accept: (state) => state.stage === 'after' &&
      (mode === 'gt' ? state.sum === cap : state.sum === targetSum),
  }, 9);
}

function mysterySandwich(name, targetSum, laneCells, mode = 'eq') {
  return new NFA(mysterySandwichSpec(targetSum, mode), name, [VX, VY, ...laneCells]);
}

const rows = graph.rows();       // rows[r] = [R{r+1}C1 .. R{r+1}C9]
const columns = graph.columns(); // columns[c] = [R1C{c+1} .. R9C{c+1}]

// Outside clue values, drawn above C1/C3/C4/C6/C9 (overlays #0/#2/#3/#4/#5)
// and right of R1/R2/R5/R6/R7/R8/R9 (overlays #1/#6/#7/#8/#9/#10/#11).
const columnSandwiches = [
  mysterySandwich('column 1 mystery sandwich', 15, columns[0]),
  mysterySandwich('column 3 mystery sandwich', 16, columns[2]),
  mysterySandwich('column 4 mystery sandwich', 39, columns[3]),
  mysterySandwich('column 6 mystery sandwich', 13, columns[5]),
  mysterySandwich('column 9 mystery sandwich', 11, columns[8]),
];
const rowSandwiches = [
  mysterySandwich('row 1 mystery sandwich', 15, rows[0]),
  mysterySandwich('row 2 mystery sandwich', 12, rows[1]),
  mysterySandwich('row 5 mystery sandwich', 32, rows[4], 'gt'), // printed ">32"
  mysterySandwich('row 6 mystery sandwich', 24, rows[5]),
  mysterySandwich('row 7 mystery sandwich', 1, rows[6]),
  mysterySandwich('row 8 mystery sandwich', 12, rows[7]),
  mysterySandwich('row 9 mystery sandwich', 6, rows[8]),
];

// Shaded tetromino shapes (underlay layer, deepskyblue #34BBE6), partitioned
// into 3 orthogonally-connected 4-cell groups by their drawn adjacency.
const shapeA = ['R2C2', 'R2C3', 'R2C4', 'R2C5']; // I-tetromino, row 2
const shapeB = ['R5C7', 'R6C7', 'R6C8', 'R7C8']; // S-tetromino
const shapeC = ['R8C4', 'R8C5', 'R8C6', 'R9C5']; // T-tetromino, box (3,2)

// Shape A's cells already share row 2, and shape C's cells already share
// box (3,2), so normal sudoku already forces those two shapes' own 4 cells
// to be distinct. Shape B does not: R5C7 and R7C8 share no row, column, or
// box (R5C7 is box (2,3), R7C8 is box (3,3)), so its distinctness needs an
// explicit constraint.
const shapeBDistinct = new AllDifferent(...shapeB);

// "Two of the three shapes hold the same set of 4 digits; the third's set
// differs from that pair" is a 3-way disjunction over which shape is the
// odd one out. Each branch ties the matching pair with SameValues, and
// requires the odd shape to differ from that pair's set: since a same-size
// set that is not a superset cannot be equal, "differs" only needs some
// cell of the odd shape whose digit appears nowhere in the pair -- encoded
// as an Or of one 5-cell AllDifferent per candidate odd-shape cell (that
// cell plus the whole paired shape).
function differsFrom(oddShape, pairedShape) {
  return new Or(oddShape.map(cell => new AllDifferent(cell, ...pairedShape)));
}

const shapes = [shapeA, shapeB, shapeC];
const oddOneOutBranches = [];
for (let i = 0; i < 3; i++) {
  for (let j = i + 1; j < 3; j++) {
    const k = 3 - i - j; // the remaining shape index
    oddOneOutBranches.push(new And([
      new SameValues(2, ...shapes[i], ...shapes[j]),
      differsFrom(shapes[k], shapes[i]),
    ]));
  }
}
const tetrominoRule = new Or(oddOneOutBranches);

return [
  shape,
  ...givens,
  bx,
  by,
  ...columnSandwiches,
  ...rowSandwiches,
  shapeBDistinct,
  tetrominoRule,
];
