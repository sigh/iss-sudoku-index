// Title: A Knight's Mystery Sandwich
// Author: Doug Jelen
// Video: https://www.youtube.com/watch?v=F6HrcnnDagQ
// Source: https://app.crackingthecryptic.com/webapp/3D2JHNDjB7

// Rules (video description): normal sudoku rules apply. Identical digits
// cannot be a knight's move apart. Cages show the sum of their digits (no
// repeats within a cage). Clues outside the grid give the sum of the digits
// strictly between the cell holding digit X and the cell holding digit Y in
// that row/column, where X and Y are the same two (unknown) digits for
// every outside clue in the puzzle -- the solver must discover which two
// digits they are.
//
// Two shared Var cells, VX and VY, hold the puzzle-wide bread digits. Every
// outside-clue NFA below reads them first (in that order) and rejects unless
// the second is strictly greater than the first -- a canonical low/high
// ordering, since the rules never distinguish "X" from "Y". It then scans
// that lane's cells, transitioning out of "before" the first time it meets
// either bread digit, accumulating a clamped running sum while "between"
// until it meets the other one, then ignoring the rest of the lane.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

const bx = new Var('VX', 'mystery sandwich low bread digit', 1);
const by = new Var('VY', 'mystery sandwich high bread digit', 1);
const VX = bx.cells()[0];
const VY = by.cells()[0];

function mysterySandwichSpec(targetSum) {
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
          sum: Math.min(state.sum + value, targetSum + 1),
        };
      }
      return state; // stage === 'after': rest of the lane is irrelevant.
    },
    accept: (state) => state.stage === 'after' && state.sum === targetSum,
  }, 9);
}

function mysterySandwich(name, targetSum, laneCells) {
  return new NFA(mysterySandwichSpec(targetSum), name, [VX, VY, ...laneCells]);
}

const rows = graph.rows();    // rows[r] = [R{r+1}C1 .. R{r+1}C9]
const columns = graph.columns(); // columns[c] = [R1C{c+1} .. R9C{c+1}]

// Outside clue values, drawn left of R1/R6/R9 and above C2/C5/C7 (overlays
// #3/#4/#5 and #0/#1/#2 in the payload).
const rowSandwiches = [
  mysterySandwich('row 1 mystery sandwich', 7, rows[0]),
  mysterySandwich('row 6 mystery sandwich', 31, rows[5]),
  mysterySandwich('row 9 mystery sandwich', 36, rows[8]),
];
const columnSandwiches = [
  mysterySandwich('column 2 mystery sandwich', 13, columns[1]),
  mysterySandwich('column 5 mystery sandwich', 34, columns[4]),
  mysterySandwich('column 7 mystery sandwich', 21, columns[6]),
];

// Cages (7 drawn 2-cell killer cages: distinct digits summing to the total).
const cages = [
  new Cage(13, 'R2C2', 'R2C3'),
  new Cage(8, 'R7C1', 'R7C2'),
  new Cage(8, 'R8C1', 'R9C1'),
  new Cage(5, 'R8C3', 'R9C3'),
  new Cage(14, 'R8C7', 'R8C8'),
  new Cage(15, 'R9C7', 'R9C8'),
  new Cage(3, 'R2C9', 'R3C9'),
];

return [
  shape,
  new AntiKnight(),
  ...cages,
  bx,
  by,
  ...rowSandwiches,
  ...columnSandwiches,
];
